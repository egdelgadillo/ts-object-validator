# Object Validator

The object validator is used to verify a _not trusted_ object, coming from external APIs, by using a pre-defined model with specific rules that object **should** follow.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Use Cases](#use-cases)
- [What I Learned](#what-i-learned)
- [Usage](#usage)
- [Validator Model features](#validator-model-features)
- [Examples](#examples)
- [Collaborating](#collaborating)

## Use Cases

**Object Validator** is very useful when needing to validate objects coming from the APIs, making the validation easier and the validation code shorter and clearer. The model manages to condense the rules necessary to consider an object as valid in as minimum lines as possible and very easy to read as it is basically a javascript object.

## What I Learned

- **Advanced Generic Interfaces**

  Making this project I strengthened my typescript **Interfaces** skills. It was very challenging to use the proper **Generic** interfaces where needed. The goal I had while setting up this project was to avoid the use of the **any** type as much as possible, except in the places where it was really needed. This is why I consider this project uses _advanced generic interfaces_.

- **Unit Testing** with Jest

  A very important part of each project is testing. This project is no stranger to unit testing using Jest. This project helped me remember the importance to apply unit testing in all of my projects, even personal ones.

## Usage

An example of an object and the model is provided in the `app.ts` file. You can run it using **ts-node**:

```bash
ts-node src/app
```

or by compiling it and run it using the built-in script:

```bash
npm start
```

For each property that does not follow the model requirements, the validator will print each error to the console:

```bash
Error: Property "last_name" requires "is_company" to have another value
Error: Property "phone" requires "cellphone" to have another value
Error: Property "is_company" requires "name" to have another value
```

Ths behavior can be changed by passing the `{exitOnError: true}` options to the validator:

```bash
Validator.js:6
  throw new Error(errorMessage);
        ^

Error: Property "last_name" requires "is_company" to have another value.
  at handleError (Validator.js:6:15)
  ...
  at Function.Module._load (internal/modules/cjs/loader.js:878:14)
```

## Validator Model features

The _hauptspeise_ of this project is the creation of the **model**. This will inherit the required properties from the interface (Does not matter if the object contains optional properties) which will be provided as a generic type.

The model options for each interface property are:

- `alwaysPresent`: **Required**: This ensures the property must always be present on the object otherwise it will console log an error. **Not available if `allowNull` is provided.** (Should it be changed to `required` instead?)
- `allowNull`: **Required**: This allows the object property to be `null`. **Not available if `alwaysPresent` is provided.**
- `type`: The type the property should have. This does include `null` if `allowNull` is set to true. (If `alwaysPresent` is `false` and the type is `null` will print an error).
- `depends`: This is the most complex of all the properties. By default it only accepts properties that are present on the object interface. It has various possible values:

  - **A single string**: The property that is indicated here will have to be present, although it will not be checked for valid values.
  - **An array**: This array can contain strings as well as objects. All strings will be verified if those properties are present on the object, similar to the _single string_ value cited above. If one of the items is an object it will require the following properties:

    - **Name of the object** must be one of object interface properties.
    - `status`: Valid values are `'present'` and `'absent'` (Should be changed to `state`?)

      - `'absent'`: The property must not be present on the object for an error not to be printed.
      - `'present'`: The property must be present on the object and it must fullfil the other properties.

    - `validate`: **Only available if** `status` is `'present'`. Has two possible values: `'ifValue'` and `'ifNotValue'`

      - `'ifValue'`: This property must be equal to the value specified in the `requiredValue` property otherwise an error will be printed.
      - `'ifNotValue'`: This property must NOT be equal to the value specified in the `requiredValue` property otherwise an error will be printed.

    - `'requiredValue'`: The value to which the object property will be compared to, depending on the value of the `validate` property.

- `oneOf`: This will validated if the property **is not present** in the object and will print an error if **none** of the properties listed there are present on the object.

## Examples

Given the following object interface:

```typescript
interface Test {
  name: string;
  last_name: string;
  number: number;
}
```

We define the model with the rules each property should have (We use the _ConvertToOptions_ type to make the model follow the Interface properties):

```typescript
const model: ConvertToOptions<IObject> = {
  name: {
    alwaysPresent: true,
    type: string,
    depends: ['last_name', 'number'],
  },
  last_name: {
    allowNull: false,
    type: string,
    depends: [
      {
        name: {
          status: 'present',
          validate: 'ifValue',
          requiredValue: 'John',
        },
      },
      {
        number: {
          status: 'present',
          validate: 'ifNotValue',
          requiredValue: 0,
        },
      },
    ],
  },
  number: {
    allowNull: true,
    type: number,
    depends: 'name',
    oneOf: ['name', 'last_name'],
  },
};
```

## Collaborating

The perfect place for collaboration is the [development](https://github.com/egdelgadillo/ts-object-validator/tree/develop) branch. All Pull Requests should be done to that branch, and those changes will eventually be pulled to the master branch.
