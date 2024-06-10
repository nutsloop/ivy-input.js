import type { CallBackTypeFlag, FlagSpecificationType, OptionType, This } from './specs.js';

import { is_alpha_identifier } from '../util/is_alpha_identifier.js';
import { already_defined } from './specification/flag/already_defined.js';
import { is_reserved } from './specification/flag/is_reserved.js';
import { set_alias } from './specification/flag/set_alias.js';
import { set_callback } from './specification/flag/set_callback.js';
import { set_conflict } from './specification/flag/set_conflict.js';
import { set_dependency } from './specification/flag/set_dependency.js';
import { set_description } from './specification/flag/set_description.js';
import { set_precedence } from './specification/flag/set_precedence.js';
import { set_short_long } from './specification/flag/set_short_long.js';
import { set_type } from './specification/flag/set_type.js';
import { set_usage } from './specification/flag/set_usage.js';
import { CLISpecification } from './specs.js';

export type FlagThreadSpecification = {
  thread_cb_name: string;
  thread_cb_path: string;
} | false;

type FlagSpecification = {
  alias: string;
  cb?: CallBackTypeFlag;
  depends_on?: string | string[];
  description?: string;
  has_conflict?: string | string[];
  identifiers?: Map<'long' | 'short', string>;
  is_flag_of: string | string[];
  is_flag_of_command?: string;
  long?: string;
  multi_type?: OptionType[];
  precedence?: number;
  rest?: unknown[];
  short?: string;
  this?: This;
  thread?: FlagThreadSpecification;
  type?: OptionType;
  usage?: string;
  void?: boolean;
}

export async function flag( id: string|string[], specification: FlagSpecification ): Promise<void>{

  if( Array.isArray( specification.is_flag_of ) ){

    const command_check = multi_command_not_defined( specification.is_flag_of );
    if( command_check.get( 'failed' ) ){

      const failed_commands: string[] = [];
      for( const [ command, value ] of command_check ){

        if( command !== 'failed' ){

          if( ! value ){

            failed_commands.push( `${command} not defined`.red() );
          }
          else{

            failed_commands.push( `${command} defined`.green() );
          }
        }
      }
      throw( `${ failed_commands.join( '\n' ) }` );
    }

    for( const command of specification.is_flag_of ){

      specification.is_flag_of_command = command;
      set_flag( id, specification );
    }
  }
  else if( typeof specification.is_flag_of === 'string' ){

    if( ! CLISpecification.get( 'command' )?.get( specification.is_flag_of ) ){
      throw( `${ specification.is_flag_of } not defined`.red() );
    }
    specification.is_flag_of_command = specification.is_flag_of;
    set_flag( id, specification );
  }
}

function set_flag( identifier: string|string[], specification: FlagSpecification ): void{
  if( Array.isArray( identifier ) ){

    for( const flag of identifier ){

      is_alpha_identifier( flag, 'flag' );
      process_flag( flag, specification );
    }
  }
  else{

    is_alpha_identifier( identifier, 'flag' );
    process_flag( identifier, specification );
  }
}

function multi_command_not_defined( id: string[] ): Map<'failed' | string, boolean>{

  const command_check: Map<'failed' | string, boolean> = new Map();
  command_check.set( 'failed', false );
  for( const command of id ){

    if( ! CLISpecification.get( 'command' )?.get( command ) ){

      command_check.set( command, false );
      command_check.set( 'failed', true );
    }
    else{
      command_check.set( command, true );
    }
  }

  return command_check;
}

function process_flag( flag: string, specification: FlagSpecification ){

  is_reserved( flag );
  already_defined( flag, specification.is_flag_of_command );

  const flag_data: FlagSpecificationType = new Map();

  set_description( flag_data, specification.description || 'no description provided' );
  set_usage( flag_data, specification.usage || 'no usage provided' );
  set_alias( flag_data, specification.alias, flag );
  set_short_long( specification.identifiers, flag_data, flag );
  set_conflict( flag_data, specification.has_conflict );
  set_dependency( flag_data, specification.depends_on );
  set_type( flag_data, {
    multi_type: specification.multi_type,
    type: specification.type,
    void: specification.void
  }, flag );
  set_callback( flag_data, specification.cb || false, flag );
  set_precedence( flag_data, specification.precedence, flag );

  CLISpecification.get( 'command' )?.get( specification.is_flag_of_command )?.get( 'flag' )?.set( flag, flag_data );
}
