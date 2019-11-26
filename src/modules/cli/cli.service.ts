import chalk from 'chalk';
import { resolve } from 'path';
import inquirer from 'inquirer';

import { DownloadService } from '@services';
import { PROVIDERS } from '@config/providers';
import DB from '@db/db.json';
import { QUESTIONS } from './cli.questions';
import { TOptions, TProvider, IScraper } from '../../types';

export namespace CLIService {

  /**
   * @description
   * Creates scraper config
   */
  export const config = ({ selected, provider, outDir }: any): IScraper => ({
    name: selected.name,
    id: provider.id,
    outDir,
    ...(PROVIDERS as { [key: string]: TProvider })[provider.name]
  });

  export namespace list {
    
    /**
     * @description
     * Returns list of supported providers' name and URLs.
     */
    export const providers = async (): Promise<any[]> =>
      Object
        .keys(PROVIDERS)
        .map((provider: string) => ({
          name: provider,
          url: PROVIDERS[provider].src
        }));

    /**
     * @description
     * Returns list of default entries and merged entries provided with --database flag.
     */
    export const entries = async ({ database }: TOptions): Promise<any[]> => {
      const { entries = [] } = database && require(`${resolve(database)}`);

      return [ ...DB.entries, ...entries ];
    };
  }

  /**
   * @description
   * Creates scraper config through dynamic questions.
   */
  export const download = async ({ database }: TOptions): Promise<void> => {
    const entries = await CLIService.list.entries({ database });
    const providers = await CLIService.list.providers();
    
    const { name: selected } = await inquirer.prompt(QUESTIONS.manga(entries));
    const { type, ...answers } = await inquirer.prompt(QUESTIONS.config(selected));

    const config = CLIService.config({ selected, ...answers });
    return (<any>DownloadService)[type](config);
  }
}