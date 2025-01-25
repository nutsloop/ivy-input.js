import type { FlagArgvOptions, OptionType } from '../cli/specs.js';
import type { ShallowCopyProcessArgv } from '../parser.js';
import type { KVPIdentifier } from './key_value_pair.js';

import { multi_type, type } from '../cli/type.js';
import { input_setting } from '../run.js';
import { is_alpha_identifier } from '../util/is_alpha_identifier.js';
import { infer_type } from './infer_type.js';
import { key_value_pair } from './key_value_pair.js';

export function command_option( argv0: ShallowCopyProcessArgv[0] ): Map<string, FlagArgvOptions> | Map<string, null>{

  if( argv0.includes( '=' ) && ! input_setting.get( 'command_accepts_options' ) ){

    throw( 'command does not accept options, to enable this feature, set the option \'command_accepts_options\' to true' );
  }

  if( argv0.includes( '=' ) && input_setting.get( 'command_accepts_options' ) ){

    if( argv0.endsWith( '=' ) ){

      throw( `equal sign requires a value @ '${ argv0 }' @ processing command option.` );
    }

    const [ command, option ] = argv0.split( '=' );
    is_alpha_identifier( command, 'parser(argv)' );

    return process_option( option, command );
  }

  is_alpha_identifier( argv0, 'parser(argv)' );

  return new Map( [ [ argv0, null ] ] );
}

function process_option( option: string, command: string ): Map<string, FlagArgvOptions>{

  const inferred_type = infer_type( option );
  const command_option = new Map();
  command_option.set( 'command', new Map() );
  command_option.get( 'command' ).set( command, inferred_type );

  if( input_setting.get( 'key_value_pairs_options' ) ){

    const kvp = key_value_pair( command_option, 'command' as KVPIdentifier );
    if( kvp instanceof ReferenceError ){

      throw( kvp.toString() );
    }
  }

  return command_option.get( 'command' );
}

export async function process_type( variable: unknown, single_type: OptionType, multiple_type: OptionType[], identifier: string ): Promise<string[]>{

  if( single_type ){

    const flag_type_returns = await type( variable, single_type )
      .catch( ( type_error ) => {
        throw ( `command "${ identifier }" option must be of type "${ single_type }", given "${type_error}"` );
      } );

    // if the flag type is an array, the flag value is converted to an array.
    if( Array.isArray( flag_type_returns ) ){

      return flag_type_returns;
    }
  }

  if( multiple_type ){

    const flag_multi_type_returns = await multi_type( variable, multiple_type )
      .catch( ( type_error ) => {
        throw( `command "${ identifier }" option must be of type "${ multiple_type }", given "${type_error}"` );
      } );

    if( Array.isArray( flag_multi_type_returns ) ){

      return flag_multi_type_returns;
    }
  }

  return undefined;
}
