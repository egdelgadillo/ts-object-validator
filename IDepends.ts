type IDependsObject<T> = {
  [K in keyof Partial<T>]: {
    status: 'present' | 'absent' | 'exclusive';
    value?: any;
  };
};
type IDependsString<T> = keyof Partial<T>;

export type IDepends<T> = IDependsObject<T> | IDependsString<T>;
