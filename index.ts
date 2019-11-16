import * as path from 'path';
import fetch from 'node-fetch';
import jsdom from 'jsdom';
const fs = require('fs').promises;
import mkdirp from 'mkdirp-promise';
import AbortController from 'abort-controller';
import { JSDOM } from 'jsdom';

import PROVIDERS = require('./config/providers');
import MANGA = require('./config/mangas');
import { Chapter, Scraper, Image, Provider } from './types';

// Default directory name under project root
const DIR_EXPORT = 'export';
// Delay for aborting / skipping an image buffer request
const ERR_DELAY = 30000;
// Container for aborted / skipped image buffers
const ERR_BUFFER: Array<object> = [];
// Container for failed retried image buffers
const ERR_RETRY: Array<object> = [];

/**
 * @description
 * Creates scraper by combining manga and provider configs
 * 
 * @param {Object} manga 
 * @param {String} provider 
 * 
 * @returns {Object}
 */
const getScraper = (
  manga: { name: string | number, providers: object },
  provider: string
): Scraper => ({
  name: manga.name,
  ...manga.providers[provider],
  ...PROVIDERS[provider]
});

/**
 * @description
 * Creates file system <PATH>
 * Images will be saved per manga <DIR_EXPORT>/<MANGA_NAME>/<CHAPTER_TITLE> directory
 * 
 * @param {String} name 
 * @param {String} title 
 * 
 * @returns {String}
 */
const getDir = (
  { name, title } : { name: string, title: string }
): string =>
  path.join(__dirname, DIR_EXPORT, name, title);

/**
 * @description
 * Fetches <URL> by specified <TYPE> (text|buffer)
 * 
 * @param {String} url 
 * @param {String} type
 * @param {Object} signal 
 * 
 * @returns {String | Array}
 */
const fetchUrl = (
  url: string,
  type: string = 'text',
  signal?: object
) : string | ArrayBuffer =>
    url &&
      fetch(url, { signal })
        .then(res => res[type] && res[type]())
        .catch(err => console.error('[ERR_fetchUrl]:', err));

/**
 * @description
 * Fetches all chapter URLs and parses titles for each chapter.
 * 
 * @param {Object} scraper
 * 
 * @returns {Promise} 
 */
const getChapters = async (
  scraper: Scraper
): Promise<Array<object>> => {
  const res = await fetchUrl(scraper.url(scraper));
  const { document } = (new JSDOM(res)).window;

  return Promise.all(
    scraper.chapter
      .getAll(document)
      .map(async url => {
        const chapter = await fetchUrl(url);
        const { document } = (new JSDOM(chapter)).window;
        const title = scraper.chapter.title(document);
        const dir = getDir({ ...scraper, title });

        return { title, dir, url, document };
      })
  );
};

/**
 * @description
 * Fetches all chapter images and creates image buffers.
 * 
 * @param {Object} scraper
 * @param {Object} chapter 
 * 
 * @returns {Array<Object>}
 */
const getImages = (
  scraper: Scraper,
  chapter: Chapter
) =>
  Promise.all(
    scraper.chapter
      .get(chapter.document)
      .map(async url => {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeout = setTimeout(() => controller.abort(), ERR_DELAY);

        const image = await fetchUrl(url, 'buffer', signal);

        clearTimeout(timeout);

        return { buffer: image, url };
      })
  );

/**
 * @description
 * Creates lazy array iterator for throttling HTTP requests.
 * 
 * @param {Array} arr
 * 
 * @returns {Array<Iterator>}
 */
const gen = function* (arr: Array<any>): any {
  yield* arr;
};

/**
 * @description
 * Saves all fetched image buffers per <PATH> string
 * 
 * @param {Object} scraper
 * @param {Object} iterator
 * 
 * @returns {Promise<any>}
 */
const save = async (
  scraper: Scraper,
  iterator: { next (): { value: Chapter, done: boolean } }
) : Promise<any> => {
  const { value: chapter, done } = iterator.next();

  if (done) {
    console.log(`[ERR_BUFFER]: ${ERR_BUFFER.length} items: `, ERR_BUFFER);
    return ERR_BUFFER.length && retry(scraper, gen(ERR_BUFFER));
  }

  console.log('[Downloading]: ', { chapter, done });

  const images = await getImages(scraper, chapter);

  try {
    await mkdirp(chapter.dir);

    await Promise.all(
      images.map(async image => {
        const temp = image.url.split('/');
        const fileName = temp[temp.length - 1];
        const dir = path.join(chapter.dir, fileName);

        if (!image.buffer) {
          ERR_BUFFER.push({
            path: dir,
            chapter,
            image
          });
        }

        return await fs.writeFile(dir, image.buffer, 'binary');
      })
    );

    return save(scraper, iterator);
  } catch (err) {
    console.log('ERR_DIR', err)
  }
}

/**
 * @description
 * Retries fetching all failed image buffers from <ERR_BUFFER>
 * 
 * @param {Object} scraper
 * @param {Object} iterator
 * 
 * @returns {Promise<any>}
 */
const retry = async (
  scraper: Scraper,
  iterator: {
    next (): {
      value: {
        path: string,
        chapter: Chapter,
        image: Image
      },
      done: boolean
    }
}) : Promise<any> => {
  const { value, done } = iterator.next();

  if (done) {
    return console.log(`[ERR_RETRY]: ${ERR_RETRY.length} items: `, ERR_RETRY);
  }

  const buffer = await fetchUrl(value.image.url, 'buffer');

  if (!buffer) {
    ERR_RETRY.push(value);
  }

  try {
    await mkdirp(value.chapter.dir);
    await fs.writeFile(`${value.path}`, buffer, 'binary');
    return retry(scraper, iterator);

  } catch (err) {
    console.log('ERR_DIR', err)
  }
};

/**
 * @description
 * Downloads manga by lazy chapter iteration.
 * 
 * @param {Object} scraper
 * 
 * @returns {Promise<any>}
 */
const download = async (
  scraper: Scraper
) : Promise<any> => {
  const chapters = await getChapters(scraper);
  return save(scraper, gen(chapters));
};


const SCRAPER = getScraper(MANGA['Test'], 'Manganelo');
console.log('scraper', SCRAPER);

download(SCRAPER);