import type { ParsedArgv } from '../../parser.js';
import type { OptionType } from '../specs.js';

import { CLISpecification } from '../specs.js';
import { global_cb } from './flag/cb.js';
import { global_has_conflict } from './flag/has_conflict.js';
import { is_void_global } from './flag/is_void.js';
import { only_for } from './flag/only-for.js';
import { process_type } from './flag/process-type.js';
import { remove_global_entries } from './global/remove.js';

export async function global( parsed_argv: ParsedArgv ): Promise<void>{

  const global_flag = CLISpecification.get( 'global' );
  const parsed_global_flag = parsed_argv.get( 'global' );
  const parsed_flag = parsed_argv.get( 'flag' );

  for( const [ flag_key, flag_entry ] of parsed_global_flag.entries() ){

    const specs_global_flag = global_flag.get( flag_key );
    let global_flag_entry_is_now_array = undefined;

    // process only-for command section
    only_for( specs_global_flag, parsed_argv, flag_key );

    // if the flag has a value, it is checked if the flag requires a value.
    is_void_global( specs_global_flag, flag_key, flag_entry );

    // if the flag has a conflict, it is checked if the flag is present in the parsedARGVFlag Map.
    global_has_conflict( specs_global_flag, parsed_flag, flag_key );

    const flag_type: OptionType = specs_global_flag.get( 'type' );
    const flag_multi_type: OptionType[] = specs_global_flag.get( 'multi_type' );

    global_flag_entry_is_now_array = await process_type( flag_key, flag_entry, flag_type, flag_multi_type );

    await global_cb( global_flag_entry_is_now_array || flag_entry, flag_key, specs_global_flag );
  }

  remove_global_entries( parsed_argv );
}
