'use server';
import { prisma } from '@/lib/prisma';
import { workflowStatus } from '@/types/workflows';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
export async function UnpublishWorkflow(id: string) {
  const { userId } = auth();
  if (!userId) {
    throw new Error('unathenticated');
  }
  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!workflow) {
    throw new Error('workflow not found');
  }
  if (workflow.status !== workflowStatus.PUBLISHED) {
    throw new Error('workflow is not published');
  }
  await prisma.workflow.update({
    where: {
      id,
      userId,
    },
    data: {
      status: workflowStatus.DRAFT,
      executionPlan: null,
      creditsCost: 0,
    },
  });
  revalidatePath(`/workflow/editor/${id}`);
}
