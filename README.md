# Object Validator

The object validator is used to verify an object by creating a model of the object containing the required property types and using those two to call it.

## Usage

An example of an object and the model is provided in the `index.ts` file. To run the project you can run it directly using **ts-node**:

```bash
ts-node src/index
```

or by compiling it and running it with node:

```bash
tsc
node src/index.js
```

The Validator prints the errors to the console instead of throwing errors. This may be changed in the future. By default the example will print **3 errors** (That's normal):

```bash
ERROR: Property " last_name " requires " is_company " to have another value
ERROR: Property " phone " requires " cellphone " to have another value
ERROR: Property " is_company " requires " name " to have another value
```

You can now play with the different options.

## Model options

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

## Model examples

Given the following object interface:

```typescript
interface Test {
  name: string;
  last_name: string;
  number: number;
}
```

We can define the following models:

```typescript
const model = {
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
