declare interface ISHttp {
  fetch(url: string, type?: string, signal?: AbortSignal): Promise<ArrayBuffer | string>
}