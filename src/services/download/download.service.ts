import { MScraper, MChapter } from '@modules';
import { _lazy } from '@lib/helpers';

export const DownloadService: ISDownload = {

  /**
   * @description
   * Downloads all manga chapters by lazy chapter iteration.
   */
  async all (config) {
    const scraper = MScraper.get(config);
    console.log('SCRAPER', scraper);
    const chapters = await MChapter.getAll(scraper);

    return MChapter.iterate(scraper, _lazy(chapters));
  },

  latest () {

  }
};