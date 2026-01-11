import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates if a string is a valid ULID
 * ULID format: 26 characters, case-insensitive alphanumeric (Crockford's Base32)
 */
export function IsULID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isULID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          
          // ULID is 26 characters long
          if (value.length !== 26) {
            return false;
          }
          
          // ULID uses Crockford's Base32 alphabet (0-9, A-Z excluding I, L, O, U)
          const ulidRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/i;
          return ulidRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ULID`;
        },
      },
    });
  };
}

