import { cwd } from '@ivy-industries/cross-path';
import cluster from 'cluster';

import type { RunWithoutCommandOptions } from './cli.js';

import { not_handle_async_warn } from './cli/constant/not_handle_async_warn.js';
import { InputError } from './error.js';
import { type ParsedArgv, parser } from './parser.js';

export type ProcessArgv = NodeJS.Process['argv'] | string[];
export type CLILogic = ( data: ParsedArgv ) => Promise<void>;
type CLIInfo = Map<'cwd' | 'process.title', string>;

export const CLI: CLIInfo = new Map();

type RunOptions = {
  command_accepts_options?: boolean,
  handle_uncaught_error?: boolean
  key_value_pairs_options?: boolean,
  no_warnings?: boolean,
  only_alpha?: boolean
  parse_json?: boolean,
  run_without_command?: RunWithoutCommandOptions,
  show_no_warnings_warn?: boolean,
}

type InputSetting =
  Map<
    'command_accepts_options' |
    'handle_uncaught_error' |
    'key_value_pairs_options' |
    'no_warnings' |
    'only_alpha' |
    'parse_json' |
    'show_no_warnings_warn',
    boolean
  > &
  Map<'run_without_command', RunWithoutCommandOptions>;

export const input_setting: InputSetting = new Map();
input_setting.set( 'key_value_pairs_options', true );
input_setting.set( 'no_warnings', false );
input_setting.set( 'show_no_warnings_warn', true );
input_setting.set( 'parse_json', true );
input_setting.set( 'only_alpha', true );
input_setting.set( 'run_without_command', false );
input_setting.set( 'command_accepts_options', false );
input_setting.set( 'handle_uncaught_error', true );

/**
 * **Runs the specified `logic` with the given `command line arguments`.**
 *
 * the `key_value_pairs_options` parameter is optional, if it is not passed it will be considered `false`.
 *
 * options are key→value pairs that are passed to the flag.
 * - sign `:` is used to separate the key from the value.
 * - sign `|` is used to separate sets of key value pairs.
 * - sign `=` is used to separate the flag from the options.
 * - the parser needs to be instructed by putting the sign `!` before the key value pair.
 *
 * syntax for options:
 * - [flag-ident]{=}{!}[key]{:}[value]{|}[key]{:}[value]
 * - \<cli-name> <command> <flag>=!key:value|key2:value2
 */
export async function run( argv: ProcessArgv, logic: CLILogic, process_title: string, options?: RunOptions ): Promise<void> {

  set_options( options );

  if( input_setting.get( 'handle_uncaught_error' ) ){

    process.on( 'uncaughtException', ( uncaught_error: ( Buffer | string ) & Error ) => {

      process.stderr.write( '\ncatching uncaught errors\n'.green() );
      const input_error = new InputError( uncaught_error.message || uncaught_error );
      if( input_error.toString().includes( not_handle_async_warn ) ){

        process.stderr.write( `${input_error.toString()
          .replace( not_handle_async_warn, '' )
          .replace( '"', '' )
          .slice( 0, - 2 )}.`.red()
        );
      }
      else{
        process.stderr.write( `${input_error.toString()}`.red() );
      }
      process.stderr.write( `${input_error.stack.replace( input_error.toString(), '' )}`.blue() );
      process.exit( 1 );
    } );
  }

  if( cluster.isPrimary ){
    no_warning( input_setting.get( 'no_warnings' ) );
  }

  check_logic( logic );
  check_process_title( process_title );

  // set the process title
  process.title = process_title;
  // remove the first two entries of the process.argv
  process.argv.splice( 0, 2 );

  // setting cli_info
  CLI.set( 'process.title', process.title );
  CLI.set( 'cwd', cwd() );

  /**
   * It is recommended to shallowly copy the argv argument because,
   * if 'process.argv' is given to the function 'run()'
   * it will be changed by '@ivy-industries/parser()', and remain unchanged during the execution of the program.
   */
  const parsed_argv: ParsedArgv = await parser( Array.from( argv ) )
    .catch( ( error: Error ) => {
      throw error;
    } );

  await logic( parsed_argv ).catch( ( error ) => {
    throw error;
  } );
}

