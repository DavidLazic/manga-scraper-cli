import 'mocha';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { PROVIDERS } from './providers';
import { HttpService } from '../src/services';

const SPECS = [
  { src: 'https://mangairo.com', id: 1288896535 },
  { src: 'https://mangakakalot.com', id: 'jzde76471556853820' },
  { src: 'https://manganelo.net', id: 'yv105973'},
  { src: 'https://one-punchman.com', id: ''}
];

SPECS.forEach(provider => {
  describe(`Provider:: ${provider.src}`, function() {

    describe(`#getChapters()`, function() {
      it('should return list of chapter URLs', async function() {
        const scraper = PROVIDERS.find(item => item.src === provider.src);
        const res = await HttpService.get(scraper.url(provider));
        const { document } = (new JSDOM(res)).window;
        
        const result = scraper.getChapters(document);
        expect(result.length).to.be.greaterThan(0);
      });
    });

    describe('#getImages()', function () {
      it('should return a list of chapter images', async function() {
        const scraper = PROVIDERS.find(item => item.src === provider.src);
        const res = await HttpService.get(scraper.url(provider));
        const { document: docChapter } = (new JSDOM(res)).window;
        const chapters = scraper.getChapters(docChapter);

        const chapter = await HttpService.get(chapters[0]);
        const { document } = (new JSDOM(chapter)).window;

        const result = scraper.getImages(document);
        expect(result.length).to.be.greaterThan(0);
      });
    });
  });
});


