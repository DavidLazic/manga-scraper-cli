declare interface IMChapter {
  get(
    scraper: IScraper,
    url: string
  ): Promise<TChapter>,

  getAll(
    scraper: IScraper
  ): Promise<string[]>,

  getLatest(
    scraper: IScraper
  ): Promise<string[]>

  dir(
    { name, outDir }: IScraper,
    title: string
  ): string,

  images(
    scraper: IScraper,
    chapter: TChapter
  ): Promise<TImage[]>,

  downloaded(
    path: string
  ): Promise<string[]>,

  iterate(
    scraper: IScraper,
    iterator: IterableIterator<object>,
    ERR_BUFFER?: TImage[]
  ): any,

  retry(
    ERR_BUFFER?: TImage[]
  ): any,

  save(
    images: TImage[]
  ): Promise<any>
}

declare type TChapter = {
  dir: string,
  url: string,
  document: object,
  title: string
}

declare type TImage = {
  dir: string,
  url: string,
  buffer: ArrayBuffer | undefined,
  chapter: TChapter
}