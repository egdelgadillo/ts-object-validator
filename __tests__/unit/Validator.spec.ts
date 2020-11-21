import { ValidateObject } from '../../src/utils/Validator';
import { ConvertToOptions } from '../../src/utils/ConvertToOptions';

/**
 * Mocks
 */

jest.spyOn(global.console, 'error');

/**
 * Global Declarations
 */

const validObject = {
  name: 'first name',
  last_name: 'last name',
  phone: '+595 888 7777',
  cellphone: '+595 888 7777',
  is_company: false,
  comments: 'a',
};

/**
 * Tests
 */

describe('ValidateObject', () => {
  describe('Property Validators', () => {
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
  });

  describe('Optional Properties', () => {
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

    it('should throw if none optional properties are present', () => {
      expect(() =>
        ValidateObject({ ...validObject }, optionalModel, {
          exitOnError: true,
        })
      ).toThrowError(
        'None of the optional properties defined by "name" are present.'
      );
    });

    it('should not fail if there is at least one optional property', () => {
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
  });

  describe('Property Dependencies', () => {
    describe('Object Dependencies', () => {
      const dependencyModel: ConvertToOptions<any> = {
        one: {
          type: 'number',
          allowNull: true,
          depends: [
            {
              two: {
                state: 'absent',
              },
              three: {
                state: 'present',
                validate: 'ifValue',
                valueToTest: 3,
              },
              four: {
                state: 'present',
                validate: 'ifNotValue',
                valueToTest: 4,
              },
            },
          ],
          alwaysPresent: true,
        },
      };

      it('should throw not absent property error', () => {
        expect(() =>
          ValidateObject(
            { one: 1, two: 2, three: 3, four: 0 },
            dependencyModel,
            {
              exitOnError: true,
            }
          )
        ).toThrowError(
          'Property "two" should not be present for "one" to be valid.'
        );
      });

      it('should not throw if absent property is not present', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).not.toThrow();
      });

      it('should throw missing dependency error', () => {
        expect(() =>
          ValidateObject({ one: 1, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError('Property "three" is missing.');
      });

      it('should throw required value invalid error', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 2, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError(
          'Property "one" requires "three" to have another value.'
        );
      });

      it('should not throw if required dependency is present and has correct value', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).not.toThrow();
      });

      it('should throw required value invalid error', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 4 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError('Property "one" requires "four" to have another value.');
      });

      it('should not throw if dependency does not have forbidden value', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 1 }, dependencyModel, {
            exitOnError: true,
          })
        ).not.toThrow();
      });
    });

    describe('Mixed Dependencies', () => {
      const dependencyModel: ConvertToOptions<any> = {
        one: {
          type: 'number',
          allowNull: true,
          depends: [
            'two',
            {
              three: {
                state: 'present',
                validate: 'ifValue',
                valueToTest: 3,
              },
              four: {
                state: 'present',
                validate: 'ifNotValue',
                valueToTest: 4,
              },
            },
          ],
          alwaysPresent: true,
        },
      };

      it('should throw missing dependency error', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError('Property "two" is missing.');

        expect(() =>
          ValidateObject({ one: 1, two: 2, four: 0 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError('Property "three" is missing.');
      });

      it('should throw invalid dependency value error', () => {
        expect(() =>
          ValidateObject(
            { one: 1, two: 2, three: 1, four: 0 },
            dependencyModel,
            {
              exitOnError: true,
            }
          )
        ).toThrowError(
          'Property "one" requires "three" to have another value.'
        );
      });

      it('should throw not allowed dependency value error', () => {
        expect(() =>
          ValidateObject(
            { one: 1, two: 2, three: 3, four: 4 },
            dependencyModel,
            {
              exitOnError: true,
            }
          )
        ).toThrowError('Property "one" requires "four" to have another value.');
      });

      it('should not throw error if all dependencies are present', () => {
        expect(() =>
          ValidateObject(
            { one: 1, two: 2, three: 3, four: 0 },
            dependencyModel,
            {
              exitOnError: true,
            }
          )
        ).not.toThrow();
      });
    });

    describe('String Dependencies', () => {
      const dependencyModel: ConvertToOptions<any> = {
        one: {
          type: 'number',
          allowNull: true,
          depends: ['two'],
          alwaysPresent: true,
        },
      };

      it('should throw missing dependency error', () => {
        expect(() =>
          ValidateObject({ one: 1 }, dependencyModel, {
            exitOnError: true,
          })
        ).toThrowError('Property "two" is missing.');
      });

      it('should not throw error if all dependencies are present', () => {
        expect(() =>
          ValidateObject({ one: 1, two: 2 }, dependencyModel, {
            exitOnError: true,
          })
        ).not.toThrow();
      });
    });
  });
});
