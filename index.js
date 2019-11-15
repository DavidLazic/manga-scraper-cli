const fetch = require('node-fetch');
const jsdom = require("jsdom");
const fs = require('fs').promises;
const mkdirp = require('mkdirp-promise');
const AbortController = require("abort-controller")
const { JSDOM } = jsdom;

const PROVIDERS = require('./config/providers');
const MANGA = require('./config/mangas');

// Default directory name under project root
const DIR_EXPORT = 'export';
// Delay for aborting / skipping an image buffer request
const ERR_DELAY = 30000;
// Container for aborted / skipped image buffers
const ERR_BUFFER = [];
// Container for failed retried image buffers
const ERR_RETRY = [];

/**
 * @description
 * Creates scraper by combining manga and provider configs
 * 
 * @param {Object} manga 
 * @param {Object} provider 
 * 
 * @returns {Object}
 */
const getScraper = (manga, provider) => ({
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
const getDir = ({ name, title }) =>
  `${__dirname}\\${DIR_EXPORT}\\${name}\\${title}`;

/**
 * @description
 * Fetches <URL> by specified <TYPE> (text|buffer)
 * 
 * @param {String} url 
 * @param {String} type
 * @param {Object} signal 
 * 
 * @returns {String}
 */
const fetchUrl = async (url, type = 'text', signal) => {
  try {
    return await fetch(url, { signal }).then(res => res[type] && res[type]());
  } catch (err) {
    console.error('[ERR_fetchUrl]: ', err);
  }
};

/**
 * @description
 * Fetches all chapter URLs and parses titles for each chapter.
 * 
 * @param {Object} manga 
 * 
 * @returns {Array<Object>}
 */
const getChapters = async manga => {
  const res = await fetchUrl(manga.url(manga));
  const { document } = (new JSDOM(res)).window;

  return await Promise.all(
    manga.chapter
      .getAll(document)
      .map(async url => {
        const chapter = await fetchUrl(url);
        const { document } = (new JSDOM(chapter)).window;
        const title = manga.chapter.title(document);
        const dir = getDir({ ...manga, title });

        return { title, dir, url, document };
      })
  );
};

/**
 * @description
 * Fetches all chapter images and creates image buffers.
 * 
 * @param {Object} manga 
 * @param {Object} chapter 
 * 
 * @returns {Array<Object>}
 */
const getImages = async (manga, chapter) =>
  await Promise.all(
    manga.chapter
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
const gen = function* (arr) {
  yield* arr;
};

/**
 * @description
 * Saves all fetched image buffers per <PATH> string
 * 
 * @param {Object} manga
 * @param {Object} iterator
 * 
 * @returns {Function}
 */
const save = async (manga, iterator) => {
  const { value: chapter, done } = iterator.next();

  if (done) {
    console.log(`[ERR_BUFFER]: ${ERR_BUFFER.length} items: `, ERR_BUFFER);
    return ERR_BUFFER.length && retry(manga, gen(ERR_BUFFER));
  }

  console.log('[Downloading]: ', { chapter, done });

  const images = await getImages(manga, chapter);

  try {
    await mkdirp(chapter.dir);

    await Promise.all(
      images.map(async image => {
        const temp = image.url.split('/');
        const fileName = temp[temp.length - 1];

        if (!image.buffer) {
          ERR_BUFFER.push({
            path: `${chapter.dir}\\${fileName}`,
            chapter,
            image
          });
        }

        return await fs.writeFile(`${chapter.dir}\\${fileName}`, image.buffer, 'binary');
      })
    );

    return save(manga, iterator);
  } catch (err) {
    console.log('ERR_DIR', err)
  }
}

/**
 * @description
 * Retries fetching all failed image buffers from <ERR_BUFFER>
 * 
 * @param {Object} manga
 * @param {Object} iterator
 * 
 * @returns {Function}
 */
const retry = async (manga, iterator) => {
  const { value, done } = iterator.next();

  if (done) {
    return console.log(`[ERR_RETRY]: ${ERR_RETRY.length} items: `, ERR_RETRY);
  }

  const image = await fetchUrl(value.image.url, 'buffer');

  if (!image.buffer) {
    ERR_RETRY.push(value);
  }

  try {
    await mkdirp(value.chapter.dir);
    await fs.writeFile(`${value.path}`, image.buffer, 'binary');
    return retry(manga, iterator);

  } catch (err) {
    console.log('ERR_DIR', err)
  }
};

/**
 * @description
 * Downloads manga by lazy chapter iteration.
 * 
 * @param {Object} manga
 * 
 * @returns {Function}
 */
const download = async manga => {
  const chapters = await getChapters(manga);
  return save(manga, gen(chapters));
};


const SCRAPER = getScraper(MANGA['Ares'], 'Mangairo');
console.log('scraper', SCRAPER);

download(SCRAPER);