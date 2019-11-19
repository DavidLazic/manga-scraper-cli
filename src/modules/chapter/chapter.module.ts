import { JSDOM } from 'jsdom';
import mkdirp from 'mkdirp-promise';
import { promises as fsp, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { ROOT } from '@config/root';
import { HttpService } from '@services';
import { _lazy, _partition, _abortable } from '@lib/helpers';

export const MChapter: IMChapter = {

  /**
   * @description
   * Creates file system <PATH>
   * Images will be saved per manga <OUT_DIR>/<MANGA_NAME>/<CHAPTER_TITLE> directory
   */
  dir: ({ name, outDir }, title) =>
    join(ROOT, outDir, name, title),

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

    let sortFn = (a: any , b: any): any => {
      if(a < b) { return -1; }
      if(a > b) { return 1; }
      return 0;
    };
  
    return scraper.chapter
      .getAll(document)
      .sort(sortFn);
  },

  getLatest: async scraper => {
    const all = await MChapter.getAll(scraper);

    const dirs = path =>
      readdirSync(path)
        .filter(file =>
            statSync(join(path, file)).isDirectory())

    console.log('all', all, dirs(join(ROOT, scraper.outDir, scraper.name)));

    return [];
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
          const dir = join(chapter.dir, fileName);
          const abortable = await _abortable(HttpService.fetch, { params: [url, 'buffer'] });

          abortable.clear();

          return { buffer: abortable.res, url, dir, chapter };
        })
  ),

  /**
   * @description
   * Throttles download requests by doing lazy chapter iteration.
   */
  iterate: async (scraper, iterator, current, ERR_BUFFER = []) => {
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
            await fsp.writeFile(image.dir, image.buffer, 'binary')
          )
      );
    } catch (err) {
      console.log('[ERR_MChapter.save]: ', err)
    }
  }
}