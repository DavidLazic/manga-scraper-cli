import { JSDOM } from 'jsdom';
import mkdirp from 'mkdirp-promise';
import { promises as fsp, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { ROOT } from '@config/root';
import { HttpService } from '@services';
import { _lazy, _partition, _abortable } from '@lib/helpers';
import { IScraper, IChapter, IImage } from '../../types';

export namespace MChapter {

  /**
   * @description
   * Creates file system <PATH>
   * Images will be saved per manga <OUT_DIR>/<MANGA_NAME>/<CHAPTER_TITLE> directory
   */
  export const dir = ({ name, outDir }: IScraper, title: string): string =>
    join(ROOT, outDir, name, title)

  /**
   * @description
   * Fetches current chapter URL and creates <IChapter>.
   */
  export const get = async (scraper: IScraper, url: string): Promise<IChapter> => {
    const chapter = await HttpService.get(url);
    const { document } = (new JSDOM(chapter)).window;
    const title = scraper.chapter.title(document);
    const dir = MChapter.dir(scraper, title);
  
    return { url, dir, document, title };
  }

  /**
   * @description
   * Fetches all chapter URLs.
   */
  export const getAll = async (scraper: IScraper): Promise<string[]> => {
    const res = await HttpService.get(scraper.url(scraper));
    const { document } = (new JSDOM(res)).window;
  
    return scraper.chapter
      .getAll(document)
      .filter(src => !!src)
      .reverse();
  }

  /**
   * @description
   * Returns array of all non-existent chapter URLs.
   */
  export const getLatest = async (scraper: IScraper): Promise<string[]> => {
    const all = await MChapter.getAll(scraper);
    const downloaded = await MChapter.downloaded(join(ROOT, scraper.outDir, scraper.name));

    return all.slice(downloaded.length);
  }

  /**
   * @description
   * Fetches all chapter images and creates image buffers.
   */
  export const images = (scraper: IScraper, chapter: IChapter): Promise<IImage[]> =>
    Promise.all(
      scraper.chapter
        .get(chapter.document)
        .map(async (url: string): Promise<IImage> => {
          const temp = url.split('/');
          const fileName = temp[temp.length - 1];
          const dir = join(chapter.dir, fileName);

          const abortable = await _abortable(HttpService.get, { params: [url, 'buffer'] });
          abortable.clear();

          return { buffer: abortable.res, url, dir, chapter };
        })
  )

  /**
   * @description
   * Returns array of downloaded chapter directories.
   */
  export const downloaded = async (path: string): Promise<string[]> => {
    await mkdirp(path);

    return readdirSync(path)
        .filter(file =>
            statSync(join(path, file)).isDirectory())
  }

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
          MChapter.retry(ERR_BUFFER)
        )
        : console.log('[Done]')
    }

    const chapter = await MChapter.get(scraper, url);
    console.log('[Downloading]: ', chapter);

    const images = await MChapter.images(scraper, chapter);
    const { pass, fail } = _partition(images, (image: IImage) => !!image.buffer);

    await MChapter.save(pass);

    return MChapter.iterate(scraper, iterator, [ ...ERR_BUFFER, ...fail ] );
  }


  /**
   * @description
   * Retries fetching all failed image buffers from <ERR_BUFFER>
   */
  export const retry = async (ERR_BUFFER: IImage[] = []): Promise<any> => {
    const images = await Promise.all(
      ERR_BUFFER.map(async image => {
        const abortable = await _abortable(HttpService.get, { params: [image.url, 'buffer'] });
        abortable.clear();

        return { buffer: abortable.res, ...image };
      })
    );

    const { pass, fail } = _partition(images, (image: IImage) => !!image.buffer);

    await MChapter.save(pass);

    return fail.length
      ? console.log(`[Failed Downloading]: ${ERR_BUFFER.length} items: `, ERR_BUFFER)
      : console.log('[Done]')
  }

  /**
   * @description
   * Creates chapter directory and
   * saves all fetched image buffers per <PATH> string
   */
  export const save = async (images: IImage[]): Promise<any> =>
    await Promise.all(
      images
        .map(async image => {
          await mkdirp(image.chapter.dir);
          return await fsp.writeFile(image.dir, image.buffer, 'binary');
        })
    )
}