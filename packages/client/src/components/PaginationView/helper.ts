import { has, isFn } from "@charrue/toolkit";

import { getDoainConfig } from "../../config/index";

const userFormatColumnValue = getDoainConfig().component?.paginationView?.formatColumnValue;
const userFormatQueryValue = getDoainConfig().component?.paginationView?.formatQueryValue;

type TableData = Record<string, any>;

/**
 * 格式化列值
 */
const formatColumnValue = (key: string, value: any) => {
  if (typeof value === "string") {
    if (value.startsWith("0001-01-01")) {
      value = "";
    }
  }

  if (isFn(userFormatColumnValue)) {
    value = userFormatColumnValue(key, value);
  }

  // 如果是数字，则保留2为小数
  value = typeof value === "number" ? parseFloat(value.toFixed(2)) : value;

  return value;
};

const cachedFormatRow: Record<string, (data: Record<string, any>) => Record<string, any>> = {};

/**
 * 创建formatRow函数
 * 如果columns和url一样，就直接返回缓存的函数
 */
export const createFormatRowFactory = (
  columns: Array<{ label: string; prop: string; attrs: Record<string, any> }> = [],
  url: string,
) => {
  const cacheKey = columns.map((t) => t.prop).join("-") + url;

  if (has(cachedFormatRow, cacheKey)) {
    return cachedFormatRow[cacheKey];
  }

  const fn = (data: TableData = {}) =>
    columns.reduce((acc, cur) => {
      const key: string = cur.prop;
      const value = data[key] === 0 ? 0 : data[key] || "-";

      acc[key] = formatColumnValue(key, value);
      return acc;
    }, {} as unknown as Record<string, string>);

  cachedFormatRow[cacheKey] = fn;

  return fn;
};

export const formatQueryValue = (formData: TableData): TableData =>
  Object.keys(formData)
    .filter((key) => formData[key] !== undefined)
    .reduce((acc, key) => {
      if (isFn(userFormatQueryValue)) {
        const value = userFormatQueryValue(key, formData[key]);
        if (typeof value === "object") {
          Object.assign(acc, value);
        } else if (value) {
          acc[key] = value;
        }
      } else {
        acc[key] = formData[key];
      }

      return acc;
    }, {} as unknown as Record<string, any>);
