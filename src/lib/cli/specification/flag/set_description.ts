import type { FlagSpecificationType } from '../../specs.js';

export function set_description( flag_data: FlagSpecificationType, description: 'no description provided'|string ) {
  flag_data.set( 'description', description );
}
