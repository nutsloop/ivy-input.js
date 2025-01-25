import type { ParsedArgv } from '../../parser.js';
import type { FlagArgvOptions } from '../specs.js';

import { CLIThreadEventEmitter } from '../../event/emitter.js';
import { CLISpecification } from '../specs.js';
import { accept_option } from './command/accept_option.js';
import { execute_cb } from './command/cb.js';
import { has_no_flag } from './command/has_no_flags.js';
import { has_require_flag } from './command/has_required_flag.js';
import { flag } from './flag.js';
import { has_thread } from './flag/exec_precedence.js';

/**
 * Custom error class for command requires flag error.
 *
 * @extends {Error}
 */
export class CommandRequiresFlag extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'CommandRequiresFlag';
  }
}

/**
 * Custom error class for command not found error.
 *
 * @extends {Error}
 */
export class CommandNotFound extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'CommandNotFound';
  }
}

/**
 * Custom error class for command has no flags error.
 *
 * @extends {Error}
 */
export class CommandHasNoFlags extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'CommandHasNoFlags';
  }
}

export async function command( identifier: string, parsed_argv: ParsedArgv ): Promise<void> {

  if ( ! CLISpecification.get( 'command' ).get( identifier ) ) {

    throw new CommandNotFound( `command '${ identifier }' not found` );
  }

  const command = CLISpecification.get( 'command' );
  const selected_command = command.get( identifier );
  const parsed_argv_flag = parsed_argv.get( 'flag' );
  const specs_command_flag = command.get( identifier )?.get( 'flag' );
  const parsed_option = parsed_argv.get( 'command' ).get( identifier );
  const command_type = selected_command.get( 'type' );
  const command_multi_type = selected_command.get( 'multi_type' );

  const command_has_option = await accept_option( identifier, parsed_option, command_type, command_multi_type );

  has_require_flag( selected_command, identifier, parsed_argv, parsed_argv_flag, specs_command_flag );
  has_no_flag( parsed_argv_flag, specs_command_flag, identifier );

  let parsed_as_argv: Map<string, Map<string, FlagArgvOptions>> | undefined;

  if ( parsed_argv_flag && parsed_argv_flag.size > 0 ) {
    if ( ! specs_command_flag ) {
      throw new CommandHasNoFlags( `command '${identifier}' does not have flags` );
    }
    parsed_as_argv = await flag( identifier, specs_command_flag, parsed_argv );
  }

  if( has_thread.size === 0 ){
    await execute_cb( command, identifier, parsed_argv, specs_command_flag, parsed_as_argv, command_has_option );
  }

  CLIThreadEventEmitter.on( 'thread-queue-empty', async () => {
    await execute_cb( command, identifier, parsed_argv, specs_command_flag, parsed_as_argv, command_has_option );
  } );
  CLIThreadEventEmitter.on( 'thread-error', ( error ) => {
    process.stderr.write( `${ error.message || error } -> ${'event-error'.blue()}\n` );
  } );
}
