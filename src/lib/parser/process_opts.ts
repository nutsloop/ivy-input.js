import type { ParsedArgv, ShallowCopyProcessArgv } from '../parser.js';

import { not_found_global } from '../cli/processor/flag/not-found.js';
import { input_setting } from '../run.js';
import { get_global_declaration } from './global.js';
import { infer_type } from './infer_type.js';
import { type KVPIdentifier, key_value_pair } from './key_value_pair.js';

/**
 * Processes the options given to the flag.
 *
 * @throws {ReferenceError} - If an equal sign requires a value.
 */
export function process_opts( argv: ShallowCopyProcessArgv, parsed_argv: ParsedArgv ): ReferenceError | void {

  const argv_repeated: Set<string> = new Set();
  for ( const index in argv ) {

    const opts_or_error = extract_parameter( argv, parsed_argv, Number( index ) );
    if( opts_or_error instanceof ReferenceError ){

      return opts_or_error;
    }
    if( ! argv_repeated.has( opts_or_error ) ){
      argv_repeated.add( opts_or_error );
    }
    else{
      return new ReferenceError( `duplicate flag @ '${ opts_or_error }'` );
    }
  }
}

/**
 * Processes the global flag.
 *
 * The global flag is a flag that is available to all commands.
 * it has to be declared in the cli specification because all the global flags are processed before the command and flags.
 * once every global flag is processed, the command and its flags are processed and the global flag is removed from the process.argv.
 *
 * @throws {ReferenceError} - If an equal sign requires a value or an option requires a value.
 */
export function process_global_opts( parsed_argv: ParsedArgv, argv: ShallowCopyProcessArgv ): ReferenceError | void {

  parsed_argv.set( 'global', new Map() );
  const global_declaration = get_global_declaration();
  const global_identifier_list = global_declaration.get( 'cli_global_identifier_list' );
  const command_identifier_list = global_declaration.get( 'cli_command_identifier_list' );
  const argv_repeated: Set<string> = new Set();

  let global_found = 0;

  for ( const index in global_identifier_list ) {

    // no index found at process.argv
    if( argv[ index ] === undefined ) {
      break;
    }

    // the command has been found at index of process.argv
    if( command_identifier_list.includes( argv[ index ].split( '=' )[ 0 ] ) ) {
      break;
    }

    // the global flag is not found in the process.argv
    not_found_global( argv, global_identifier_list, Number( index ) );

    if( argv[ index ].endsWith( '=' ) ) {

      return new ReferenceError( `equal sign requires a value @ '${ argv[ index ] }' @ processing global flag` );
    }

    // the global flag has no value assigned to it.
    if( ! argv[ index ].includes( '=' ) && global_identifier_list.includes( argv[ index ] ) ) {

      global_found ++;
      parsed_argv.get( 'global' ).set( argv[ index ], null );
      if( ! argv_repeated.has( argv[ index ] ) ){
        argv_repeated.add( argv[ index ] );
      }
      else{
        throw new ReferenceError( `duplicate global flag @ '${ argv[ index ] }'` );
      }
    }
    // the global flag has a value assigned to it.
    else if( global_identifier_list.includes( argv[ index ].substring( 0, argv[ index ].indexOf( '=' ) ) ) ){

      const assignment = argv[ index ].indexOf( '=' );
      const global_flag_name = argv[ index ].substring( 0, assignment );
      const option = argv[ index ].substring( assignment + 1 );
      if( global_identifier_list.includes( global_flag_name ) ){

        global_found ++;
        parsed_argv.get( 'global' ).set( global_flag_name, infer_type( option ) );
      }
      if( ! argv_repeated.has( global_flag_name ) ){
        argv_repeated.add( global_flag_name );
      }
      else{
        throw new ReferenceError( `duplicate global flag @ '${ global_flag_name }'` );
      }
    }
  }

  // also for global the key_value_pair options are processed if the key_value_pairs_options is true
  if ( input_setting.get( 'key_value_pairs_options' ) ){

    const kvp_error = key_value_pair( parsed_argv, 'global' as KVPIdentifier );
    if( kvp_error instanceof ReferenceError ){

      return kvp_error;
    }
  }

  if ( global_found === 0 ) {

    // remove the global flag from the parsed_argv free up the memory.
    parsed_argv.delete( 'global' );
  }
  else{
    for ( let _iterate_global_found = 0; _iterate_global_found < global_found; _iterate_global_found ++ ) {

      // remove the global flag from the process.argv remaining the command and its flags if any.
      argv.splice( 0, 1 );
    }
  }
}

/**
 * Extracts the option from the flag and sets it in the parsed_argv.
 *
 * @reutrns {ReferenceError} - If an equal sign requires a value.
 */
function extract_parameter( argv: ShallowCopyProcessArgv, parsed_argv: ParsedArgv, entry: number ): ReferenceError | string {

  if( argv[ entry ].endsWith( '=' ) ) {
    return new ReferenceError( `equal sign requires a value @ '${argv[ entry ]}'` );
  }

  if( ! argv[ entry ].includes( '=' ) ) {

    parsed_argv.get( 'flag' ).set( argv[ entry ], null );

    return argv[ entry ];
  }

  const assignment = argv[ entry ].indexOf( '=' );
  const flag_name = argv[ entry ].substring( 0, assignment );
  const option = argv[ entry ].substring( assignment + 1 );

  parsed_argv.get( 'flag' ).set( flag_name, infer_type( option ) );

  return flag_name;
}
