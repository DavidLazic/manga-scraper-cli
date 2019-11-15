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
  }
};

module.exports = PROVIDERS;