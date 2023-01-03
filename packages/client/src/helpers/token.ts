import { createLocalStorage } from "./storage";

const tokenName = "token";

export const getToken = () => createLocalStorage().get(tokenName);

export const setToken = (value: string) => {
  createLocalStorage().set(tokenName, value);
};

export const removeToken = () => {
  createLocalStorage().remove(tokenName);
};
