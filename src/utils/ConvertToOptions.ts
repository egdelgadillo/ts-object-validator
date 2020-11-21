import { IOptions } from '../types/IOptions';

export declare type ConvertToOptions<T> = {
  [P in keyof Required<T>]: IOptions<T>;
};
