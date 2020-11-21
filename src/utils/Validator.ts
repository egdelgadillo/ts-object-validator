import { ConvertToOptions } from './ConvertToOptions';

const handleError = (
  errorMessage: string,
  options?: { exitOnError: boolean }
) => {
  if (options?.exitOnError) {
    throw new Error(errorMessage);
  }
  console.error(`Error: ${errorMessage}`);
};

export const ValidateObject = (
  object: { [key: string]: any },
  model: ConvertToOptions<any>,
  options?: { exitOnError: boolean }
) => {
  for (const propertyName in model) {
    const modelProperty = model[propertyName];
    const objectPropertyValue = object[propertyName];

    // Check if required properties are present
    if (
      'alwaysPresent' in modelProperty &&
      modelProperty.alwaysPresent &&
      !(propertyName in object)
    ) {
      handleError(
        `Property "${propertyName}" is required but not present.`,
        options
      );
    }

    // Check if required properties are null
    if (
      'alwaysPresent' in modelProperty &&
      modelProperty.alwaysPresent &&
      object[propertyName] == null
    ) {
      handleError(
        `Property "${propertyName}" is required and cannot be null.`,
        options
      );
    }

    // Check if at least one of the optional properties is present
    if (
      propertyName in object &&
      'oneOf' in modelProperty &&
      modelProperty.oneOf &&
      modelProperty.oneOf.length > 0
    ) {
      let presentProperties = false;
      for (const propertyName of modelProperty.oneOf) {
        if (propertyName in object) {
          presentProperties = true;
        }
      }
      if (!presentProperties) {
        handleError(
          `None of the optional properties defined by "${propertyName}" are present.`,
          options
        );
      }
    }

    // We skip properties if are not required and are not present
    if (!('alwaysPresent' in modelProperty) && !(propertyName in object)) {
      continue;
    }

    const allowNull =
      'alwaysPresent' in modelProperty ? false : modelProperty.allowNull;

    // Validate the property type
    if (
      typeof objectPropertyValue !== modelProperty.type &&
      !(allowNull && objectPropertyValue == null)
    ) {
      handleError(`Property "${propertyName}" type is invalid.`, options);
    }

    // Check if string properties are empty strings
    if (modelProperty.type === 'string' && objectPropertyValue === '') {
      // Check if String properties are empty

      handleError(`Property "${propertyName}" is empty.`, options);
    }

    // Check if number properties are negative numbers
    if (modelProperty.type === 'number' && objectPropertyValue < 0) {
      // Check if String properties are empty
      handleError(
        `Property "${propertyName}" cannot be a negative number.`,
        options
      );
    }

    // If the dependencies is an array or strings and/or objects
    if (typeof modelProperty.depends === 'object') {
      modelProperty.depends.forEach((dependency) => {
        // If the dependency is an object
        if (typeof dependency === 'object') {
          const dependencyName = Object.keys(dependency)[0];
          const dependencyOptions = dependency[dependencyName];
          // Check if the dependency property is absent
          if (
            dependencyOptions.status === 'absent' &&
            dependencyName in object
          ) {
            handleError(
              `Property "${dependencyName}" should not be present for "${propertyName}" to be valid.`,
              options
            );
          }

          // Check if dependency meets required value
          if (
            dependencyOptions.status === 'present' &&
            dependencyOptions.validate === 'ifValue'
          ) {
            // Check if the dependency is present
            if (!(dependencyName in object)) {
              handleError(`Property "${dependencyName}" is missing.`, options);
            }

            // Check if the dependency has required value
            if (object[dependencyName] !== dependencyOptions.requiredValue) {
              handleError(
                `Property "${propertyName}" requires "${dependencyName}" to have another value.`,
                options
              );
            }
          }

          // Check if dependency meets required NOT value
          if (
            dependencyOptions.status === 'present' &&
            dependencyOptions.validate === 'ifNotValue'
          ) {
            // Check if the dependency is present
            if (!(dependencyName in object)) {
              handleError(`Property "${dependencyName}" is missing.`, options);
            }

            // Check if the dependency has not required value
            if (object[dependencyName] === dependencyOptions.requiredValue) {
              handleError(
                `Property "${propertyName}" requires "${dependencyName}" to have another value.`,
                options
              );
            }
          }
        }

        // Check if the dependency is a string
        if (typeof dependency === 'string') {
          const dependencyName = dependency;
          if (
            !(dependencyName in object) ||
            (object[dependencyName] !== 0 && !object[dependencyName])
          ) {
            handleError(
              `Property "${dependencyName}" is missing or null.`,
              options
            );
          }
        }
      });
    }

    // If the dependency is a single string
    if (typeof modelProperty.depends === 'string') {
      const dependencyName = modelProperty.depends;
      if (
        !(dependencyName in object) ||
        (object[dependencyName] !== 0 && !object[dependencyName])
      ) {
        handleError(
          `Property "${dependencyName}" is missing or null.`,
          options
        );
      }
    }
  }
};
