import { IDepends } from './IDepends';

type IOptionsNullOrRequired =
  | { alwaysPresent: boolean }
  | { allowNull: boolean };

interface IOptionsOptions<T> {
  type: 'string' | 'number' | 'boolean' | string[] | number[];
  depends?: IDepends<T>;
  oneOf?: (keyof T)[];
}

export type IOptions<T> = IOptionsNullOrRequired & IOptionsOptions<T>;
