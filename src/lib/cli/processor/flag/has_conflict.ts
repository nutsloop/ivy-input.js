import type { FlagArgvOptions, FlagSpecificationType, GlobalFlagSpecificationType } from '../../specs.js';

export function has_conflict( specs_flag: FlagSpecificationType, parsed_argv_flag: Map<string, FlagArgvOptions>, flag_key: string ){

  if( ! specs_flag.get( 'has_conflict' ) ){

    return;
  }

  const conflict = specs_flag.get( 'has_conflict' );
  let has_conflict = false;
  let flag_with_conflict: string;

  if( typeof conflict === 'string' ){

    has_conflict = parsed_argv_flag.has( conflict );
    flag_with_conflict = conflict;
  }

  if( Array.isArray( conflict ) ){

    parsed_argv_flag.forEach( ( _value, key ) => {

      if( conflict.includes( key ) ){

        has_conflict = true;
        flag_with_conflict = key;
      }
    } );
  }

  if( has_conflict ){

    throw( `${ flag_key } and ${ flag_with_conflict } cannot be used together` );
  }
}

export function global_has_conflict( specs_global_flag: GlobalFlagSpecificationType, parsed_flag: Map<string, FlagArgvOptions>, flag_key: string ){

  if( ! specs_global_flag.get( 'has_conflict' ) ){

    return;
  }

  // check for the parsed_as value for conflict
  const conflict = specs_global_flag.get( 'has_conflict' );
  let has_conflict = false;
  let flag_with_conflict: string;

  if( typeof conflict === 'string' ){

    has_conflict = parsed_flag.has( conflict );
    flag_with_conflict = conflict;
  }

  if( Array.isArray( conflict ) ){

    if( parsed_flag !== undefined ){

      parsed_flag.forEach( ( _value, key ) => {

        if( conflict.includes( key ) ){

          has_conflict = true;
          flag_with_conflict = key;
        }
      } );
    }
  }

  if( has_conflict ){

    throw( `${ flag_key } and ${ flag_with_conflict } cannot be used together` );
  }
}
