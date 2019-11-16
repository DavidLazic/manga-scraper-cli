export interface Scraper {
  id: string | number,
  name: string,
  src: string,
  url ({ id, src} : { id?: number | string, src: string }) : string,
  chapter: {
    get(document: object): Array<string>,
    getAll(document: object) : Array<string>,
    title(document: object): string
  } 
}

export interface Chapter {
  title: string,
  dir: string,
  url: string,
  document: object
}

export interface Image {
  url: string,
  buffer: ArrayBuffer
}