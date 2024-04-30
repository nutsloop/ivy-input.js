import type { ReservedType } from './cli/constant/reserved.js';
import type { FlagArgvOptions } from './cli/specs.js';
import type { KVPIdentifier } from './parser/key_value_pair.js';
import type { ProcessArgv } from './run.js';

import { Reserved } from './cli/constant/reserved.js';
import { command_option } from './parser/command_option.js';
import { has_global } from './parser/global.js';
import { key_value_pair } from './parser/key_value_pair.js';
import { process_global_opts, process_opts } from './parser/process_opts.js';
import { input_setting } from './run.js';

/**
 * shallow copy of the process.argv
 */
export type ShallowCopyProcessArgv = ProcessArgv;
export type ParsedArgv =
  Map<'command', Map<string, FlagArgvOptions>> &
  Map<'flag', Map<string, FlagArgvOptions>> &
  Map<'global', Map<string, FlagArgvOptions>>;

export const GlobalFlags: Map<string, FlagArgvOptions> = new Map();

/**
 * **Parses the command line arguments and options.**
 *
 * the `key_value_pairs_options` parameter is optional, if it is not passed it will be considered `false`.
 *
 * options are key→value pairs that are passed to the flag.
 * - sign `:` is used to separate the key from the value.
 * - sign `|` is used to separate sets of key value pairs.
 * - sign `=` is used to separate the flag from the options.
 * - the parser need the to be instructed by putting the sign `!` before the key value pair.
 *
 * syntax for options:
 * - [flag-ident]{=}{!}[key]{:}[value]{|}[key]{:}[value]
 * - \<cli-name> <command> <flag>=!key:value|key2:value2
 *
 *
 * @throws {ReferenceError} - If an equal sign requires a value or an option requires a value.
 */
export function parser( argv: ShallowCopyProcessArgv ): Promise<ParsedArgv> {

  return new Promise( ( resolve, reject ) => {

    // if input run without command, resolve with the no_command command
    if( input_setting.get( 'run_without_command' ) && argv.length === 0 ){
      const no_command: ParsedArgv = new Map();
      no_command.set( 'command', new Map( [ [ 'no_command', null ] ] ) );
      resolve( no_command );
    }

    // if the argv is undefined or empty, resolve with the help command
    if( argv === undefined || argv.length === 0 ){

      const empty_parsed_argv: ParsedArgv = new Map();
      empty_parsed_argv.set( 'command', new Map( [ [ 'help', null ] ] ) );
      resolve( empty_parsed_argv );
    }

    const parsed_argv: ParsedArgv = new Map();
    if( has_global() && ! Reserved.has( argv[ 0 ] as ReservedType ) ){

      const error_from = process_global_opts( parsed_argv, argv );
      if( error_from instanceof ReferenceError ){

        reject( error_from );
      }
    }

    if( parsed_argv.has( 'global' ) && argv[ 0 ] === undefined ){

      reject( new ReferenceError( 'global flag cannot run without a command following it' ) );
    }

    parsed_argv.set( 'command', command_option( argv[ 0 ] ) );

    // remove the first entry of the argv that is the command
    argv.splice( 0, 1 );

    if( argv.length > 0 ) {

      parsed_argv.set( 'flag', new Map() );

      const options = process_opts( argv, parsed_argv );
      if( options instanceof ReferenceError ) {

        reject ( options?.message || options );
      }

      if( input_setting.get( 'key_value_pairs_options' ) ){

        const kvp = key_value_pair( parsed_argv, 'flag' as KVPIdentifier );
        if( kvp instanceof ReferenceError ){

          reject( kvp );
        }
        resolve( parsed_argv );
      }
      resolve( parsed_argv );
    }
    resolve( parsed_argv );
  } );
}
