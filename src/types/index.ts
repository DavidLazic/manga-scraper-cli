export type TOptions = {
  url?: string
}

export type TEntry = {
  name: string,
  providers: {
    [key: string]: { id: string | number }
  }
}

export type IProvider = {
  src: string,
  url({ id, src }: { id?: number | string, src: string }): string,
  getImages(document: Document): Array<string>,
  getChapters(document: Document): Array<string>,
  getTitle(document: Document): string
}

export interface IChapter {
  dir: string,
  url: string,
  document: Document,
  title: string
}

export interface IImage {
  dir: string,
  url: string,
  buffer: Buffer | undefined,
  chapter: IChapter
}

export interface IScraper extends IProvider {
  id: string | number,
  name: string,
  outDir: string
}
