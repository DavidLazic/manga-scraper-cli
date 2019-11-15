const PROVIDERS = {
  'Mangairo': {
    url: ({ id, src }) => `${src}/series-${id}`,
    chapter: {
      get: document =>
        Array
          .from(document.querySelectorAll('.panel-read-story img'))
          .map(item => item.src)
      ,
      getAll: document =>
        Array
          .from(document.querySelectorAll('.chapter_list > ul > li > a'))
          .map(item => item.href)
      ,
      title: document =>
        document.title.split(' | ')[0].replace(/[\s|:|.|?]/g, '_')
    }
  },
  'Mangakakalot': {
    url: ({ id, src }) => `${src}/manga/${id}`,
    chapter: {
      get: document =>
        Array
          .from(document.querySelectorAll('#vungdoc img'))
          .map(item => item.src)
      ,
      getAll: document =>
        Array
          .from(document.querySelectorAll('.chapter-list a'))
          .map(item => item.href)
      ,
      title: document =>
        document.title.split(' | ')[0].replace(/[\s|:|.|?]/g, '_')
    }
  },
  'Manganelo': {
    url: ({ id, src }) => `${src}/manga-${id}`,
    chapter: {
      get: document =>
        Array
          .from(document.querySelectorAll('.container-chapter-reader img'))
          .map(item => item.src)
      ,
      getAll: document =>
        Array
          .from(document.querySelectorAll('.row-content-chapter a'))
          .map(item => item.href)
      ,
      title: document =>
        document.title.split(' | ')[0].replace(/[\s|:|.|?]/g, '_')
    }
  }
};

module.exports = PROVIDERS;