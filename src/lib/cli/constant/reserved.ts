/**
 * Reserved command identifiers for the CLI.
 */
export type ReservedType = string;

/**
 * Set of reserved command identifiers.
 * These commands are reserved and cannot be used as custom command identifiers.
 */
export const Reserved: Set<ReservedType> = new Set( [
  'help',
  'version',
  '-h',
  '--help',
  '-v',
  '--version',
  'no_command'
] );

/**
 * Custom error class for Reserved.
 *
 * @extends {Error}
 */
export class ReservedError extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'ReservedError';
  }
}

/**
 * Adds new reserved command identifiers to the Reserved set.
 *
 * @param {ReservedType | ReservedType[]} reserved - A single reserved word or an array of reserved words.
 *
 * @throws {Error} If any of the provided words are already reserved.
 */
export function set_reserved( reserved: ReservedType | ReservedType[] ): void {

  const reserved_words = Array.isArray( reserved ) ? reserved : [ reserved ];

  for ( const reserved_word of reserved_words ) {
    if ( Reserved.has( reserved_word ) ) {

      throw new ReservedError( `${reserved_word} is a reserved word` );
    }
  }

  // Add all reserved words to the set after validation
  for ( const reserved_word of reserved_words ) {
    Reserved.add( reserved_word );
  }
}
