import { ConvertToOptions } from './utils/ConvertToOptions';
import { ValidateObject } from './utils/Validator';

// We declare the object interface.
export interface IObject {
  name: string;
  last_name?: string;
  phone?: string;
  cellphone?: string;
  is_company: boolean;
  comments?: string;
}

// We create an object to validate.
const object: any = {
  name: null,
  last_name: 'last name',
  phone: '+54',
  cellphone: null,
  is_company: true,
  comments: 'a',
};

// We create a model to validate the object.
const objectModel: ConvertToOptions<IObject> = {
  name: {
    allowNull: true,
    type: 'string',
  },
  last_name: {
    allowNull: true,
    type: 'string',
    depends: [
      {
        is_company: {
          status: 'present',
          validate: 'ifValue',
          requiredValue: false,
        },
      },
    ],
  },
  phone: {
    allowNull: true,
    type: 'string',
    depends: [
      {
        cellphone: {
          status: 'present',
          validate: 'ifNotValue',
          requiredValue: null,
        },
      },
    ],
    oneOf: ['cellphone'],
  },
  cellphone: {
    allowNull: true,
    type: 'string',
    oneOf: ['phone'],
  },
  is_company: {
    alwaysPresent: true,
    type: 'boolean',
    depends: [
      {
        name: {
          status: 'present',
          validate: 'ifValue',
          requiredValue: 'google',
        },
      },
    ],
  },
  comments: {
    allowNull: true,
    type: 'string',
    depends: 'phone',
  },
};

// Call the validator with the object to test
// and the model to validate it with.
ValidateObject(object, objectModel);
