import { input_setting } from '../run.js';

/**
 * The type of identifier.
 */
type IdentifierType =
  'command' |
  'flag alias' |
  'flag long' |
  'flag short' |
  'flag' |
  'global' |
  'parser(argv)';

/**
 * The allowed identifier types.
 */
const allowed_identifier_type: IdentifierType[] = [
  'command',
  'flag',
  'global',
  'flag alias',
  'flag long',
  'flag short',
  'parser(argv)'
];

/**
 * Custom error class for identifier validation errors.
 *
 * @extends {Error}
 */
export class IsAlphanumericIdentifierError extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'IsAlphanumericIdentifierError';
  }
}

/**
 * Custom error class for is_alpha_identifier function arguments.
 *
 * @extends {Error}
 */
export class IsAlphanumericArgumentError extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'IsAlphanumericArgumentError';
  }
}

/**
 * Validates whether a given identifier string meets specific criteria based on the `only_alpha` setting.
 *
 * @param identifier - The identifier string to be validated.
 * @param identifier_type - Optional additional information to include in the error message.
 * @throws {IsAlphanumericArgumentError} if the identifier or info arguments are not strings and if the `only_alpha` setting is not a boolean.
 * @throws {IsAlphanumericIdentifierError} the identifier contains invalid characters based on the `only_alpha` setting.
 *
 * The function checks the `only_alpha` setting from `input_setting`:
 * - If `only_alpha` is false, the identifier can contain letters, numbers, and dashes.
 * - If `only_alpha` is true, the identifier can only contain letters and dashes.
 */
export function is_alpha_identifier( identifier: string, identifier_type?: IdentifierType ): void {

  // Ensure identifier is a string
  if ( typeof identifier !== 'string' ) {
    throw new IsAlphanumericArgumentError( `'identifier' argument must be a string.` );
  }

  // Ensure info is a string
  if ( identifier_type && typeof identifier_type !== 'string' ) {
    throw new IsAlphanumericArgumentError( `'info' argument must be a string.` );
  }

  // Ensure identifier_type is one of the allowed values
  if( ! allowed_identifier_type.includes( identifier_type ) ){
    throw new IsAlphanumericArgumentError( `'identifier_type' argument must be one of the following: 'command', ${allowed_identifier_type.join( ', ' )}.` );
  }

  // Retrieve the only_alpha setting
  const only_alpha = input_setting.get( 'only_alpha' );

  // Ensure only_alpha is a boolean
  if ( typeof only_alpha !== 'boolean' ) {
    throw new IsAlphanumericArgumentError( `Invalid 'only_alpha' setting: must be a boolean.` );
  }

  /**
   * Define the regex pattern based on the `only_alpha` setting
   *
   * - If `only_alpha` is true, the pattern allows only letters and dashes.
   * - If `only_alpha` is false, the pattern allows letters, numbers, and dashes.
   * - lowercase and uppercase letters are allowed.
   */
  const only_alpha_regexp = only_alpha
    ? /^[a-zA-Z-]+$/
    : /^[a-zA-Z0-9-]+$/;

  // Define the error message based on only_alpha setting
  const error_message = only_alpha
    ? `identifier '${identifier}' must contain only letters and dashes.`
    : `identifier '${identifier}' must contain only letters, numbers, and dashes.`;

  // Validate the identifier and throw an error if it doesn't match the pattern
  if ( ! only_alpha_regexp.test( identifier ) ) {
    throw new IsAlphanumericIdentifierError( `${error_message} ${identifier_type ? ` -> ${identifier_type}` : ''}` );
  }
}
