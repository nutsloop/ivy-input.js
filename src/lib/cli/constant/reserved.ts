export type ReservedType = '--help' |
  '--version' |
  '-h' |
  '-v' |
  'help' |
  'no_command' |
  'version';

export const Reserved: Set<ReservedType> = new Set( [ 'help', 'version', '-h', '--help', '-v', '--version', 'no_command' ] );

export function set_reserved( reserved: ReservedType | ReservedType[] ): void {
  if ( Array.isArray( reserved ) ) {
    for ( const reserved_word of reserved ) {
      if ( Reserved.has( reserved_word ) ) {
        throw( `${reserved_word} is a reserved word` );
      }
      Reserved.add( reserved_word );
    }
  }
  else {
    if ( Reserved.has( reserved ) ) {
      throw( `${reserved} is a reserved word` );
    }
    Reserved.add( reserved );
  }
}
