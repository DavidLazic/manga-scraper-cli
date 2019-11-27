import { JSDOM } from 'jsdom';
import { promises as fsp, readdirSync, statSync } from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp-promise';

import { HttpService } from '@services';
import { _abortable, _partition } from '@lib/helpers';
import { IScraper, IChapter, IImage } from '../../types';

export namespace DownloadService {

  /**
   * @description
   * Returns array of downloaded chapter directories.
   */
  export const downloaded = async (path: string): Promise<string[]> => {
    await mkdirp(path);

    return readdirSync(path)
        .filter(file =>
            statSync(join(path, file)).isDirectory())
  };

  /**
   * @description
   * Fetches all chapter URLs.
   */
  export const all = async (scraper: IScraper): Promise<string[]> => {
    const res = await HttpService.get(scraper.url(scraper));
    const { document } = (new JSDOM(res)).window;
  
    return scraper
      .getChapters(document)
      .filter(src => !!src)
      .reverse();
  };

  /**
   * @description
   * Returns array of all non-existent chapter URLs.
   */
  export const latest = async (scraper: IScraper): Promise<string[]> => {
    const all = await DownloadService.all(scraper);
    const downloaded = await DownloadService.downloaded(join(process.cwd(), scraper.outDir, scraper.name));

    return all.slice(downloaded.length);
  };

  /**
   * @description
   * Creates file system <PATH>
   * Images will be saved per manga <OUT_DIR>/<MANGA_NAME>/<CHAPTER_TITLE> directory
   */
  export const dir = ({ name, outDir }: IScraper, title: string): string =>
    join(process.cwd(), outDir, name, title);

  /**
   * @description
   * Fetches current chapter URL and creates <IChapter>.
   */
  export const getChapter = async (scraper: IScraper, url: string): Promise<IChapter> => {
    const chapter = await HttpService.get(url);
    const { document } = (new JSDOM(chapter)).window;
    const title = scraper.getTitle(document);
    const dir = DownloadService.dir(scraper, title);
  
    return { url, dir, document, title };
  }

    /**
   * @description
   * Creates chapter image objects
   */
  export const getImages = async (scraper: IScraper, chapter: IChapter): Promise<any> => {
    const images = await Promise.all(
      scraper
        .getImages(chapter.document)
        .map(async (url: string): Promise<IImage> => {
          const temp = url.split('/');
          const fileName = temp[temp.length - 1];
          const dir = join(chapter.dir, fileName);

          return { buffer: null, url, dir, chapter };
        })
    );

    return await DownloadService.getBuffers(images);
  };

  /**
   * @description
   * Fetches images and filters passed and failed buffers.
   */
  export const getBuffers = async (arr: IImage[]): Promise<{ pass: IImage[], fail: IImage[] }> => {
    const images = await Promise.all(
      arr.map(async image => {
        const abortable = await _abortable(HttpService.get, { params: [image.url, 'buffer'] });
        abortable.clear();

        return { ...image, buffer: abortable.res };
      })
    );

    return _partition(images, (image: IImage) => !!image.buffer);
  };

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