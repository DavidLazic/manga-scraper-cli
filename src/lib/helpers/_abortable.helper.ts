import AbortController from 'abort-controller';

// Delay for aborting / skipping an image buffer request
const ERR_DELAY = 30000;

/**
 * @description
 * Creates cancellable fetch HTTP request with predefined request delay. 
 */
export const _abortable = async (
  fn: any,
  props: { params: any[] }
) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const cancel = setTimeout(() => controller.abort(), ERR_DELAY);

  const res = await fn(...props.params, signal);

  return {
    res,
    clear: () => clearTimeout(cancel)
  };
};