import type { KVPTypes } from './key_value_pair.js';

import { input_setting } from '../run.js';

/**
 * Infers the type of the given parameter from string to the appropriate type.
 */
export function infer_type( parameter: string ): KVPTypes {

  // Try to parse it as a number
  const number = is_number( parameter );
  if( typeof number !== 'boolean' ){
    return number;
  }

  // Try to parse it as a boolean
  const boolean = is_boolean( parameter );
  if( typeof boolean === 'boolean' ){
    return boolean;
  }

  // Try to parse it as a JSON or return the string.
  return is_json( parameter );
}

function is_number( parameter: string ): boolean | number {

  const number = Number( parameter.trim() );

  return isNaN( number )
    ? false
    : number;
}

function is_boolean( parameter: string ): boolean {

  const infer_boolean: Map<string, boolean> = new Map( [ [ 'false', false ], [ 'true', true ] ] );
  if( infer_boolean.has( parameter ) ){
    return infer_boolean.get( parameter )!;
  }
}

function is_json( parameter: string ): KVPTypes {

  if( input_setting.get( 'parse_json' ) === false ){
    return parameter;
  }

  if( ! parameter.startsWith( '{' ) && ! parameter.endsWith( '}' ) ){
    return parameter;
  }

  try {
    return JSON.parse( parameter );
  }
  catch{/**/}

  return parameter;
}
