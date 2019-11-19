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

    console.log('chapters', chapters);

    // return MChapter.iterate(scraper, _lazy(chapters.slice(0, 3)));
  },

  /**
   * @description
   * Downloads only non-existent manga chapters
   * in <outDir> directory by lazy chapter iteration.
   */
  async latest (config) {
    const scraper = MScraper.get(config);
    console.log('SCRAPER', scraper);
    const chapters = await MChapter.getLatest(scraper);

    // return MChapter.iterate(scraper, _lazy(chapters));
  }
};