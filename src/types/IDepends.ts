type IDependsValueToTest = {
  valueToTest: any;
};

type IDependsPropertyToTest<T extends { [key: string]: any }> = {
  propertyToTest: keyof T;
};

type IDependsObjectPresentValue<T extends object> = {
  state: 'present';
  validate: 'ifNotValue';
} & (IDependsValueToTest | IDependsPropertyToTest<T>);

type IDependsObjectPresentNotValue<T extends object> = {
  state: 'present';
  validate: 'ifValue';
} & (IDependsValueToTest | IDependsPropertyToTest<T>);

type IDependsObjectPresent<T extends object> =
  | IDependsObjectPresentValue<T>
  | IDependsObjectPresentNotValue<T>;

type IDependsObjectAbsent<T> = {
  state: 'absent';
};

type IDependsObject<T extends object> = {
  [K in keyof Partial<T>]: IDependsObjectPresent<T> | IDependsObjectAbsent<T>;
};

export type IDepends<T extends object> =
  | (IDependsObject<T> | keyof Partial<T>)[]
  | keyof Partial<T>;
