import type { ParsedArgv } from '../../parser.js';
import type { FlagThreadSpecification } from '../flag.js';
import type { CallBackFlag, CallBackFlagAsync, CallBackRestArgs, FlagArgvOptions, FlagSpecification, OptionType, This } from '../specs.js';

import { set_precedence } from '../precedence.js';
import { alias } from './flag/alias.js';
import { depends_on } from './flag/depends-on.js';
import { exec_precedence } from './flag/exec_precedence.js';
import { has_conflict } from './flag/has_conflict.js';
import { is_thread } from './flag/is_thread.js';
import { is_void } from './flag/is_void.js';
import { not_found } from './flag/not-found.js';
import { process_type } from './flag/process-type.js';

export type ParsedAsARGV = Map<string, Map<string, FlagArgvOptions>>;
export type cbOptions =
  Map<'alias' | 'flag' | 'type', string> &
  Map<'cb', CallBackFlag | CallBackFlagAsync> &
  Map<'data', This> &
  Map<'option', FlagArgvOptions> &
  Map<'precedence', number> &
  Map<'rest', CallBackRestArgs> &
  Map<'thread', FlagThreadSpecification>;

export const cb_options: cbOptions = new Map();
export const thread_count: 0[] = [];

export async function flag( key: string, flag_specification: FlagSpecification, parsed_argv: ParsedArgv ): Promise<Map<string, Map<string, FlagArgvOptions>>>{

  const parsedAsARGV: ParsedAsARGV = new Map();
  const parsed_argv_flag = parsed_argv.get( 'flag' );

  is_thread( flag_specification, parsed_argv_flag ).forEach( () => {
    thread_count.push( 0 );
  } );

  for( const [ flag_key, flag_entry ] of parsed_argv_flag.entries() ){

    let flag_entry_is_now_array: string[] | undefined = undefined;
    const specs_flag = flag_specification.get( flag_key );

    // flag not found in the specification
    not_found( specs_flag, key, flag_key );

    // if the flag has a value, it is checked if the flag requires a value.
    is_void( specs_flag, flag_key, flag_entry );

    // if the flag has a conflict, it is checked if the flag is present in the parsedARGVFlag Map.
    has_conflict( specs_flag, parsed_argv_flag, flag_key );

    // if the flag depends on another flag, it is checked if the flag is present in the parsedARGVFlag Map.
    depends_on( specs_flag, parsed_argv_flag, flag_key );

    // check the type of the flag options.
    const flag_type: OptionType = specs_flag.get( 'type' );
    const flag_multi_type: OptionType[] = specs_flag.get( 'multi_type' );

    flag_entry_is_now_array = await process_type( flag_key, flag_entry, flag_type, flag_multi_type );

    // if the flag has an alias and the alias differs from flak_key, it is stored in the parsedAsARGV Map.
    const alias_entry = alias( specs_flag, {
      flag_entry,
      flag_entry_is_now_array,
      flag_key,
      parsedAsARGV
    } );

    // cb section
    const specs_flag_cb = specs_flag.get( 'cb' ) || false;

    if( specs_flag_cb !== false ) {
      const { fn, rest, this: this_arg, thread, type } = specs_flag_cb;
      cb_options.set( 'flag', flag_key );
      cb_options.set( 'alias', alias_entry );
      cb_options.set( 'cb', fn );
      cb_options.set( 'data', this_arg );
      cb_options.set( 'rest', rest || [] );
      cb_options.set( 'type', type );
      cb_options.set( 'option', flag_entry_is_now_array || flag_entry );
      cb_options.set( 'precedence', specs_flag.get( 'precedence' ) );
      cb_options.set( 'thread', thread );

      set_precedence();
    }
  }

  await exec_precedence( parsedAsARGV );

  return parsedAsARGV;
}
