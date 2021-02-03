import { ConvertToOptions } from './types/ConvertToOptions';
import { ValidateObject } from './utils/Validator';

// We declare the object interface.
interface IObject {
  id: any;
  name: string;
  last_name?: string;
  phone?: string;
  cellphone?: string;
  is_company: boolean;
  account_type: 'reviewer' | 'user';
  comments?: string;
}

// We create an object to validate.
// We DO NOT trust this object. Comes from API.
const object = {
  id: '63b6d31a-52fa-4269-a1dd-7cb6dc39e67b',
  name: null,
  last_name: 'last name',
  phone: '+595 888 7777',
  cellphone: null,
  is_company: true,
  account_type: 'reviewer',
  comments: 'a',
};

// We create a model to validate the object.
const objectModel: ConvertToOptions<IObject> = {
  id: {
    allowed: false,
  },
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
          state: 'present',
          validate: 'ifValue',
          valueToTest: false,
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
          state: 'present',
          validate: 'ifNotValue',
          valueToTest: null,
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
      // Can mix objects and strings in the array
      {
        name: {
          state: 'present',
          validate: 'ifValue',
          valueToTest: 'google',
        },
      },
      'comments',
    ],
  },
  account_type: {
    allowNull: true,
    type: 'string',
    allowedValues: ['reviewer', 'user'],
  },
  comments: {
    allowNull: true,
    type: 'string',
    depends: 'phone',
  },
};

// Call the validator with the object to test
// and the model to validate it with.
// (This will fail with 4 errors)
ValidateObject(object, objectModel, { throwOnError: false });
