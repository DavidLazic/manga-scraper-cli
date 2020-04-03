import { IProvider } from '../src/types';

export const PROVIDERS: IProvider[] = [
  {
    src: 'https://mangairo.com',
    url: ({ id, src }) => `${src}/series-${id}`,
    getImages: document =>
      Array
        .from((<NodeListOf<HTMLImageElement>>document.querySelectorAll('.panel-read-story img')))
        .map(item => item.src)
    ,
    getChapters: document =>
      Array
        .from((<NodeListOf<HTMLAnchorElement>>document.querySelectorAll('.chapter_list > ul > li > a')))
        .map(item => item.href)
    ,
    getTitle: document =>
      document.title.split(' | ')[0].replace(/[\s|:|.|?]/g, '_')
  },
  {
    src: 'https://mangakakalot.com',
    url: ({ id, src }) => `${src}/manga/${id}`,
    getImages: document =>
      Array
        .from((<NodeListOf<HTMLImageElement>>document.querySelectorAll('#vungdoc img')))
        .map(item => item.src)
    ,
    getChapters: document => {
      console.log('doc', document);
      console.log(document.querySelectorAll('.chapter-list a'));
      return Array
      .from((<NodeListOf<HTMLAnchorElement>>document.querySelectorAll('.chapter-list a')))
      .map(item => item.href);
    },
    getTitle: document =>
      document.title.split(' | ')[0].replace(/[\s|:|.|?]/g, '_')
  },
  {
    src: 'https://manganelo.net',
    url: ({ id, src }) => `${src}/manga-${id}`,
    getImages: document =>
      Array
      .from((<NodeListOf<HTMLImageElement>>document.querySelectorAll('.container-chapter-reader img')))
      .map(item => item.src || item.dataset.src)
    ,
    getChapters: document => {
      const canonical= (<HTMLLinkElement>document.querySelector('link[rel="canonical"]')).href;

      return Array
        .from((<NodeListOf<HTMLAnchorElement>>document.querySelectorAll('.row-content-chapter a')))
        .map(item => item.href || `${canonical}/chapter-${item.dataset.c}`);
    }
    ,
    getTitle: document =>
      document.title.split(' - ')[0].replace(/[\s|:|.|?]/g, '_')
  },
  {
    src: 'https://one-punchman.com',
    url: ({ src }) => src,
    getImages: document =>
      Array
        .from((<NodeListOf<HTMLImageElement>>document.querySelectorAll('.entry-content .separator img')))
        .map(item => item.src)
    ,
    getChapters: document =>
      Array
        .from((<NodeListOf<HTMLAnchorElement>>document.querySelectorAll('#Chapters_List ul li ul li a')))
        .map(item => item.href)
    ,
    getTitle: document =>
      document.title.split(' - ')[0].replace(/[\s|:|.|?|,]/g, '_')
  }
];