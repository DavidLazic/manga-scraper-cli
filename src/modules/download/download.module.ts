
import { _lazy, _partition, _abortable } from '@lib/helpers';
import { DownloadService } from './download.service';
import { IScraper, IImage } from '../../types';

export namespace MDownload {

  /**
   * @description
   * Downloads all manga chapters by lazy chapter iteration.
   */
  export const onDownload = async (type: string, scraper: IScraper): Promise<any> => {
    const chapters = await (<any>DownloadService)[type](scraper);

    return MDownload.iterate(scraper, _lazy(chapters));
  };

  /**
   * @description
   * Throttles download requests by doing lazy chapter iteration.
   */
  export const iterate = async (
    scraper: IScraper,
    iterator: IterableIterator<object>,
    ERR_BUFFER: IImage[] = []
  ): Promise<any> => {
    const { value: url, done } = iterator.next();

    if (done) {
      return ERR_BUFFER.length
        ? (
          console.log(`[Retrying skipped]: ${ERR_BUFFER.length} items: `, ERR_BUFFER),
          MDownload.retry(ERR_BUFFER)
        )
        : console.log('[Done]')
    }

    const chapter = await DownloadService.getChapter(scraper, url);
    console.log('[Downloading]: ', chapter);

    const { pass, fail } = await DownloadService.getImages(scraper, chapter);

    await DownloadService.save(pass);

    return MDownload.iterate(scraper, iterator, [ ...ERR_BUFFER, ...fail ] );
  }


  /**
   * @description
   * Retries fetching all failed image buffers from <ERR_BUFFER>
   */
  export const retry = async (ERR_BUFFER: IImage[] = []): Promise<any> => {
    const { pass, fail } = await DownloadService.getBuffers(ERR_BUFFER);

    await DownloadService.save(pass);

    return fail.length
      ? console.log(`[Failed Downloading]: ${ERR_BUFFER.length} items: `, ERR_BUFFER)
      : console.log('[Done]')
  }
}