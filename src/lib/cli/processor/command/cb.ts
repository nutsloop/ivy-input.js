import type { ParsedArgv } from '../../../parser.js';
import type { CallBack, CallBackAsync, CommandSpecification, FlagArgvOptions, FlagSpecification } from '../../specs.js';

export async function execute_cb( command: CommandSpecification, command_identifier: string, parsed_argv: ParsedArgv, specs_command_flag: FlagSpecification, parsed_as_argv: Map<string, Map<string, FlagArgvOptions>>, command_has_option: unknown ): Promise<void>{

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
    const command_this_data = command.get( command_identifier )?.get( 'this' );
    const command_data = new Map();
    command_data.set( 'this', command_this_data );
    command_data.set( 'command_identifier', command_identifier );

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
