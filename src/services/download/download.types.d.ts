declare interface ISDownload {
  all(
    config: {
      name: string,
      provider: string,
      outDir: string
    }
  ): any,

  latest?(): any
}