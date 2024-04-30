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
 */

// function that set the global flag specification
/**
 * Sets the global flag declaration.
 * The global flag declaration tells the parser that the cli has global flags.
 *
 * global_index is an array of indexes that tells the parser on how many (approximately) indexes to skip/check
 * before finding the command in the process.argv.
 *
 * command_identifier_list is an array of strings that tells the parser what the command identifiers are.
 * global_identifier_list is an array of strings that tells the parser what the global identifiers are.
 *
 * iterates over the declaration Map and sets the global flag declaration.
 */
export function set_global_flag_declaration( declaration: GlobalFlagDeclaration ): void {

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
