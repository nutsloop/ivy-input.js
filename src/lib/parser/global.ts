export type GlobalFlagDeclaration =
  Map<'cli_command_identifier_list' | 'cli_global_identifier_list', string[]> &
  Map<'has_global', boolean>;

// global flag specification
const global_flag_declaration: GlobalFlagDeclaration = new Map();
global_flag_declaration.set( 'has_global', false );

/**
 * todo: automatically set the global flag declaration
 *       requires reading the command_specification
 *       requires reading the global_flag_specification
 *       requires reading the flag_specification
 *       doing this will deprecate the set_global_flag_declaration function
 */

/**
 * Sets the global flag declaration.
 * The global flag declaration tells the parser that the cli has global flags.
 * the parser will process the global flags before the command and its flags.
 *
 * @param declaration - The global flag declaration.
 * The global flag declaration is a map that contains the following:
 * - has_global is a boolean that tells the parser that the cli has global flags.
 * - command_identifier_list is an array of strings that tells the parser what the command identifiers are.
 * - global_identifier_list is an array of strings that tells the parser what the global identifiers are.
 * @throws {Error} - If the declaration.has_global isn't set.
 * @throws {Error} - If the declaration.has_global set to false.
 * @throws {Error} - If the declaration.command_identifier_list isn't set.
 * @throws {Error} - If the declaration.global_identifier_list isn't set.
 */
export function set_global_flag_declaration( declaration: GlobalFlagDeclaration ): void {

  if ( ! declaration.has( 'has_global' ) ) {
    throw( 'missing has_global. if the CLI has global flags it must have a has_global boolean set to true.' );
  }

  if ( declaration.has( 'has_global' ) && declaration.get( 'has_global' ) === false ) {
    throw( 'unnecessary call to this function. if the CLI has global flags, set the has_global to true' );
  }

  if( ! declaration.has( 'cli_command_identifier_list' ) ) {
    throw( 'missing cli_command_identifier_list. if the CLI has global flags it must have a command_identifier_list containing at least one command, two commands in the list makes more sense btw.' );
  }

  if( ! declaration.has( 'cli_global_identifier_list' ) ) {
    throw( 'missing cli_global_identifier_list. if the CLI has global flags it must have a global_identifier_list containing at least one global flag.' );
  }

  for( const [ key, value ] of declaration.entries() ) {

    global_flag_declaration.set( key, value );
  }
}

/**
 * Gets the global flag declaration.
 */
export function get_global_declaration(): GlobalFlagDeclaration {
  return global_flag_declaration;
}

/**
 * Resets the global flag declaration.
 * useful for testing.
 */
export function reset_global_declaration(): void {
  global_flag_declaration.clear();
}

/**
 * checks if the cli has global flags.
 */
export function has_global(): boolean {

  return global_flag_declaration.get( 'has_global' );
}
