const fetch = require('node-fetch');
const jsdom = require("jsdom");
const fs = require('fs').promises;
const mkdirp = require('mkdirp-promise');
const { JSDOM } = jsdom;

const PROVIDERS = require('./config/providers');
const MANGA = require('./config/mangas');

const getScraper = (manga, provider) => ({
  name: manga.name,
  ...manga.providers[provider],
  ...PROVIDERS[provider]
});

const getDir = ({ name, title }) =>
  `${__dirname}\\export\\${name}\\${title}`;

const fetchUrl = async (url, type = 'text') => {
  try {
    return await fetch(url).then(res => res[type] && res[type]());
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

const getImages = async (manga, chapter) =>
  await Promise.all(
    manga.chapter
      .get(chapter.document)
      .map(async url => {
        const image = await fetchUrl(url, 'buffer');

        return { buffer: image, url };
      })
  );

const gen = function* (arr) {
  yield* arr;
};

const save = async (manga, chapter, iterator) => {
  const images = await getImages(manga, chapter);

  try {
    await mkdirp(chapter.dir);

    await Promise.all(
      images.map(async image => {
        const temp = image.url.split('/');
        const fileName = temp[temp.length - 1];

        return await fs.writeFile(`${chapter.dir}\\${fileName}`, image.buffer, 'binary');
      })
    );

    return next(manga, iterator);
  } catch (err) {
    console.log('ERR_DIR', err)
  }
}

const next = async (manga, iterator) => {
  const { value, done } = iterator.next();
  console.log('[Downloading]: ', { value, done });

  return !done && await save(manga, value, iterator);
};

const download = async manga => {
  const chapters = await getChapters(manga);
  return next(manga, gen(chapters));
};

const SCRAPER = getScraper(MANGA['Ares'], 'Mangairo');
console.log('scraper', SCRAPER);

download(SCRAPER);