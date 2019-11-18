/**
 * @description
 * Partitiones images array per fetched image buffer.
 */
export const _partition = (
  images: TImage[],
  filter: (image: TImage) => boolean
): { pass: TImage[], fail: TImage[] } => {
  const pass = [];
  const fail = [];

  images.forEach(image =>
    (filter(image) ? pass : fail).push(image));

  return { pass, fail };
};