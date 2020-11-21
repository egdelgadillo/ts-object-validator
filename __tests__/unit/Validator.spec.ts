import { ValidateObject } from '../../src/utils/Validator';
import { ConvertToOptions } from '../../src/utils/ConvertToOptions';

/**
 * Mocks
 */

jest.spyOn(global.console, 'error');

/**
 * Declarations
 */

const validObject = {
  name: 'first name',
  last_name: 'last name',
  phone: '+595 888 7777',
  cellphone: '+595 888 7777',
  is_company: false,
  comments: 'a',
};

const objectModel: ConvertToOptions<any> = {
  name: {
    type: 'string',
    alwaysPresent: true,
    allowNull: false,
  },
  counter: {
    type: 'number',
    allowNull: true,
  },
};

const dependencyModel: ConvertToOptions<any> = {
  one: {
    type: 'number',
    allowNull: true,
    depends: [
      {
        two: {
          status: 'absent',
        },
        three: {
          status: 'present',
          validate: 'ifValue',
          requiredValue: 3,
        },
      },
    ],
    alwaysPresent: true,
  },
};

/**
 * Tests
 */

describe('ValidateObject', () => {
  it('should throw an error if invalid', () => {
    expect(() =>
      ValidateObject(
        { ...validObject, name: null },
        { ...objectModel },
        { exitOnError: true }
      )
    ).toThrow();
  });

  it('should NOT throw an error even if invalid', () => {
    expect(() =>
      ValidateObject(validObject, objectModel, { exitOnError: false })
    ).not.toThrow();
  });

  it('should not fail if object is valid', () => {
    expect(() =>
      ValidateObject(validObject, objectModel, { exitOnError: true })
    ).not.toThrow();
  });

  it('should throw required property error', () => {
    expect(() =>
      ValidateObject({}, objectModel, {
        exitOnError: true,
      })
    ).toThrowError('Property "name" is required but not present.');
  });

  it('should throw null property error', () => {
    expect(() =>
      ValidateObject({ ...validObject, name: null }, objectModel, {
        exitOnError: true,
      })
    ).toThrowError('Property "name" is required and cannot be null.');
  });

  it('should not fail if there is at least one optional property', () => {
    const optionalModel: any = {
      name: {
        type: 'string',
        oneOf: ['optional1', 'optional2'],
      },
      optional1: {
        type: 'string',
        alwaysPresent: false,
      },
      optional2: {
        type: 'string',
        alwaysPresent: false,
      },
    };

    expect(() =>
      ValidateObject(
        { ...validObject, optional1: '' },
        { optionalModel },
        { exitOnError: true }
      )
    ).not.toThrow();

    expect(() =>
      ValidateObject(
        { ...validObject, optional2: '' },
        { optionalModel },
        { exitOnError: true }
      )
    ).not.toThrow();
  });

  it('should fail if none optional properties are present', () => {
    const optionalModel: any = {
      name: {
        type: 'string',
        oneOf: ['optional1'],
      },
    };
    expect(() =>
      ValidateObject({ ...validObject }, optionalModel, {
        exitOnError: true,
      })
    ).toThrowError(
      'None of the optional properties defined by "name" are present.'
    );
  });

  it('should throw invalid type error', () => {
    expect(() =>
      ValidateObject({ ...validObject, name: 0 }, objectModel, {
        exitOnError: true,
      })
    ).toThrowError('Property "name" type is invalid.');
  });

  it('should throw empty property error', () => {
    expect(() =>
      ValidateObject({ ...validObject, name: '' }, objectModel, {
        exitOnError: true,
      })
    ).toThrowError('Property "name" is empty.');
  });

  it('should throw negative number error', () => {
    expect(() =>
      ValidateObject({ ...validObject, counter: -1 }, objectModel, {
        exitOnError: true,
      })
    ).toThrowError('Property "counter" cannot be a negative number.');
  });

  describe('Property Dependencies', () => {
    it('should throw not absent property error', () => {
      expect(() =>
        ValidateObject({ one: 1, two: 2 }, dependencyModel, {
          exitOnError: true,
        })
      ).toThrowError(
        'Property "two" should not be present for "one" to be valid.'
      );
    });

    it('should throw required value invalid error', () => {
      expect(() =>
        ValidateObject({ one: 1 }, dependencyModel, {
          exitOnError: true,
        })
      ).toThrowError('Property "one" requires "three" to have another value.');
    });
  });
});
