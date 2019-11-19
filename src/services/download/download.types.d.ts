declare interface ISDownload {
  all(config: TSDownload): any,
  latest(config: TSDownload): any
}

declare type TSDownload = {
  name: string,
  provider: string,
  outDir?: string
}