function check_logic( logic: CLILogic ): void {

  if( logic === undefined ){
    throw( `logic can't be undefined` );
  }

  if( typeof logic === 'function' ){

    if( logic.constructor.name !== 'AsyncFunction' ) {

      throw( 'the logic function must be AsyncFunction' );
    }
  }
}

function check_process_title( process_title: string ): void {

  if ( process_title === undefined ) {

    throw( `process_title can't be undefined` );
  }
}

function set_options( options: RunOptions ): void {

  check_options( options );

  input_setting.set( 'key_value_pairs_options', options?.key_value_pairs_options ?? true );
  input_setting.set( 'no_warnings', options?.no_warnings ?? false );
  input_setting.set( 'parse_json', options?.parse_json ?? true );
  input_setting.set( 'show_no_warnings_warn', options?.show_no_warnings_warn ?? true );
  input_setting.set( 'only_alpha', options?.only_alpha ?? true );
  input_setting.set( 'run_without_command', options?.run_without_command ?? false );
  input_setting.set( 'command_accepts_options', options?.command_accepts_options ?? false );
  input_setting.set( 'handle_uncaught_error', options?.handle_uncaught_error ?? true );
}

function check_options( options: RunOptions ): void {

  if( options === undefined ) {

    return;
  }

  // check if the extra_options is an object
  if( options.constructor.name !== 'Object' ) {
    throw( 'options must be an object' );
  }

  assert_type_is_boolean( options, 'key_value_pairs_options' );
  assert_type_is_boolean( options, 'no_warnings' );
  assert_type_is_boolean( options, 'parse_json' );
  assert_type_is_boolean( options, 'show_no_warnings_warn' );
  assert_type_is_boolean( options, 'only_alpha' );
  assert_type_is_boolean( options, 'command_accepts_options' );
  assert_type_is_boolean( options, 'handle_uncaught_error' );
  if( options.run_without_command !== undefined ) {
    assert_and_set_run_without_command( options.run_without_command );
  }
}

function assert_type_is_boolean( options: unknown, property: string ): void {

  const value = options[ property ];
  if( value !== undefined && value.constructor.name !== 'Boolean' ) {

    throw( `${property} must be boolean` );
  }
}

function assert_and_set_run_without_command( no_command: RunWithoutCommandOptions ): void{

  const run_without_command = no_command || false;
  if( run_without_command.constructor.name !== 'Object' && no_command !== false ) {
    throw( `options.run_without_command must be an object or set to false. given: ${run_without_command.toLocaleString()}` );
  }

  if( typeof run_without_command !== 'boolean' && typeof run_without_command === 'object' ){

    if( ! run_without_command.cb ) {
      throw( 'options.run_without_command.cb must be defined' );
    }

    if( typeof run_without_command.cb !== 'function' ) {
      throw( 'options.run_without_command.cb must be a function' );
    }

    if( run_without_command.data && ! Array.isArray( run_without_command.data ) ) {
      throw( 'options.run_without_command.data must be an array' );
    }
  }
}

const no_warning_text = `${ '⚠'.yellow() } node warnings are disabled

to disable this warning, pass the option 'show_no_warnings_warn' as false to the function 'run()'.
`;

function no_warning( no_warning?: boolean ): void {

  if( no_warning ) {

    if( input_setting.get( 'show_no_warnings_warn' ) ) {
      process.stdout.write( no_warning_text );
    }

    const originalEmit = process.emit;
    // @ts-expect-error: disabling all the warning.
    process.emit = function ( name: string, _data: { name: string; }, ...args: unknown[] ): boolean {

      return name === 'warning' ? false : originalEmit.apply( process, [ ...args ] );
    };
  }
}
