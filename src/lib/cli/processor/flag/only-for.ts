import type { ParsedArgv } from '../../../parser.js';
import type { GlobalFlagSpecificationType } from '../../specs.js';

export function only_for( specs_global_flag: GlobalFlagSpecificationType, parsed_argv: ParsedArgv, flag_key: string ){

  if( ! specs_global_flag.get( 'only_for' ) ){

    return;
  }

  const only_for = specs_global_flag.get( 'only_for' );
  let only_for_is_valid = false;

  if( typeof only_for === 'string' ){

    only_for_is_valid = parsed_argv.get( 'command' ).has( only_for );
  }

  if( Array.isArray( only_for ) ){

    only_for.forEach( ( command ) => {

      if( parsed_argv.get( 'command' ).has( command ) ){

        only_for_is_valid = true;
      }
    } );
  }

  if( ! only_for_is_valid ){

    throw( `${ flag_key } is only for ${ only_for }` );
  }
}
