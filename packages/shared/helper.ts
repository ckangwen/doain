import { PlainObject } from "./types";

export const createFromSchemaDefaultValue = (schema: PlainObject) => {
  const source = {} as unknown as PlainObject;

  Object.keys(schema).forEach((key) => {
    source[key] = schema[key] ? schema[key].default || "" : "";
  });

  return source;
};
