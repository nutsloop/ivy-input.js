import type { OptionType } from '../../specs.js';

import { process_type } from '../../../parser/command_option.js';
import { input_setting } from '../../../run.js';

export async function accept_option( identifier: string, option: unknown, type: OptionType, multiple_types: OptionType[] ): Promise<unknown[] | void>{

  let type_check = type;
  if( ! input_setting.get( 'command_accepts_options' ) ){
    return undefined;
  }

  if( option === null && multiple_types ){
    multiple_types.push( 'void' );
  }
  else if( option === null && ! multiple_types ){
    type_check = 'void';
  }

  return process_type( option, type_check, multiple_types, identifier );
}
