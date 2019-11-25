import { PROVIDERS } from '@config/providers';
import DB from '@db/db.json';
import { TSDownload, IScraper, TProvider, TEntry } from '../../types';

export module MScraper {
  
  /**
   * @description
   * Creates scraper config
   * by selecting manga and provider configs by name
   */
  export const get = ({ name, provider, outDir = 'export' }: TSDownload): IScraper => {
    const manga: TEntry = DB.entries.find(entry => entry.name === name);

    return {
      name: manga.name,
      outDir,
      ...manga.providers[provider],
      ...(PROVIDERS as { [key: string]: TProvider })[provider]
    };
  }
}