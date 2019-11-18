import fetch from 'node-fetch';

export const HttpService: ISHttp = {

  /**
   * @description
   * Fetches <URL> by specified <TYPE> (text|buffer)
   */
  fetch: (url, type = 'text', signal) =>
    url &&
    fetch(url, { signal })
      .then(res => res[type] && res[type]())
      .catch(err => console.error('[ERR_fetchUrl]:', err))
  
};