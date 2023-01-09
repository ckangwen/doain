import { RouteLocationNormalizedLoaded } from "vue-router";

export type NormalizedRouteData = Pick<
  RouteLocationNormalizedLoaded,
  "fullPath" | "meta" | "name" | "params" | "path" | "query"
>;

// eslint-disable-next-line max-len
export const formatNormalizedRoute = (
  route: Partial<RouteLocationNormalizedLoaded>,
): NormalizedRouteData => {
  const { fullPath = "", meta = {}, name = "", params = {}, path = "", query = {} } = route;
  return { fullPath, meta, name, params, path, query };
};
