import { TaskType } from '@/types/task';
import { LaunchBrowserExecutor } from './LaunchBrowserExecutor';
import { PageToHtmlExecutor } from './PageToHtmlExecutor';
import { ExecutionEnviroment } from '@/types/executor';
import { WorkflowTask } from '@/types/workflows';
import { ExtractTextFromElementExecutor } from './ExtractTextFromElementExecutor';
import { FillInputExecutor } from './FilInputExecutor';
import { ClickElementExecutor } from './ClickElementExecutor';
import { WaitForElementExecutor } from './WaitForElementExecuter';

type ExecutorFn<T extends WorkflowTask> = (
  environment: ExecutionEnviroment<T>
) => Promise<boolean>;

type RegistryType = {
  [K in TaskType]: ExecutorFn<WorkflowTask & { type: K }>;
};

export const ExecutorRegistry: RegistryType = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
  FILL_INPUT: FillInputExecutor,
  CLICK_ELEMENT: ClickElementExecutor,
  WAIT_FOR_ELEMENT: WaitForElementExecutor,
};
