import { IOptions } from './IOptions';

export declare type ConvertToOptions<T extends {}> = {
  [P in keyof Required<T>]: IOptions<T>;
};
