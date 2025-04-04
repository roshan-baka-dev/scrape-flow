'use client';
// import { runWorkflow } from '@/actions/runWorkflow';
import { PublishWorkflow } from '@/actions/workflows/publishWorkflow';
import { Button } from '@/components/ui/button';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import { DownloadIcon, PlayIcon, UploadIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { UnpublishWorkflow } from '@/actions/workflows/UnpublishWorkflow';

export default function PublishBtn({ workflowId }: { workflowId: string }) {
  const mutation = useMutation({
    mutationFn: UnpublishWorkflow,
    onSuccess: () => {
      toast.success('Workflow unpublished', { id: workflowId });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Something went wrong', { id: workflowId });
    },
  });

  return (
    <Button
      variant={'outline'}
      className='flex items-center gap-2'
      disabled={mutation.isError}
      onClick={() => {
        toast.loading('Unpublishing workflow...', { id: workflowId });

        mutation.mutate(workflowId);
      }}
    >
      <DownloadIcon size={16} className='stroke-orange-400' /> Unpublish
    </Button>
  );
}
