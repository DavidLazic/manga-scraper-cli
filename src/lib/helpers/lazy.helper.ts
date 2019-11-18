/**
 * @description
 * Creates lazy array iterator for throttling HTTP requests.
 */
export const _lazy = function* (arr: Array<any>): any {
  yield* arr;
};