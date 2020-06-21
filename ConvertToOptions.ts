import { IOptions } from './IOptions';

export declare type ConvertToOptions<T> = {
  [P in keyof Required<T>]: IOptions<T>;
};
