import { PROVIDERS } from '@config/providers';
import { MANGA } from '@config/mangas';

export const MScraper: IMScraper = {

  /**
   * @description
   * Creates scraper config
   * by selecting manga and provider configs by name
   */
  get: ({
    name,
    provider,
    outDir = 'export'
  }) => ({
    name: MANGA[name].name,
    outDir,
    ...MANGA[name].providers[provider],
    ...PROVIDERS[provider]
  })
};