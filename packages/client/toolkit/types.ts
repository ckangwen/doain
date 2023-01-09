export interface FetchResponse<T = any> {
  data: T;
  message: string;
  status: number;
}
