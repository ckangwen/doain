import { PlainObject } from "@doain/shared";

export function createGlobalConfigFactory<Config extends PlainObject>(defaultValue: Config) {
  let _globalConfig: Config = defaultValue;

  const cbs = new Set<(config: Config) => void>();

  const defineConfig = (config: Config) => {
    _globalConfig = config;
    cbs.forEach((cb) => cb(config));
  };

  const getConfig = () => _globalConfig;

  const onChange = (cb: (config: Config) => void) => {
    cbs.add(cb);
    return () => cbs.delete(cb);
  };

  return [defineConfig, getConfig, onChange] as [
    typeof defineConfig,
    typeof getConfig,
    typeof onChange,
  ];
}
