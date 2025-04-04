import { TaskParamType, TaskType } from '@/types/task';
import { WorkflowTask } from '@/types/workflows';
import {
  CodeIcon,
  EyeIcon,
  GlobeIcon,
  LucideProps,
  MousePointerClickIcon,
  PointerIcon,
  TextIcon,
} from 'lucide-react';

export const WaitForElementTask = {
  type: TaskType.WAIT_FOR_ELEMENT,
  label: 'Wait for element',
  icon: (props: LucideProps) => (
    <EyeIcon className='stroke-amber-400' {...props} />
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
    {
      name: 'Visibility',
      type: TaskParamType.SELECT,
      require: true,
      hideHandle: true,
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' },
      ],
    },
  ] as const,
  outputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
} satisfies WorkflowTask;
