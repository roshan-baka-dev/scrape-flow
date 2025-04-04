import { getAppUrl } from '@/lib/helper/appUrl';
import { prisma } from '@/lib/prisma';
import { workflowStatus } from '@/types/workflows';
// import { NextRequest } from 'next/server';

export async function GET(request: Request) {
  const now = new Date();

  const workflows = await prisma.workflow.findMany({
    select: {
      id: true,
    },
    where: {
      status: workflowStatus.PUBLISHED,
      cron: { not: null },
      nextRunAt: {
        lte: now,
      },
    },
  });
  console.log('@@workflow to run', workflows.length);
  for (const workflow of workflows) {
    triggerWorkflow(workflow.id);
  }
  return Response.json({ workflowsToRun: workflows.length }, { status: 200 });
}

function triggerWorkflow(wofkflowId: string) {
  const triggerApiUrl = getAppUrl(
    `api/workflows/execute?workflowId=${wofkflowId}`
  );

  console.log('@@TRIGGER URL', triggerApiUrl);

  fetch(triggerApiUrl, {
    headers: {
      authorization: `Bearer ${process.env.API_SECRET!}`,
    },
    cache: 'no-store',
  })
    .then((res) => {
      console.log(res);
    })
    .catch((error: any) => {
      console.error(
        'Error triggering workflow with id',
        wofkflowId,
        ':error->',
        error.message
      );
    });
}
