import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/GetWorkflowExecutionWithPhases';
import Topbar from '@/app/workflow/_component/topbar/Topbar';
import { waitFor } from '@/lib/helper/waitFor';
import { auth } from '@clerk/nextjs/server';
import { Loader2Icon } from 'lucide-react';
import { Suspense } from 'react';
import ExecutionViewer from './_component/ExecutionViewer';

export default function ExecutionViewerPage({
  params,
}: {
  params: {
    executionId: string;
    workflowId: string;
  };
}) {
  return (
    <div className='flex flex-col h-screen w-full overflow-hidden'>
      <Topbar
        workflowId={params.workflowId}
        title='workflow run details'
        subtitle={`Run ID: ${params.executionId}`}
        hideButtons
      />

      <section className='flex h-full overflow-auto'>
        <Suspense
          fallback={
            <div className='flex w-full items-center justify-center'>
              <Loader2Icon className='h-10 w-10 animate-spin stroke-primary' />
            </div>
          }
        >
          <ExecutionViewerWrapper executionId={params.executionId} />
        </Suspense>
      </section>
    </div>
  );
}

async function ExecutionViewerWrapper({
  executionId,
}: {
  executionId: string;
}) {
  //   await waitFor(5000);
  //   const { userId } = auth();
  //   if (!userId) {
  //     return <div>unauthorised</div>;
  //   }

  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
  if (!workflowExecution) return <div>Not Found</div>;

  return <ExecutionViewer initialData={workflowExecution} />;
}
