import { IDepends } from './IDepends';

interface IOptionsRequired<T extends object> {
  alwaysPresent: boolean;
  type: 'string' | 'number' | 'boolean' | string[] | number[];
  depends?: IDepends<T>;
}

interface IOptionsNotRequired<T extends object> {
  allowNull: boolean;
  type: 'string' | 'number' | 'boolean' | string[] | number[];
  depends?: IDepends<T>;
}

export type IOptions<T extends object> =
  | IOptionsRequired<T>
  | IOptionsNotRequired<T>;
