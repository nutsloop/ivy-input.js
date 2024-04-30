import { input_setting } from '../run.js';

export function is_alpha_identifier( identifier: string, info?: string ): void {

  // anyway only letters, numbers, and dashes are accepted
  if ( ! input_setting.get( 'only_alpha' ) ) {

    if ( ! /^[a-zA-Z0-9-]+$/.test( identifier ) ) {

      throw( `identifier '${ identifier }' must contain only letters, numbers, and dashes. ${ info
        ? info
        : '' }` );
    }

    return;
  }

  if ( ! /^[a-zA-Z-]+$/.test( identifier ) ) {

    throw( `identifier '${ identifier }' must contain only letters. ${ info
      ? info
      : '' }` );
  }
}
