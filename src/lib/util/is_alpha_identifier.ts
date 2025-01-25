import { input_setting } from '../run.js';

/**
 * The type for the allowed calling function names.
 */
type CallingFunctionName =
  'command' |
  'flag alias' |
  'flag long' |
  'flag short' |
  'flag' |
  'global' |
  'parser(argv)';

/**
 * The allowed calling function names.
 */
const allowed_calling_function_name: CallingFunctionName[] = [
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
 * @param calling_function_name_ref_error - The name of the callback function that may throw an Error if is_alpha_identifier fails.
 * @throws {IsAlphanumericArgumentError} if the identifier or calling_function_name_ref_error arguments are not a string.
 * @throws {IsAlphanumericIdentifierError} the identifier contains invalid characters based on the `only_alpha` setting.
 *
 * The function checks the `only_alpha` setting from `input_setting`:
 * - If `only_alpha` is false, the identifier can contain letters, numbers, and dashes.
 * - If `only_alpha` is true, the identifier can only contain letters and dashes.
 */
export function is_alpha_identifier( identifier: string, calling_function_name_ref_error?: CallingFunctionName ): void {

  // Ensure identifier is a string
  if ( typeof identifier !== 'string' ) {
    throw new IsAlphanumericArgumentError( `'identifier' argument must be a string.` );
  }

  // Ensure info is a string
  if ( calling_function_name_ref_error && typeof calling_function_name_ref_error !== 'string' ) {
    throw new IsAlphanumericArgumentError( `'callback_name_ref_error' argument must be a string.` );
  }

  // Ensure identifier_type is one of the allowed values
  if( ! allowed_calling_function_name.includes( calling_function_name_ref_error ) ){
    throw new IsAlphanumericArgumentError( `'identifier_type' argument must be one of the following: 'command', ${allowed_calling_function_name.join( ', ' )}.` );
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
    throw new IsAlphanumericIdentifierError( `${error_message} ${calling_function_name_ref_error ? ` -> ${calling_function_name_ref_error}` : ''}` );
  }
}
