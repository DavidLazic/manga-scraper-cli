import { MChapter } from '@modules';
import { _lazy } from '@lib/helpers';
import { IScraper } from '../../types';

export namespace DownloadService {

  /**
   * @description
   * Downloads all manga chapters by lazy chapter iteration.
   */
  export const all = async (scraper: IScraper): Promise<any> => {
    console.log('SCRAPER', scraper);
    const chapters = await MChapter.getAll(scraper);

    return MChapter.iterate(scraper, _lazy(chapters.slice(0, 3)));
  }

  /**
   * @description
   * Downloads only non-existent manga chapters
   * in <outDir> directory by lazy chapter iteration.
   */
  export const latest = async (scraper: IScraper): Promise<any> => {
    console.log('SCRAPER', scraper);
    const chapters = await MChapter.getLatest(scraper);

    return MChapter.iterate(scraper, _lazy(chapters));
  }
}