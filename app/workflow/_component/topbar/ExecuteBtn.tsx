'use client';

import { RunWorkflow } from '@/actions/workflows/runWorkflow';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import { PlayIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

function ExecuteBtn({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();

  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationFn: RunWorkflow,
    onSuccess: () => {
      toast.success('Execution started', { id: 'flow-execution' });
    },
    onError: () => {
      toast.error('Something went wrong', { id: 'flow-execution' });
    },
  });
  return (
    <Button
      variant={'outline'}
      className='flex items-center gap-2'
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate();
        if (!plan) {
          // client side validation
          return;
        }

        mutation.mutate({
          workflowId: workflowId,
          flowDefiniton: JSON.stringify(toObject()),
        });
        // console.log('----plan----');
        // console.table(plan);
      }}
    >
      <PlayIcon size={16} className='stroke-orange-400' />
      Execute
    </Button>
  );
}

export default ExecuteBtn;
