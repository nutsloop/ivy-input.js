import type { ParsedArgv } from '../../parser.js';
import type { CallBack, CallBackAsync, CommandSpecification, FlagArgvOptions, FlagSpecification, OptionType } from '../specs.js';

import { CLIThreadEventEmitter } from '../../event/emitter.js';
import { process_type } from '../../parser/command_option.js';
import { input_setting } from '../../run.js';
import { CLISpecification } from '../specs.js';
import { flag } from './flag.js';
import { has_thread } from './flag/exec_precedence.js';

export async function command( identifier: string, parsed_argv: ParsedArgv ): Promise<void> {

  if ( ! CLISpecification.get( 'command' ).get( identifier ) ) {

    throw( `command '${ identifier }' not found` );
  }

  const command = CLISpecification.get( 'command' );
  const selected_command = command.get( identifier );
  const parsed_argv_flag = parsed_argv.get( 'flag' );
  const specs_command_flag = command.get( identifier )?.get( 'flag' );
  const parsed_option = parsed_argv.get( 'command' ).get( identifier );
  const command_type = selected_command.get( 'type' );
  const command_multi_type = selected_command.get( 'multi_type' );
  let parsed_as_argv: Map<string, Map<string, FlagArgvOptions>>;

  const command_has_option = await command_accept_option( identifier, parsed_option, command_type, command_multi_type )
    .catch( ( error ) => {

      throw error;
    } );

  // ONLY use the alias of the flag instead of the flag itself.
  if( selected_command.has( 'required_flag' ) ){

    if( ! parsed_argv_flag ){

      throw( `command '${ identifier }' requires flag '${ selected_command.get( 'required_flag' ) }'` );
    }

    const required_flag = selected_command.get( 'required_flag' );
    const match_alias: Map<string, string[]> = new Map();
    for( const flag of required_flag ){

      match_alias.set( flag, [] );

      for ( const [ alias_flag ] of specs_command_flag.entries() ) {

        if( specs_command_flag.get( alias_flag ).get( 'alias' ) === flag ){

          match_alias.get( flag ).push( alias_flag );
        }
      }
    }

    for( const [ flag, alias ] of match_alias.entries() ){

      if( parsed_argv_flag.has( flag ) ){

        continue;
      }

      const has_alias = new Set( [ false ] );
      for( const alias_flag of alias ){

        if( parsed_argv_flag.has( alias_flag ) ){

          has_alias.delete( false );
          has_alias.add( true );
          break;
        }
      }

      if( has_alias.has( true ) ){

        continue;
      }

      throw( `command '${ identifier }' requires flag '${ flag }'` );
    }
  }

  if ( parsed_argv_flag && parsed_argv_flag.size > 0 ) {

    if( ! specs_command_flag ){

      throw( `command '${ identifier }' does not have flags` );
    }

    parsed_as_argv = await flag( identifier, command.get( identifier ).get( 'flag' ), parsed_argv );
    if( has_thread.size === 0 ){

      await execute_command_cb( command, identifier, parsed_argv, specs_command_flag, parsed_as_argv, command_has_option );
    }
  }
  else{
    await execute_command_cb( command, identifier, parsed_argv, specs_command_flag, parsed_as_argv, command_has_option );
  }

  CLIThreadEventEmitter.on( 'thread-queue-empty', async () => {
    await execute_command_cb( command, identifier, parsed_argv, specs_command_flag, parsed_as_argv, command_has_option );
  } );
  CLIThreadEventEmitter.on( 'thread-error', ( error ) => {
    process.stderr.write( `${ error.message || error } -> ${'event-error'.blue()}\n` );
  } );
}

async function execute_command_cb( command: CommandSpecification, command_identifier: string, parsed_argv: ParsedArgv, specs_command_flag: FlagSpecification, parsed_as_argv: Map<string, Map<string, FlagArgvOptions>>, command_has_option: unknown ): Promise<void>{

  // cb section
  const specs_command_cb = command.get( command_identifier )?.get( 'cb' );
  const specs_command_rest = command.get( command_identifier )?.get( 'rest' );

  if ( specs_command_cb ) {

    // to the command cb is passed the parsedARGV[ flag ] Map with all the entries->values, command data and the rest_args if any.
    if ( specs_command_flag && parsed_argv.has( 'flag' ) && parsed_argv.get( 'flag' ).size > 0 ) {

      if ( parsed_as_argv.size > 0 ) {

        for ( const [ flag_entry, parsed_as ] of parsed_as_argv.entries() ) {

          for ( const [ key, value ] of parsed_as.entries() ) {

            parsed_argv.get( 'flag' ).delete( flag_entry );
            parsed_argv.get( 'flag' ).set( key, value );
          }
        }

      }
    }
    if( command_has_option ){

      if( ! parsed_argv.has( 'flag' ) ){
        parsed_argv.set( 'flag', new Map() );
      }
      parsed_argv.get( 'flag' ).set( command_identifier, command_has_option );
    }
    const command_cb = command.get( command_identifier )?.get( 'cb' );
    const command_cb_type = command.get( command_identifier )?.get( 'cb_type' );
    const command_data = command.get( command_identifier )?.get( 'this' );
    if ( command_cb_type === 'async' ) {

      const bind_cb: CallBackAsync = command_cb.bind( command_data );
      await bind_cb( parsed_argv.get( 'flag' ) || parsed_argv, ...specs_command_rest || [] )
        .catch( ( error: Error ) => {
          throw( `callback of command '${ command_identifier }' thrown an error -> ${ error.message || error }` );
        } );
    }
    else {

      try {

        const bind_cb: CallBack = command_cb.bind( command_data );
        bind_cb( parsed_argv.get( 'flag' ) || parsed_argv, ...specs_command_rest || [] );
      }
      catch ( error ) {
        throw( `callback of command '${ command_identifier }' thrown an error -> ${ error.message || error }` );
      }
    }
  }
}

async function command_accept_option( identifier: string, option: unknown, type: OptionType, multiple_types: OptionType[] ): Promise<unknown[]>{

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
