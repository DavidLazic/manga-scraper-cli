declare interface IMChapter {
  get(
    scraper: IScraper,
    url: string
  ): Promise<TChapter>,

  getAll(
    scraper: IScraper
  ): Promise<string[]>,

  dir(
    { name, outDir }: IScraper,
    title: string
  ): string,

  images(
    scraper: IScraper,
    chapter: TChapter
  ): Promise<TImage[]>,

  save(
    chapter: TChapter,
    images: TImage[]
  ): Promise<any>

  iterate(
    scraper: IScraper,
    iterator: IterableIterator<object>,
    ERR_BUFFER?: TImage[]
  ): any,

  retry(
    scraper: IScraper,
    iterator: IterableIterator<object>,
    ERR_RETRY?: TImage[]
  ): any
}

declare type TChapter = {
  dir: string,
  url: string,
  document: object
}

declare type TImage = {
  dir: string,
  url: string,
  buffer: ArrayBuffer | string | undefined,
  chapter: TChapter
}