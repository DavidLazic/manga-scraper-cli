export type TSDownload = {
  name: string,
  provider: string,
  outDir?: string
}

export type TOptions = {
  database: string
}

export type TEntry = {
  name: string,
  providers: {
    [key: string]: { id: string | number }
  }
}

export type TProvider = {
  src: string,
  url({ id, src }: { id?: number | string, src: string }): string,
  chapter: {
    get(document: Document): Array<string>,
    getAll(document: Document): Array<string>,
    title(document: Document): string
  }
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

export interface IScraper extends TProvider {
  id: string | number,
  name: string,
  outDir: string
}
