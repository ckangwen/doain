import { lStorage } from "./storage";

const tokenName = "token";

export const getToken = () => lStorage.get(tokenName);

export const setToken = (value: string) => {
  lStorage.set(tokenName, value);
};

export const removeToken = () => {
  lStorage.remove(tokenName);
};
