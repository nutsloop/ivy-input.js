import type { KVPTypes } from './key_value_pair.js';

import { input_setting } from '../run.js';

const infer_boolean: Map<string, boolean> = new Map( [ [ 'false', false ], [ 'true', true ] ] );

/**
 * Infers the type of the given parameter from string to the appropriate type.
 */
export function infer_type( parameter: string ): KVPTypes {

  // Try to parse it as a number
  const is_number = try_number( parameter );
  if( is_number ){

    return is_number;
  }

  // Try to parse it as a boolean
  if( infer_boolean.has( parameter ) ) {

    return infer_boolean.get( parameter );
  }

  // Try to parse it as a JSON (object or array) or return it as-is
  return input_setting.get( 'parse_json' )
    ? try_json( parameter )
    : parameter;
}

function try_json( parameter: string ): KVPTypes {

  try {

    return JSON.parse( parameter );
  }
  catch ( error ) {

    return parameter;
  }
}

function try_number( parameter: string ): boolean | number {

  const number = Number( parameter );

  return isNaN( number )
    ? false
    : number;
}
