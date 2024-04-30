import type { FlagSpecificationType } from '../../specs.js';

export function set_conflict( flag_data: FlagSpecificationType, conflict: string | string[] ) {
  if ( conflict ) {
    flag_data.set( 'has_conflict', conflict );
  }
}
