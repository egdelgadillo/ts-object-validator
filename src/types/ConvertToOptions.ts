import { IOptions } from './IOptions';

export declare type ConvertToOptions<T extends object> = {
  [P in keyof Required<T>]: IOptions<T>;
};
