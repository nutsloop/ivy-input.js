import { is_alpha_identifier } from '../../../util/is_alpha_identifier.js';
import { FlagSpecificationType } from '../../specs.js';

export function set_short_long( identifiers: Map<'long' | 'short', string>, flag_data: FlagSpecificationType, flag_identifier: string ) {

  if( ! identifiers ){
    return;
  }
  const short = identifiers.get( 'short' );
  const long = identifiers.get( 'long' );
  if ( ! short && ! long ) {
    throw new Error( `short or long must be defined for flag -> ${flag_identifier}` );
  }

  is_alpha_identifier( short, 'flag short' );
  is_alpha_identifier( long, 'flag long' );
  flag_data.set( 'short', short );
  flag_data.set( 'long', long );
}
