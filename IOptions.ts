import { IDepends } from './IDepends';

type IOptions2 = { alwaysPresent: boolean } | { allowNull: boolean };

interface IOptionsRequirements<T extends object> {
  type: 'string' | 'number' | 'boolean' | string[] | number[];
  depends?: IDepends<T>;
  oneOf?: (keyof T)[];
}

export type IOptions<T extends object> = IOptionsRequirements<T> & IOptions2;
