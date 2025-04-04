import { TaskParamType, TaskType } from '@/types/task';
import { WorkflowTask } from '@/types/workflows';
import {
  CodeIcon,
  GlobeIcon,
  LucideProps,
  MousePointerClickIcon,
  PointerIcon,
  TextIcon,
} from 'lucide-react';

export const ClickElementTask = {
  type: TaskType.CLICK_ELEMENT,
  label: 'Click element',
  icon: (props: LucideProps) => (
    <MousePointerClickIcon className='stroke-orange-400' {...props} />
  ),
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'web page',
      type: TaskParamType.BROWSER_INSTANCE,
      require: true,
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      require: true,
    },
  ] as const,
  outputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
} satisfies WorkflowTask;
