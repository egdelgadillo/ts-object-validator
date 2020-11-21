import { ConvertToOptions } from './utils/ConvertToOptions';
import { ValidateObject } from './utils/Validator';

// We declare the object interface.
interface IObject {
  name: string;
  last_name?: string;
  phone?: string;
  cellphone?: string;
  is_company: boolean;
  comments?: string;
}

// We create an object to validate.
// We DO NOT trust this object. Comes from API.
const object = {
  name: null,
  last_name: 'last name',
  phone: '+595 888 7777',
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
  comments: {
    allowNull: true,
    type: 'string',
    depends: 'phone',
  },
};

// Call the validator with the object to test
// and the model to validate it with.
// (This will fail with 3 errors)
ValidateObject(object, objectModel, { exitOnError: false });
