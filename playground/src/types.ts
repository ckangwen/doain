import { DoainDefaultUserInfo } from "@doain/toolkit";

export interface GlobalUserInfo extends DoainDefaultUserInfo {
  username: string;
  userId: number;
  avatar: string;
}

export interface RawUserInfo {
  avatar: string;
  userId: number;
  username: string;
}
