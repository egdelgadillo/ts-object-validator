import { IObject } from './IObject';
import { ConvertToOptions } from './IConvert';
import { Validator } from './Validator';

const object: any = {
  name: null,
  last_name: 'last name',
  phone: '+54',
  cellphone: null,
  is_company: true,
  comments: 'a',
};

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
  },
  cellphone: {
    allowNull: true,
    type: 'string',
  },
  is_company: {
    allowNull: false,
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

Validator(object, objectModel);
