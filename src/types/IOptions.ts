import { IDepends } from './IDepends';

type IOptionsNullOrRequired =
  | { alwaysPresent: boolean }
  | { allowNull: boolean };

interface IOptionsOptions<T extends object> {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  allowedValues?: string[] | number[];
  required?: boolean;
  depends?: IDepends<T>;
  oneOf?: (keyof T)[];
}
type IOptionsForbidden = {
  allowed: false;
};

export type IOptions<T extends object> =
  | IOptionsForbidden
  | (IOptionsNullOrRequired & IOptionsOptions<T>);
