// import { waitFor } from '@/lib/helper/waitFor';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import Editor from '../../_component/Editor';

async function page({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;
  const { userId } = auth();
  if (!userId) return <div>unauthorised</div>;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  });
  if (!workflow) {
    return <div>workflow not found</div>;
  }
  // return <pre>{JSON.stringify(workflow, null, 4)}</pre>;
  return <Editor workflow={workflow} />;
}

export default page;
