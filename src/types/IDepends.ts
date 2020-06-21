type IDependsObjectPresentValue<T> = {
  status: 'present';
  validate: 'ifNotValue';
  requiredValue: any;
};

type IDependsObjectPresentNotValue<T> = {
  status: 'present';
  validate: 'ifValue';
  requiredValue: any;
};

type IDependsObjectPresent<T> =
  | IDependsObjectPresentValue<T>
  | IDependsObjectPresentNotValue<T>;

type IDependsObjectAbsent<T> = {
  status: 'absent';
};

type IDependsObject<T> = {
  [K in keyof Partial<T>]: IDependsObjectPresent<T> | IDependsObjectAbsent<T>;
};

export type IDepends<T> =
  | (IDependsObject<T> | keyof Partial<T>)[]
  | keyof Partial<T>;
