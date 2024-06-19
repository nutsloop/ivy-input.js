import { Reserved, ReservedError } from '../../constant/reserved.js';

/**
 * Checks if a given flag identifier is reserved.
 *
 * todo: this method should be global available and not only for flags.
 * adding an extra argument to the function is good idea to specify what is being defined. [flag, command, global flag].
 * move the file to ./src/lib/specification and export the function.
 * then it will be used while defining
 * - flags
 * - commands
 * - global flags
 *
 * @param {string} flag_identifier - The flag identifier to be checked.
 * @throws {ReservedError} If the flag identifier is reserved.
 */
export function is_reserved( flag_identifier: string ): void {

  // Check if the flag identifier is in the set of reserved words
  if ( Reserved.has( flag_identifier ) ) {

    // Throw an error if the flag identifier is reserved
    throw new ReservedError(
      `Trying to use reserved word -> ${flag_identifier} to define a flag. Reserved identifier names are: ${Array.from( Reserved.values() ).join( ', ' )}`
    );
  }
}
