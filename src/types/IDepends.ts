type IDependsObjectPresentValue<T> = {
  state: 'present';
  validate: 'ifNotValue';
  valueToTest: any;
};

type IDependsObjectPresentNotValue<T> = {
  state: 'present';
  validate: 'ifValue';
  valueToTest: any;
};

type IDependsObjectPresent<T> =
  | IDependsObjectPresentValue<T>
  | IDependsObjectPresentNotValue<T>;

type IDependsObjectAbsent<T> = {
  state: 'absent';
};

type IDependsObject<T> = {
  [K in keyof Partial<T>]: IDependsObjectPresent<T> | IDependsObjectAbsent<T>;
};

export type IDepends<T> =
  | (IDependsObject<T> | keyof Partial<T>)[]
  | keyof Partial<T>;
