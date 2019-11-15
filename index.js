const fetch = require('node-fetch');
const jsdom = require("jsdom");
const fs = require('fs').promises;
const mkdirp = require('mkdirp-promise');
const AbortController = require("abort-controller")
const { JSDOM } = jsdom;

const PROVIDERS = require('./config/providers');
const MANGA = require('./config/mangas');

const ERR_DELAY = 30000;
const ERR_RETRY = [];
const ERR_BUFFER = [];

const getScraper = (manga, provider) => ({
  name: manga.name,
  ...manga.providers[provider],
  ...PROVIDERS[provider]
});

const getDir = ({ name, title }) =>
  `${__dirname}\\export\\${name}\\${title}`;

const fetchUrl = async (url, type = 'text', signal) => {
  try {
    return await fetch(url, { signal }).then(res => res[type] && res[type]());
  } catch (err) {
    console.error('[ERR_fetchUrl]: ', err);
  }
};

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

const getImages = async (manga, chapter) => {
  const images = await Promise.all(
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

  return images;
};

const gen = function* (arr) {
  yield* arr;
};

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

const download = async manga => {
  const chapters = await getChapters(manga);
  return save(manga, gen(chapters));
};

const SCRAPER = getScraper(MANGA['Ares'], 'Mangairo');
console.log('scraper', SCRAPER);

download(SCRAPER);