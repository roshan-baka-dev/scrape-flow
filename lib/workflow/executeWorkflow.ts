import 'server-only';
import { prisma } from '../prisma';
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from '@/types/workflows';
import { revalidatePath } from 'next/cache';
import { waitFor } from '../helper/waitFor';
import { ExecutionPhase } from '@prisma/client';
import { AppNode } from '@/types/appNode';
import { TaskRegistry } from './task/registry';
import { ExecutorRegistry } from './executor/registry';
import { Environment, ExecutionEnviroment } from '@/types/executor';
import { LaunchBrowserTask } from './task/LaunchBrowser';
import { TaskParamType } from '@/types/task';
import { Browser, Page } from 'puppeteer';
import { Edge } from '@xyflow/react';
import { LogCollector } from '@/types/log';
import { createLogCollector } from '../log';

export async function ExecuteWorkflow(executionId: string, nextRunAt?: Date) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { workflow: true, phases: true },
  });

  if (!execution) {
    throw new Error('execution not found');
  }

  const edges = JSON.parse(execution.definition).edges as Edge[];

  const enviroment: Environment = { phases: {} };

  await initializeWorkflowExecution(
    executionId,
    execution.workflowId,
    nextRunAt
  );
  await initializePhaseStatuses(execution);

  let creditsConsumed = 0;
  let executionFailed = false;
  for (const phase of execution.phases) {
    // TODO:execute phase
    // await waitFor(3000);
    const phaseExecution = await executeWorkflowPhase(
      phase,
      enviroment,
      edges,
      execution.userId
    );

    creditsConsumed += phaseExecution.creditsConsumed;
    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }
  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );
  // todo:final
  await cleanupEnviroment(enviroment);
  revalidatePath('/workflows/runs');
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string,
  nextRunAt?: Date
) {
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
      ...(nextRunAt && { nextRunAt }),
    },
  });
}

async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    .catch((err) => {});
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  enviroment: Environment,
  edges: Edge[],
  userId: string
) {
  const logCollector = createLogCollector();
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;

  setupEnvironmentForPhase(node, enviroment, edges);

  // Update phase status
  await prisma.executionPhase.update({
    where: { id: phase.id },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(enviroment.phases[node.id].inputs),
    },
  });
  const creditsRequired = TaskRegistry[node.data.type].credits;

  let success = await decrementCredits(userId, creditsRequired, logCollector);

  const creditsConsumed = success ? creditsRequired : 0;

  if (success) {
    success = await executePhase(phase, node, enviroment, logCollector);
  }

  const outputs = enviroment.phases[node.id].outputs;
  await finalizePhase(
    phase.id,
    success,
    outputs,
    logCollector,
    creditsConsumed
  );
  return { success, creditsConsumed };
}

async function finalizePhase(
  phaseId: string,
  success: boolean,
  outputs: any,
  logCollector: LogCollector,
  creditsConsumed: number
) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;

  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      creditsConsumed,
      logs: {
        createMany: {
          data: logCollector.getAll().map((log) => ({
            message: log.message,
            timestamp: log.timestamp,
            logLevel: log.level,
          })),
        },
      },
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  enviroment: Environment,
  logCollector: LogCollector
): Promise<boolean> {
  await waitFor(1500);
  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    logCollector.error(`not found executor for ${node.data.type}`);
    return false;
  }

  const executionEnviroment: ExecutionEnviroment<any> =
    createExecutionEnvironment(node, enviroment, logCollector);

  return await runFn(executionEnviroment);
}

function setupEnvironmentForPhase(
  node: AppNode,
  environment: Environment,
  edges: Edge[]
) {
  environment.phases[node.id] = { inputs: {}, outputs: {} };
  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name
    );

    if (!connectedEdge) {
      console.error('Missing edge for input', input.name, 'node id:', node.id);
      continue;
    }
    const outputValue =
      environment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle!
      ];

    environment.phases[node.id].inputs[input.name] = outputValue;
  }
}

function createExecutionEnvironment(
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector
): ExecutionEnviroment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],
    setOutput: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },

    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => (environment.browser = browser),

    getPage: () => environment.page,
    setPage: (page: Page) => (environment.page = page),

    log: logCollector,
  };
}

async function cleanupEnviroment(enviroment: Environment) {
  if (enviroment.browser) {
    await enviroment.browser
      .close()
      .catch((err) => console.error('cannot close browser,reason:', err));
  }
}

async function decrementCredits(
  userId: string,
  amount: number,
  logCollector: LogCollector
) {
  try {
    await prisma.userBalance.update({
      where: {
        userId,
        credits: {
          gte: amount,
        },
      },
      data: {
        credits: { decrement: amount },
      },
    });
    return true;
  } catch (error) {
    logCollector.error('Insufficient balance');
    // user does not have sufficient balance
    return false;
  }
}
