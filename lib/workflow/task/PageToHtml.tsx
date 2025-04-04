import { TaskParamType, TaskType } from '@/types/task';
import { WorkflowTask } from '@/types/workflows';
import { CodeIcon, GlobeIcon, LucideProps } from 'lucide-react';

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  label: 'Get html to page',
  icon: (props: LucideProps) => (
    <CodeIcon className='stroke-rose-400' {...props} />
  ),
  isEntryPoint: false,
  credits: 5,
  inputs: [
    {
      name: 'Web Page',
      type: TaskParamType.BROWSER_INSTANCE,
      require: true,
    },
  ] as const,
  outputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
    },
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
} satisfies WorkflowTask;
