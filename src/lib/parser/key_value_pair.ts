import type { ParsedArgv } from '../parser.js';

import { infer_type } from './infer_type.js';

export type KVPTypes<T = {} | boolean | number | string | unknown[]> = T;
export type KVP<T = KVPTypes> = Map<string, KVPTypes<T>>;
export type KVPIdentifier = 'command'&'flag'&'global';

export function key_value_pair( parsed_argv: ParsedArgv, identifier?: KVPIdentifier ): ReferenceError | void{

  let error: ReferenceError;
  // iterate through the flag map
  for ( const [ flag_name, parameter ] of parsed_argv.get( identifier || 'flag' ).entries() ) {

    if( typeof parameter === 'string' ){

      if( parameter?.startsWith( '!' ) ){

        const array_parameter_pipe = parameter?.slice( 1 ).split( '|' );
        const array_key_value_pair: string[][] = [];
        for ( const key_value in array_parameter_pipe ) {

          // count the number of ':' in the string
          // if is greater than 1, split the first ':' sign and treat the rest as string
          if( array_parameter_pipe[ key_value ].split( ':' ).length - 1 > 1 ){

            // select everything before the first ':' sign and define it as the index
            const index = array_parameter_pipe[ key_value ].split( ':', 1 );
            // select everything after the first ':' sign and define it as the value
            const value = array_parameter_pipe[ key_value ].substring( array_parameter_pipe[ key_value ].indexOf( ':' ) + 1 );
            array_key_value_pair.push( [ index[ 0 ], value ] );
          }// if a key of the (key-value-pair) options is named json, the value is parsed as json
          else{

            const match_separator = array_parameter_pipe[ key_value ].split( ':' );
            if( match_separator.length === 1 ){

              error = new ReferenceError( `flag ${ flag_name } require a ':' sign followed by a value @ '${ array_parameter_pipe[ key_value ].red( ' : <- miss'.underline() ) }'` );
              break;
            }

            array_key_value_pair.push( match_separator );
          }
        }

        const object_parsed = Object.fromEntries( array_key_value_pair );
        for ( const [ flag_key, flag_parameter ] of Object.entries( object_parsed ) ){

          if( typeof flag_parameter === 'string' ){

            if ( flag_parameter?.length === 0 ) {

              error = new ReferenceError( `flag ${ flag_name.blue() } require a value @ -> '${ flag_key.green() }':'${'value'.magenta()}'${' <- is missing'.red()}` );
              break;
            }

            object_parsed[ flag_key ] = infer_type( flag_parameter );
          }
        }

        const mapping: KVP = new Map();
        for( const [ parameter_name, parameter_value ] of Object.entries( object_parsed ) ){

          parsed_argv.get( identifier || 'flag' )?.set( flag_name, mapping.set( parameter_name, parameter_value ) );
        }
      }
    }
  }

  if( error !== undefined ){

    return error;
  }
}
