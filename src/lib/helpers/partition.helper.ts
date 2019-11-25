/**
 * @description
 * Partitiones array per specified filter fn.
 */
export const _partition = (
  arr: any[],
  filter: (item: any) => boolean
): { pass: any[], fail: any[] } => {
  const pass: any[] = [];
  const fail: any[] = [];

  arr.forEach(item =>
    (filter(item) ? pass : fail).push(item));

  return { pass, fail };
};