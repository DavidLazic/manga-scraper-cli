import fetch from 'node-fetch';

export namespace HttpService {

  /**
   * @description
   * Fetches <URL> by specified <TYPE> (text|buffer)
   */
  export const get = (
    url: string,
    type: string = 'text',
    signal?: AbortSignal
  ): Promise<Buffer | string> =>
    fetch(url, { signal })
      .then((res: any) => res[type] && res[type]())
      .catch(err => console.error(err))  
}