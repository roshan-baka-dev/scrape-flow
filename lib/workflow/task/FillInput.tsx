import { TaskParamType, TaskType } from '@/types/task';
import { WorkflowTask } from '@/types/workflows';
import { CodeIcon, Edit3Icon, GlobeIcon, LucideProps } from 'lucide-react';

export const FillInputTask = {
  type: TaskType.FILL_INPUT,
  label: 'Fill input',
  icon: (props) => <Edit3Icon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Web Page',
      type: TaskParamType.BROWSER_INSTANCE,
      require: true,
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      require: true,
    },
    {
      name: 'Value',
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
