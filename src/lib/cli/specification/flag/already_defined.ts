import { CLISpecification } from '../../specs.js';

export function already_defined( flag_identifier: string, is_flag_of: string ) {
  if( CLISpecification.get( 'command' )?.get( is_flag_of )?.get( 'flag' )?.get( flag_identifier ) ){
    throw( `${ flag_identifier } already defined in ${ is_flag_of }` );
  }
}
