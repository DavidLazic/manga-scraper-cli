import { JSDOM } from 'jsdom';
import mkdirp from 'mkdirp-promise';
const fs = require('fs').promises;
import * as path from 'path';
import AbortController from 'abort-controller';

import { HttpService } from '@services';
import { _lazy, _partition } from '@lib/helpers';

// Delay for aborting / skipping an image buffer request
const ERR_DELAY = 30000;

export const MChapter: IMChapter = {

  /**
   * @description
   * Creates file system <PATH>
   * Images will be saved per manga <OUT_DIR>/<MANGA_NAME>/<CHAPTER_TITLE> directory
   */
  dir: ({ name, outDir }, title) =>
    path.join(__dirname, '..', outDir, name, title),

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

  abortable: async (fn, props) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const cancel = setTimeout(controller.abort, ERR_DELAY);

    const buffer = await fn(...props.params, signal);

    return {
      buffer,
      clear: () => {
        console.log('clearing', cancel);
        clearTimeout(cancel);
      }
    };
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
          const abortable = await MChapter.abortable(HttpService.fetch, { params: [url, 'buffer'] });

          console.log('aboratble', abortable);

          // const buffer = await HttpService.fetch(url, 'buffer', signal);

          abortable.clear();

          return { buffer: abortable.buffer, url, dir, chapter };
        })
  ),

  iterate: async (scraper, iterator, ERR_BUFFER = []) => {
    const { value: url, done } = iterator.next();

    console.log('URL', url);

    if (done) {
      return ERR_BUFFER.length
        ? (
          console.log(`[Retrying skipped]: ${ERR_BUFFER.length} items: `, ERR_BUFFER),
          MChapter.retry(scraper, _lazy(ERR_BUFFER))
        )
        : console.log('[Finished]')
    }

    const chapter = await MChapter.get(scraper, url);
    console.log('[Downloading]: ', chapter);

    const images = await MChapter.images(scraper, chapter);
    const { pass, fail } = _partition(images, (image: TImage) => !!image.buffer);

    console.log('images', images, pass, fail);

    await MChapter.save(chapter, pass);

    // return MChapter.iterate(scraper, iterator, [ ...ERR_BUFFER, ...fail ] );
  },

  /**
   * @description
   * Retries fetching all failed image buffers from <scraper.ERR_BUFFER>
   */
  retry: async (scraper, iterator, ERR_RETRY = []) => {
    // const { value, done } = iterator.next();

    // if (done) {
    //   return console.log(`[Failed Downloading]: ${ERR_RETRY.length} items: `, ERR_RETRY);
    // }

    // const buffer = await HttpService.fetch(value.image.url, 'buffer');

    // await MChapter.save(chapter, pass);

    // return MChapter.retry(scraper, iterator);
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