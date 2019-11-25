import chalk from 'chalk';
import { isAbsolute } from 'path';

import { PROVIDERS } from '@config/providers';
import DB from '@db/db.json';
import { TOptions } from '../../types';

export namespace CLIService {

  export namespace list {

    export const providers = async (): Promise<object[]> =>
      Object
        .keys(PROVIDERS)
        .map((provider: string) => ({
          name: provider,
          url: PROVIDERS[provider].src
        }));

    export const entries = async ({ database }: TOptions): Promise<any> => {
      const { entries = [] } = database && isAbsolute(database) && require(`${database}`);

      console.log('[Current Entries]: ', '\n');

      [
        ...DB.entries,
        ...entries
      ].forEach(entry => console.log(entry));
    }
  }

  export const download = ({ database }: any): void => {
    const { entries = [] } = database && isAbsolute(database) && require(`${database}`);
  }
}