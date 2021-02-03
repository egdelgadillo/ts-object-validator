import { ConvertToOptions } from '../types/ConvertToOptions';
import isPlainObject from 'lodash.isplainobject';

export const ValidateObject = <T extends { [key: string]: any }>(
  testedObject: T,
  validatorModel: ConvertToOptions<any>,
  options?: { throwOnError?: boolean; forceRequired?: boolean }
) => {
  try {
    // Validate properties that should not be present
    for (const validatedPropertyName in validatorModel) {
      const validatorPropertyValues = validatorModel[validatedPropertyName];
      const testedObjectPropertyValue = testedObject[validatedPropertyName];

      if (
        'allowed' in validatorPropertyValues &&
        validatedPropertyName in testedObject
      ) {
        throw new Error(
          `Property "${validatedPropertyName}" cannot be present.`
        );
      }

      // Validate required properties
      if (
        'required' in validatorPropertyValues &&
        validatorPropertyValues.required &&
        !(validatedPropertyName in testedObject)
      ) {
        if (
          !options ||
          !('forceRequired' in options) ||
          options.forceRequired
        ) {
          throw new Error(
            `Property "${validatedPropertyName}" is required and should be present, but it is not.`
          );
        }
      }

      // Validate always present properties are present
      if (
        'alwaysPresent' in validatorPropertyValues &&
        !(validatedPropertyName in testedObject)
      ) {
        throw new Error(
          `Property "${validatedPropertyName}" should always be present, but it is not.`
        );
      }

      // Validate properties that should not be null
      if (
        'allowNull' in validatorPropertyValues &&
        validatedPropertyName in testedObject
      ) {
        // Test if the object property's value is null
        if (
          !validatorPropertyValues.allowNull &&
          testedObjectPropertyValue == null
        ) {
          throw new Error(
            `Property "${validatedPropertyName}" cannot be null.`
          );
        }
      }

      // Validate if at least one of the optional properties is present
      if (
        'oneOf' in validatorPropertyValues &&
        validatedPropertyName in testedObject
      ) {
        let anyOptionalPresent = false;
        for (const optionalProperties of validatorPropertyValues.oneOf!) {
          if (optionalProperties in testedObject) {
            anyOptionalPresent = true;
          }
        }
        if (!anyOptionalPresent) {
          throw new Error(
            `None of the optional properties required by "${validatedPropertyName}" are present.`
          );
        }
      }

      // Validate if property type is correct
      if (
        'type' in validatorPropertyValues &&
        validatedPropertyName in testedObject
      ) {
        if (
          validatorPropertyValues.type === 'object' &&
          !isPlainObject(testedObjectPropertyValue)
        ) {
          // Object types

          if (
            'allowNull' in validatorPropertyValues &&
            !validatorPropertyValues.allowNull
          ) {
            throw new Error(
              `Property "${validatedPropertyName}" type is invalid.`
            );
          }
        } else if (
          validatorPropertyValues.type === 'array' &&
          !Array.isArray(testedObjectPropertyValue)
        ) {
          // Array types
          if (
            'allowNull' in validatorPropertyValues &&
            !validatorPropertyValues.allowNull
          ) {
            throw new Error(
              `Property "${validatedPropertyName}" type is invalid.`
            );
          }
        } else {
          // Normal types
          if (
            typeof testedObjectPropertyValue !== validatorPropertyValues.type
          ) {
            if (
              'allowNull' in validatorPropertyValues &&
              !validatorPropertyValues.allowNull
            ) {
              throw new Error(
                `Property "${validatedPropertyName}" type is invalid.`
              );
            }
          }
        }
      }

      // Validate if values are allowed
      if (
        'allowedValues' in validatorPropertyValues &&
        validatedPropertyName in testedObject
      ) {
        const allowedValues = validatorPropertyValues.allowedValues as any[];
        if (
          allowedValues.length &&
          !allowedValues.includes(testedObjectPropertyValue)
        ) {
          if (testedObjectPropertyValue !== null) {
            throw new Error(
              `Property "${validatedPropertyName}" values are invalid.`
            );
          }
        }
      }

      // Check if string properties are empty
      if (
        typeof testedObjectPropertyValue === 'string' &&
        testedObjectPropertyValue === ''
      ) {
        throw new Error(`Property "${validatedPropertyName}" is empty.`);
      }

      // Check if number properties are negative
      if (
        typeof testedObjectPropertyValue === 'number' &&
        testedObjectPropertyValue < 0
      ) {
        throw new Error(
          `Property "${validatedPropertyName}" cannot be a negative number..`
        );
      }

      // Check dependencies
      if ('depends' in validatorPropertyValues) {
        const depends = validatorPropertyValues.depends;
        // Check if 'depends' is an array of dependencies
        if (Array.isArray(depends)) {
          const dependenciesArray = depends;

          // Loop all dependencies
          for (const dependency of dependenciesArray) {
            // Dependency is an object
            if (typeof dependency === 'object') {
              // Loop all dependency rules
              for (const dependencyPropertyName in dependency) {
                const dependencyOptions = dependency[dependencyPropertyName];

                // Check if properties are absent
                if (
                  dependencyOptions.state === 'absent' &&
                  dependencyPropertyName in testedObject
                ) {
                  throw new Error(
                    `Property "${dependencyPropertyName}" should not be present for "${validatedPropertyName}" to be valid.`
                  );
                }

                // Check if dependency meets required value
                if (
                  dependencyOptions.state === 'present' &&
                  dependencyOptions.validate === 'ifValue'
                ) {
                  // Check if the dependency is present
                  if (!(dependencyPropertyName in testedObject)) {
                    throw new Error(
                      `Property "${dependencyPropertyName}" is missing.`
                    );
                  }

                  // Check if the dependency has required value
                  if (
                    'valueToTest' in dependencyOptions &&
                    testedObject[dependencyPropertyName] !==
                      dependencyOptions.valueToTest
                  ) {
                    throw new Error(
                      `Property "${validatedPropertyName}" requires "${dependencyPropertyName}" to be equal to another value.`
                    );
                  }

                  // Check if dependency has required property value
                  if (
                    'propertyToTest' in dependencyOptions &&
                    testedObject[dependencyPropertyName] !==
                      testedObject[dependencyOptions.propertyToTest as keyof T]
                  ) {
                    throw new Error(
                      `Property "${validatedPropertyName}" requires "${dependencyPropertyName}" to be equal to another value.`
                    );
                  }
                }

                // Check if dependency does not meet required  value
                if (
                  dependencyOptions.state === 'present' &&
                  dependencyOptions.validate === 'ifNotValue'
                ) {
                  // Check if the dependency is present
                  if (!(dependencyPropertyName in testedObject)) {
                    throw new Error(
                      `Property "${dependencyPropertyName}" is missing.`
                    );
                  }

                  // Check if the dependency has not required value
                  if (
                    'valueToTest' in dependencyOptions &&
                    testedObject[dependencyPropertyName] ===
                      dependencyOptions.valueToTest
                  ) {
                    throw new Error(
                      `Property "${validatedPropertyName}" requires "${dependencyPropertyName}" to have another value.`
                    );
                  }

                  // Check if dependency has required property value
                  if (
                    'propertyToTest' in dependencyOptions &&
                    testedObject[dependencyPropertyName] ===
                      testedObject[dependencyOptions.propertyToTest as keyof T]
                  ) {
                    throw new Error(
                      `Property "${validatedPropertyName}" requires "${dependencyPropertyName}" to have another value.`
                    );
                  }
                }
              }
            }

            // Dependency is a string
            if (typeof dependency === 'string') {
              if (!(dependency in testedObject)) {
                throw new Error(`Property "${dependency}" is missing.`);
              }
            }
          }
        }

        // Check if 'depends' is a single string
        else if (typeof depends === 'string') {
          if (!(depends in testedObject)) {
            throw new Error(`Property "${depends}" is missing.`);
          }
        }
      }
    }

    return testedObject;
  } catch (err) {
    if (options?.throwOnError) {
      throw err;
    }
    console.error(err.message);
  }
  return null;
};
