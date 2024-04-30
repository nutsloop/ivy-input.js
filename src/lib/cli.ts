import type { ParsedArgv } from './parser.js';

import { help } from './cli/help.js';
import { global } from './cli/processor/global.js';
import { processor } from './cli/processor/processor.js';
import { version } from './cli/specification/version.js';
import { CLISpecification } from './cli/specs.js';
import { input_setting } from './run.js';

export async function cli( parsed_argv: ParsedArgv ): Promise<void> {

  if( CLISpecification.has( 'global' ) && parsed_argv.has( 'global' ) ){

    await global( parsed_argv );
  }

  for ( const [ command_identifier ] of parsed_argv.get( 'command' ).entries() ) {

    switch ( command_identifier ) {

      case 'help':
      case '-h':
      case '--help': {
        await help( parsed_argv );
      }

        break;

      case 'version':
      case '-v':
      case '--version': {
        await version();
      }

        break;

      case 'no_command': {

        const run_without_command = input_setting.get( 'run_without_command' );
        if( run_without_command ){

          const no_command_cb = run_without_command.cb;
          const no_command_data = run_without_command.data;

          if( no_command_cb.constructor.name === 'AsyncFunction' ){

            await no_command_cb( ...no_command_data )
              .catch( ( error ) => {
                throw error;
              } );
          }
          else if( no_command_cb.constructor.name === 'Function' ) {

            try {

              const is_promise = no_command_cb( ...no_command_data );
              if ( is_promise instanceof Promise ) {

                await is_promise.catch( ( error ) => {
                  throw error;
                } );
              }
            }
            catch ( error ) {
              throw( error.toString() );
            }
          }
        }
      }

        break;

      default: {

        await processor( command_identifier, parsed_argv ).catch( ( error ) => {
          throw error;
        } );
      }

        break;
    }
  }
}

export type CallBackWithoutCommand<T = unknown[]> =
  ( ( ...data: CallBackWithoutCommandData<T> ) => Promise<void> ) &
  ( ( ...data: CallBackWithoutCommandData<T> ) => void );

export type CallBackWithoutCommandData<T=unknown[]> = T[];
export type RunWithoutCommandOptions = {
  /**
   * @description the callback function to run when the command line input is empty
   */
  cb: CallBackWithoutCommand;
  /**
   * @description the data to pass to the callback function
   */
  data?: CallBackWithoutCommandData;
} | false;

export function run_without_command( cb: CallBackWithoutCommand, data: CallBackWithoutCommandData ): RunWithoutCommandOptions{

  return {
    cb,
    data
  };
}
