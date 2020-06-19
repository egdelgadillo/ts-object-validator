import { IObject } from './IObject';
import { ConvertToOptions } from './IConvert';

const object: IObject = {
  name: 'first name',
  last_name: 'last name',
  phone: '+54',
  cellphone: '+595',
  is_company: false,
};

const objectModel: ConvertToOptions<IObject> = {
  name: {
    type: 'string',
    allowNull: false,
    allowEmpty: true,
    depends: ['last_name'],
  },
  last_name: {
    type: 'string',
    allowEmpty: false,
    allowNull: false,
    depends: [{ is_company: { status: 'present', value: false } }],
  },
  phone: {
    type: 'string',
    allowNull: false,
    allowEmpty: true,
    depends: [{ cellphone: { status: 'absent' } }],
  },
  cellphone: {
    type: 'string',
    allowNull: false,
    allowEmpty: true,
    depends: [{ phone: { status: 'absent' } }],
  },
  is_company: {
    type: 'boolean',
    allowNull: false,
    depends: [{ name: { status: 'present', value: 'google' } }],
  },
};
