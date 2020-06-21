import { IOptions } from '../types/IOptions';
import { ConvertToOptions } from './ConvertToOptions';

export const ValidateObject = (
  object: { [key: string]: any },
  model: ConvertToOptions<any>
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
      console.log(
        'ERROR: Property "',
        propertyName,
        '" is required but not present'
      );
    }

    // Check if required properties are null
    if (
      'alwaysPresent' in modelProperty &&
      modelProperty.alwaysPresent &&
      object[propertyName] == null
    ) {
      console.log(
        'ERROR: Property "',
        propertyName,
        '" is required and cannot be null'
      );
    }

    // Check if one of the optional properties is present
    if (
      !(propertyName in object) &&
      'oneOf' in modelProperty &&
      modelProperty.oneOf &&
      modelProperty.oneOf.length > 0
    ) {
      let presentProperties = false;
      for (const propertyName in modelProperty) {
        if (propertyName in object) {
          presentProperties = true;
        }
      }
      if (!presentProperties) {
        console.log(
          'ERROR: None of the optional properties defined by "',
          propertyName,
          '" are present.'
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
      console.log('ERROR: Property "', propertyName, '" type is invalid');
    }

    // Check if string properties are empty strings
    if (modelProperty.type === 'string' && objectPropertyValue === '') {
      // Check if String properties are empty
      console.log('ERROR: Property "', propertyName, '" is empty');
    }

    // Check if number properties are negative numbers
    if (modelProperty.type === 'number' && objectPropertyValue < 0) {
      // Check if String properties are empty
      console.log('ERROR: Property "', propertyName, '" is a negative number');
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
            console.log(
              'ERROR: Property "',
              dependencyName,
              '" should not be present for "',
              propertyName,
              "' to be valid."
            );
          }

          // Check if dependency meets required value
          if (
            dependencyOptions.status === 'present' &&
            dependencyOptions.validate === 'ifValue'
          ) {
            // Check if the dependency is present
            if (!(dependencyName in object)) {
              console.log('ERROR: Property "', dependencyName, '" is missing');
            }

            // Check if the dependency has required value
            if (object[dependencyName] !== dependencyOptions.requiredValue) {
              console.log(
                'ERROR: Property "',
                propertyName,
                '" requires "',
                dependencyName,
                '" to have another value'
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
              console.log('ERROR: Property "', dependencyName, '" is missing');
            }

            // Check if the dependency has not required value
            if (object[dependencyName] === dependencyOptions.requiredValue) {
              console.log(
                'ERROR: Property "',
                propertyName,
                '" requires "',
                dependencyName,
                '" to have another value'
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
            console.log(
              'ERROR: Property "',
              dependencyName,
              '" is missing or null.'
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
        console.log(
          'ERROR: Property "',
          dependencyName,
          '" is missing or null.'
        );
      }
    }
  }
};
