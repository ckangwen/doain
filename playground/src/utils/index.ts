/* eslint-disable @typescript-eslint/indent */
/**
 * @example
  const columns = createColumns([
    ['姓名', 'name'],
    ['年龄', 'age'],
  ])
 */
export const createColumns = (configs: Array<[string, string, Record<string, any>?]>) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  configs.map((t) => {
    const [label, prop, props = {}] = t;
    return {
      label,
      prop,
      attrs: props,
    };
  });
