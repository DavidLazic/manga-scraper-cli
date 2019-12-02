import { resolve } from 'path';
import inquirer from 'inquirer';

import { MDownload } from '@modules';
import { PROVIDERS } from '@config/providers';
import { QUESTIONS } from './cli.questions';
import { TOptions, IProvider, IScraper } from '../../types';
import { HttpService } from '@services';

export namespace CLIService {

  /**
   * @description
   * Creates scraper config
   */
  export const config = ({ selected, provider, outDir }: any): IScraper => ({
    name: selected.name,
    id: provider.id,
    outDir,
    ...(PROVIDERS.find(entry => entry.src === provider.name))
  });

  export namespace list {
    
    /**
     * @description
     * Returns list of supported providers' URLs.
     */
    export const providers = async (): Promise<string[]> =>
      PROVIDERS
        .map((provider: IProvider) => provider.src);

    /**
     * @description
     * Returns list of default entries and merged entries provided with --database flag.
     */
    export const entries = async ({ url }: TOptions): Promise<any[]> => {
      const { entries = [] } = url && (
        url.includes('http')
          ? await HttpService.get(url, 'json')
          : require(`${resolve(url)}`)
      );

      return [ ...entries ];
    };
  }

  /**
   * @description
   * Creates scraper config through dynamic questions.
   */
  export const download = async ({ url }: TOptions): Promise<void> => {
    const entries = await CLIService.list.entries({ url });

    const { name: selected } = await inquirer.prompt(QUESTIONS.manga(entries));
    const { type, ...answers } = await inquirer.prompt(QUESTIONS.config(selected));

    return MDownload.onDownload(type, CLIService.config({ selected, ...answers }));
  }
}