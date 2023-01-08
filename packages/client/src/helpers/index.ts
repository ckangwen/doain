export * from "./storage";
export * from "./token";

export const createFromSchemaDefaultValue = (schema: Record<string, any>) => {
  const source = {} as unknown as Record<string, any>;

  Object.keys(schema).forEach((key) => {
    source[key] = schema[key] ? schema[key].default || "" : "";
  });

  return source;
};
