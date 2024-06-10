import type { FlagSpecificationType } from '../../specs.js';

import { is_alpha_identifier } from '../../../util/is_alpha_identifier.js';

export function set_alias( flag_data: FlagSpecificationType, alias: string, flag_identifier: string ) {
  if( ! alias ){
    throw new Error( `alias must be defined for flag -> ${ flag_identifier }` );
  }
  is_alpha_identifier( alias, 'flag alias' );
  flag_data.set( 'alias', alias );
}
