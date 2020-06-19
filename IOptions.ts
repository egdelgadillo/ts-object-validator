import { IDepends } from './IDepends';

interface IOptionsGeneral<T> {
  allowNull: boolean;
  type: 'number' | 'boolean' | string[] | number[];
  depends?: IDepends<T>[];
}

interface IOptionsString<T> {
  allowNull: boolean;
  allowEmpty: boolean;
  type: 'string';
  depends?: IDepends<T>[] | keyof Partial<T>;
}

export type IOptions<T> = IOptionsGeneral<T> | IOptionsString<T>;
