import { FlagSpecificationType } from '../../specs.js';

export function set_dependency( flag_data: FlagSpecificationType, depends_on: string | string[] ) {
  if ( depends_on ) {
    flag_data.set( 'depends_on', depends_on );
  }
}
