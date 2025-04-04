import { ExecutionEnviroment } from '@/types/executor';
import { FillInputTask } from '../task/FillInput';
import { waitFor } from '@/lib/helper/waitFor';
import { ClickElementTask } from '../task/ClickElement';
import { WaitForElementTask } from '../task/WaitForElement';

export async function WaitForElementExecutor(
  enviroment: ExecutionEnviroment<typeof WaitForElementTask>
): Promise<boolean> {
  try {
    const selector = enviroment.getInput('Selector');
    if (!selector) {
      enviroment.log.error('input->selector not defined');
    }
    const visibility = enviroment.getInput('Visibility');
    if (!visibility) {
      enviroment.log.error('input->Visibility not defined');
    }

    await enviroment.getPage()!.waitForSelector(selector, {
      visible: visibility === 'visible',
      hidden: visibility === 'hidden',
    });
    enviroment.log.info(`Element ${selector} became: ${visibility}`);

    return true;
  } catch (error: any) {
    enviroment.log.error(error);
    return false;
  }
}
