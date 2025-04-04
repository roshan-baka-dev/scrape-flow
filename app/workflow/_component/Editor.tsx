'use client';
import { workflow } from '@prisma/client';
import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import FlowEditor from './FlowEditor';
import Topbar from '@/app/workflow/_component/topbar/Topbar';
import TaskMenu from './TaskMenu';
import { FlowValidationContextProvider } from '@/components/context/FlowValidationContext';
import { workflowStatus } from '@/types/workflows';
function Editor({ workflow }: { workflow: workflow }) {
  //   return <div>Editor</div>;
  return (
    <FlowValidationContextProvider>
      <ReactFlowProvider>
        <div className='flex flex-col h-full w-full overflow-hidden '>
          <Topbar
            title='Workflow editor'
            subtitle={workflow.name}
            workflowId={workflow.id}
            isPublished={workflow.status === workflowStatus.PUBLISHED}
          />
          <div className='flex h-full overflow-auto'>
            <TaskMenu />
            <FlowEditor workflow={workflow} />
          </div>
        </div>
      </ReactFlowProvider>
    </FlowValidationContextProvider>
  );
}

export default Editor;
