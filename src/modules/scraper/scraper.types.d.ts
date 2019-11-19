declare interface IMScraper {
  get(config: TSDownload): IScraper
}

declare interface IScraper {
  id: string | number,
  name: string,
  outDir: string,
  src: string,
  url({ id, src }: { id?: number | string, src: string }): string,
  chapter: {
    get(document: object): Array<string>,
    getAll(document: object): Array<string>,
    title(document: object): string
  }
}