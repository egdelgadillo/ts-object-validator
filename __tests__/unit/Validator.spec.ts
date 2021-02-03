import { ValidateObject } from '../../src/utils/Validator';
import { ConvertToOptions } from '../../src/types/ConvertToOptions';

/**
 * Mocks
 */

console.error = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Global Declarations
 */

const validObject = {
  name: 'first name',
  last_name: 'last name',
  phone: '+595 888 7777',
  cellphone: '+595 888 7777',
  is_company: false,
  comments: 'allowedValue',
};

/**
 * Tests
 */

describe('ValidateObject', () => {
  describe('Property Validators', () => {
    const objectModel: ConvertToOptions<any> = {
      id: {
        allowed: false,
      },
      name: {
        type: 'string',
        alwaysPresent: true,
        allowNull: false,
      },
      counter: {
        type: 'number',
        allowNull: true,
      },
      comments: {
        type: 'string',
        allowNull: true,
        allowedValues: ['allowedValue'],
      },
    };

    it('should throw an error if invalid', () => {
      expect(() =>
        ValidateObject(
          { ...validObject, name: null },
          { ...objectModel },
          { throwOnError: true }
        )
      ).toThrow();
    });

    it('should NOT throw an error even if invalid', () => {
      expect(() =>
        ValidateObject(validObject, objectModel, { throwOnError: false })
      ).not.toThrow();
    });

    it('should fail if required property is not present', () => {
      const requiredValidatorModel: ConvertToOptions<any> = {
        name: {
          type: 'string',
          allowNull: false,
          required: true,
        },
      };
      const result1 = ValidateObject({}, requiredValidatorModel);
      expect(result1).toEqual(null);

      expect(() =>
        ValidateObject({}, requiredValidatorModel, {
          throwOnError: true,
        })
      ).toThrowError(
        'Property "name" is required and should be present, but it is not.'
      );
      expect(() =>
        ValidateObject({}, requiredValidatorModel, {
          forceRequired: true,
          throwOnError: true,
        })
      ).toThrowError(
        'Property "name" is required and should be present, but it is not.'
      );
    });

    it('should NOT fail if required property is not present', () => {
      const notRequiredValidatorModel: ConvertToOptions<any> = {
        name: {
          type: 'string',
          allowNull: false,
          required: false,
        },
      };
      const requiredValidatorModel: ConvertToOptions<any> = {
        name: {
          type: 'string',
          allowNull: false,
          required: true,
        },
      };

      const result1 = ValidateObject({}, notRequiredValidatorModel, {
        forceRequired: true,
      });
      expect(result1).not.toEqual(null);

      const result2 = ValidateObject({}, notRequiredValidatorModel);
      expect(result2).not.toEqual(null);

      const result3 = ValidateObject({}, requiredValidatorModel, {
        forceRequired: false,
      });
      expect(result3).not.toEqual(null);

      expect(() =>
        ValidateObject({}, notRequiredValidatorModel, {
          throwOnError: true,
          forceRequired: false,
        })
      ).not.toThrowError(
        'Property "name" is required and should be present, but it is not.'
      );
    });

    it('should not fail if object is valid', () => {
      expect(() =>
        ValidateObject(validObject, objectModel, { throwOnError: true })
      ).not.toThrow();
    });

    it('should throw required property error', () => {
      expect(() =>
        ValidateObject({}, objectModel, {
          throwOnError: true,
        })
      ).toThrowError('Property "name" should always be present, but it is not');
    });

    it('should throw null property error', () => {
      expect(() =>
        ValidateObject({ ...validObject, name: null }, objectModel, {
          throwOnError: true,
        })
      ).toThrowError('Property "name" cannot be null.');
    });

    it('should throw invalid type error', () => {
      expect(() =>
        ValidateObject({ ...validObject, name: 0 }, objectModel, {
          throwOnError: true,
        })
      ).toThrowError('Property "name" type is invalid.');
    });

    it('should throw empty property error', () => {
      expect(() =>
        ValidateObject({ ...validObject, name: '' }, objectModel, {
          throwOnError: true,
        })
      ).toThrowError('Property "name" is empty.');
    });

    it('should throw negative number error', () => {
      expect(() =>
        ValidateObject({ ...validObject, counter: -1 }, objectModel, {
          throwOnError: true,
        })
      ).toThrowError('Property "counter" cannot be a negative number.');
    });

    it('should throw forbidden property', () => {
      expect(() =>
        ValidateObject(
          { ...validObject, id: '63b6d31a-52fa-4269-a1dd-7cb6dc39e67b' },
          objectModel,
          {
            throwOnError: true,
          }
        )
      ).toThrowError('Property "id" cannot be present.');
    });

    it('should throw if value is not allowed', () => {
      expect(() =>
        ValidateObject({ ...validObject, comments: 'invalid' }, objectModel, {
          throwOnError: true,
          forceRequired: false,
        })
      ).toThrowError('Property "comments" values are invalid.');
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
          throwOnError: true,
        })
      ).toThrowError(
        'None of the optional properties required by "name" are present.'
      );
    });

    it('should not fail if there is at least one optional property', () => {
      expect(() =>
        ValidateObject(
          { ...validObject, optional1: '' },
          { optionalModel },
          { throwOnError: true }
        )
      ).not.toThrow();

      expect(() =>
        ValidateObject(
          { ...validObject, optional2: '' },
          { optionalModel },
          { throwOnError: true }
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
              throwOnError: true,
            }
          )
        ).toThrowError(
          'Property "two" should not be present for "one" to be valid.'
        );
      });

      it('should not throw if absent property is not present', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 0 }, dependencyModel, {
            throwOnError: true,
          })
        ).not.toThrow();
      });

      it('should throw missing dependency error', () => {
        expect(() =>
          ValidateObject({ one: 1, four: 0 }, dependencyModel, {
            throwOnError: true,
          })
        ).toThrowError('Property "three" is missing.');
      });

      it('should throw required value invalid error', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 2, four: 0 }, dependencyModel, {
            throwOnError: true,
          })
        ).toThrowError(
          'Property "one" requires "three" to have another value.'
        );
      });

      it('should not throw if required dependency is present and has correct value', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 0 }, dependencyModel, {
            throwOnError: true,
          })
        ).not.toThrow();
      });

      it('should throw required value invalid error', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 4 }, dependencyModel, {
            throwOnError: true,
          })
        ).toThrowError('Property "one" requires "four" to have another value.');
      });

      it('should not throw if dependency does not have forbidden value', () => {
        expect(() =>
          ValidateObject({ one: 1, three: 3, four: 1 }, dependencyModel, {
            throwOnError: true,
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
            throwOnError: true,
          })
        ).toThrowError('Property "two" is missing.');

        expect(() =>
          ValidateObject({ one: 1, two: 2, four: 0 }, dependencyModel, {
            throwOnError: true,
          })
        ).toThrowError('Property "three" is missing.');
      });

      it('should throw invalid dependency value error', () => {
        expect(() =>
          ValidateObject(
            { one: 1, two: 2, three: 1, four: 0 },
            dependencyModel,
            {
              throwOnError: true,
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
              throwOnError: true,
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
              throwOnError: true,
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
            throwOnError: true,
          })
        ).toThrowError('Property "two" is missing.');
      });

      it('should not throw error if all dependencies are present', () => {
        expect(() =>
          ValidateObject({ one: 1, two: 2 }, dependencyModel, {
            throwOnError: true,
          })
        ).not.toThrow();
      });
    });
  });
});
