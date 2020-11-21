# Object Validator

The object validator is used to verify a _not trusted_ object, coming from external APIs, by using a pre-defined model with specific rules that object **should** follow.

## Contents

- [Contents](#contents)
- [Use Cases](#use-cases)
- [What I Learned](#what-i-learned)
- [Usage](#usage)
- [ConvertToOptions Helper Type](#converttooptions-helper-type)
- [Validator Model features](#validator-model-features)
- [ValidateObject Method](#validateobject-method)
- [Examples](#examples)
- [Collaborating](#collaborating)
- [License](#license)

## Use Cases

**Object Validator** is very useful when needing to validate objects coming from the APIs, making the validation easier and the validation code shorter and clearer. The model manages to condense the rules necessary to consider an object as valid in as minimum lines as possible and very easy to read as it is basically a javascript object.

## What I Learned

- **Advanced Typescript**

  This project features many advanced topics of the _Typescript_ superset, such as interfaces, ES6 loops, testing, etc. Although I already knew typescript before I started this project, it helped me settle some more advanced topics on the sibject.

- **Advanced Generic Interfaces**

  Making this project I strengthened my typescript **Interfaces** skills. It was very challenging to use the proper **Generic** interfaces where needed. The goal I had while setting up this project was to avoid the use of the **any** type as much as possible, except in the places where it was really needed. This is why I consider this project uses _advanced generic interfaces_.

- **Unit Testing** with Jest

  A very important part of each project is testing. This project is no stranger to unit testing using Jest. This project helped me remember the importance to apply unit testing in all of my projects, even personal ones.

- **NPM Packages**

  I provide this project as an npm package. This was the first time I created an NPM package and published it. A nice guide can be found [here](https://gist.github.com/coolaj86/1318304/27bc153c639dbbb7dee17c16bf4d5108afe28b44) for manual publish or [here](https://github.com/marketplace/actions/publish-to-npm) if you want github to handle the publications to NPM.

- Documentation

  As you can tell by this documentation, I'm used to documenting all my projects with nice, complete and updated documentation (This is a sample project nevertheless).

- Licensing repositories

  This is the first project I add a license to. This was also a new experience for me, as I had to look up information on different licenses, to find the one that fit my expectations.

## Usage

1. Install the package

```bash
npm install --save ts-object-validator
```

2. We import the required methods and types

```typescript
import { ConvertToOptions, ValidateObject } from 'ts-object-validator';
```

3. Create an Interface

4. Create the Model using the ConvertToOptions type alongside the Interface

5. Call the ValidateObject method with the object to verify and the model it should follow

**An example of an object and the model is provided in the `example.ts` file**. You can run it using **ts-node**:

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

**For more information go to the [Examples](#examples) section.**

## ConvertToOptions Helper Type

The project provides a helper type which can be used to create the **Validator Model**. The **ConvertToOptions** requires a type/interface to be provided as a _Generic Argument_. This type will latter convert each property of the provided interface and transform it to an **IOptions** type, which encapsulates all the possible properties a valid Validator Model should have based on the properties of the provided interface.

## Validator Model features

The _hauptspeise_ of this project is the creation of the **model**. This will inherit the required properties from the interface (Does not matter if the object contains optional properties) which will be provided as a generic type through the use of the **ConvertToOptions** helper type (See the [ConvertToOptions Helper Type](#converttooptions-helper-type) section for more information).

The model options for each interface property are:

- `alwaysPresent`: **Required**: This ensures the property must always be present on the object otherwise it will console log an error. **Not required if `allowNull` is provided.** (Although both can be used at the same time no matter what)
- `allowNull`: **Required**: This allows the object property to be `null`. **Not required if `alwaysPresent` is provided.** (See `alwaysPresent` for more information)
- `type`: The type the property should have. This includes a wide range of possible values (See the type for more information)
- `depends`: This is the most complex of all the properties. By default it only accepts properties that are present on the object interface. It has various possible values:

  - **A single string**: The property that is indicated here will have to be present, although it will not be checked for valid values.
  - **An array**: This array can contain **strings** as well as **objects** (They can be mixed in the same array). All strings will be verified to be present in the object, similar to the _single string_ value cited above. If one of the items is an object it will require the following properties:

    - **Name of the object** must be one of object interface properties.
    - `state`: Valid values are `'present'` and `'absent'`.

      - `'absent'`: The property must not be present on the object for an error not to be printed.
      - `'present'`: The property must be present on the object and it must fullfil the other properties.

    - `validate`: **Only available if** `state` is `'present'`. Has two possible values: `'ifValue'` and `'ifNotValue'`

      - `'ifValue'`: This property must be equal to the value specified in the `valueToTest` property otherwise an error will be printed.
      - `'ifNotValue'`: This property must NOT be equal to the value specified in the `valueToTest` property otherwise an error will be printed.

    - `'valueToTest'`: The value to which the object property will be compared to, depending on the value of the `validate` property.

- `oneOf`: This consists of a **string array** which can only contain the property names of the object. At least one of the properties stated there should be present in the object for the object to be considered valid. If none are present an error will be thrown or printed.

## ValidateObject Method

The **ValidateObject** method takes 2 required arguments as well as another optional argument:

```typescript
ValidateObject(object, model, { exitOnError: false });
```

The first argument, the **object**, is the object we want to check or verify. This should be an object which origin we do not trust (Or should not, as good practices), for example from external APIs or user input APIs.

The second argument, the **model**, is the model we configured to test the object with, which holds all the business rules we want it to follow.

The third and **optional** argument, the **options**, can have only 1 property: `exitOnError` which is used to configure wether the validator should print the errors to the console or throw to the first error it encounters while validating the object. The **default value** is `false`, which means that if not provided, the validator will only print the errors to the console (if any) without throwing.

## Examples

Given the following object interface:

```typescript
interface IExample {
  name: string;
  last_name: string;
  number: number;
  comments: string;
}
```

We define the model with the rules each property should have (We use the _ConvertToOptions_ type to make the model follow the Interface properties):

```typescript
const modelExample: ConvertToOptions<IExample> = {
  name: {
    alwaysPresent: true,
    type: 'string',
    depends: ['last_name', 'number'],
  },
  last_name: {
    allowNull: false,
    type: 'string',
    depends: [
      {
        name: {
          state: 'present',
          validate: 'ifValue',
          valueToTest: 'John',
        },
        number: {
          state: 'present',
          validate: 'ifNotValue',
          valueToTest: 0,
        },
      },
      'comments',
    ],
  },
  number: {
    allowNull: true,
    type: 'number',
    depends: 'name',
    oneOf: ['name', 'last_name'],
  },
  comments: {
    allowNull: true,
    type: 'string',
  },
};
```

Then we call the validator to test the object

```typescript
// We get the object we want to test
const objectToTest = { name: 'John', last_name: 'Doe', number: 42, comments: "That's all" },

// Will print all errors to console without throwing errors
ValidateObject(objectToTest, modelExample);

// Will throw to the first error it encounters while validating
ValidateObject(objectToTest, modelExample, { exitOnError: true });
```

## Collaborating

The perfect place for collaboration is the [development](https://github.com/egdelgadillo/ts-object-validator/tree/develop) branch. All Pull Requests should be done to that branch, and those changes will eventually be pulled to the master branch.

## License

This work is licensed under a [GNU GENERAL PUBLIC LICENSE](LICENSE).
