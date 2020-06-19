import { IOptions } from './IOptions';

export const Validator = (
  object: object,
  model: { [key: string]: IOptions<any> }
) => {
  for (const propertyName in model) {
    const propertyOptions = model[propertyName];
    if (propertyOptions.type === 'string') {
      // TODO
    }
  }
};
