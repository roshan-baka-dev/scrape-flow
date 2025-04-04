import { ExecutionEnviroment } from '@/types/executor';
import { FillInputTask } from '../task/FillInput';
import { waitFor } from '@/lib/helper/waitFor';
import { ClickElementTask } from '../task/ClickElement';

export async function ClickElementExecutor(
  enviroment: ExecutionEnviroment<typeof ClickElementTask>
): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector');
    if (!selector) {
      enviroment.log.error('input->selector not defined');
    }

    await enviroment.getPage()!.click(selector);
    return true;
  } catch (error: any) {
    enviroment.log.error(error);
    return false;
  }
}
