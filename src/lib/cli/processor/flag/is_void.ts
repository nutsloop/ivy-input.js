import type { FlagArgvOptions, FlagSpecificationType, GlobalFlagSpecificationType } from '../../specs.js';

export function is_void( specs_global_flag: FlagSpecificationType, flag_key: string, flag_entry: FlagArgvOptions ){

  if( specs_global_flag.get( 'void' ) && flag_entry !== null ){

    throw( `${ flag_key } does not require a value` );
  }
}

export function is_void_global( specs_global_flag: GlobalFlagSpecificationType, flag_key: string, flag_entry: FlagArgvOptions ){

  if( specs_global_flag.get( 'void' ) && flag_entry !== null ){

    throw( `${ flag_key } does not require a value` );
  }
}
