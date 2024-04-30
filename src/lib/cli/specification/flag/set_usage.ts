import type { FlagSpecificationType } from '../../specs.js';

export function set_usage( flag_data: FlagSpecificationType, usage: 'no usage provided'|string ) {
  flag_data.set( 'usage', usage );
}
