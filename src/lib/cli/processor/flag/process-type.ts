import type { FlagArgvOptions, OptionType } from '../../specs.js';

import { multi_type, type } from '../../type.js';

export async function process_type( flag_key: string, flag_entry: FlagArgvOptions, flag_type: OptionType, flag_multi_type: OptionType[] ): Promise<string[]|undefined>{

  if( flag_type ){

    const flag_type_returns = await type( flag_entry, flag_type )
      .catch( ( type_error ) => {
        throw ( `"${ flag_key }" must be of type "${ flag_type }", given "${type_error}"` );
      } );

    // if the flag type is an array, the flag value is converted to an array.
    if( Array.isArray( flag_type_returns ) ){

      return flag_type_returns;
    }
  }

  if( flag_multi_type ){

    const flag_multi_type_returns = await multi_type( flag_entry, flag_multi_type )
      .catch( ( type_error ) => {
        throw ( `"${ flag_key }" must be of type "${ flag_multi_type }", given "${type_error}"` );
      } );

    if( Array.isArray( flag_multi_type_returns ) ){

      return flag_multi_type_returns;
    }
  }

  return undefined;
}
