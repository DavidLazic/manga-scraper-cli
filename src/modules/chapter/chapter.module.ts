import { JSDOM } from 'jsdom';
import mkdirp from 'mkdirp-promise';
const fs = require('fs').promises;
import * as path from 'path';

import { HttpService } from '@services';
import { _lazy, _partition, _abortable } from '@lib/helpers';
import { ROOT } from '@config/root';

export const MChapter: IMChapter = {

  /**
   * @description
   * Creates file system <PATH>
   * Images will be saved per manga <OUT_DIR>/<MANGA_NAME>/<CHAPTER_TITLE> directory
   */
  dir: ({ name, outDir }, title) =>
    path.join(ROOT, outDir, name, title),

  /**
   * @description
   * Fetches current chapter URL and creates <TChapter>.
   */
  get: async (scraper, url) => {
    const chapter = await HttpService.fetch(url);
    const { document } = (new JSDOM(chapter)).window;
    const title = scraper.chapter.title(document);
    const dir = MChapter.dir(scraper, title);
  
    return { url, dir, document };
  },

  /**
   * @description
   * Fetches all chapter URLs.
   */
  getAll: async scraper => {
    const res = await HttpService.fetch(scraper.url(scraper));
    const { document } = (new JSDOM(res)).window;
  
    return scraper.chapter.getAll(document);
  },

  /**
   * @description
   * Fetches all chapter images and creates image buffers.
   */
  images: (scraper, chapter) =>
    Promise.all(
      scraper.chapter
        .get(chapter.document)
        .map(async (url: string): Promise<TImage> => {
          const temp = url.split('/');
          const fileName = temp[temp.length - 1];
          const dir = path.join(chapter.dir, fileName);
          const abortable = await _abortable(HttpService.fetch, { params: [url, 'buffer'] });

          abortable.clear();

          return { buffer: abortable.res, url, dir, chapter };
        })
  ),

  /**
   * @description
   * Throttles download requests by doing lazy chapter iteration.
   */
  iterate: async (scraper, iterator, ERR_BUFFER = []) => {
    const { value: url, done } = iterator.next();

    if (done) {
      return ERR_BUFFER.length
        ? (
          console.log(`[Retrying skipped]: ${ERR_BUFFER.length} items: `, ERR_BUFFER),
          MChapter.retry(scraper, _lazy(ERR_BUFFER))
        )
        : console.log('[Done]')
    }

    const chapter = await MChapter.get(scraper, url);
    console.log('[Downloading]: ', chapter);

    const images = await MChapter.images(scraper, chapter);
    const { pass, fail } = _partition(images, (image: TImage) => !!image.buffer);

    await MChapter.save(chapter, pass);

    return MChapter.iterate(scraper, iterator, [ ...ERR_BUFFER, ...fail ] );
  },

  /**
   * @description
   * Retries fetching all failed image buffers from <scraper.ERR_BUFFER>
   */
  retry: async (scraper, iterator, ERR_RETRY = []) => {
    const { value, done } = iterator.next();

    if (done) {
      return ERR_RETRY.length
        ? console.log(`[Failed Downloading]: ${ERR_RETRY.length} items: `, ERR_RETRY)
        : console.log('[Done]')
    }

    const abortable = await _abortable(HttpService.fetch, { params: [value.url, 'buffer'] });
    abortable.clear();

    const image = { ...value, buffer: abortable.res };

    if (abortable.res) {
      await MChapter.save(value.chapter, [ image ]);
    }

    return MChapter.retry(scraper, iterator, [ ...ERR_RETRY, ...image ]);
  },

  /**
   * @description
   * Creates chapter directory and
   * saves all fetched image buffers per <PATH> string
   */
  save: async (chapter, images) => {
    try {
      await mkdirp(chapter.dir);

      return await Promise.all(
        images
          .map(async image =>
            await fs.writeFile(image.dir, image.buffer, 'binary')
          )
      );
    } catch (err) {
      console.log('[ERR_MChapter.save]: ', err)
    }
  }
}