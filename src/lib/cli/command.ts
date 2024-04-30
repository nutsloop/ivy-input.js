import type{ ReservedType } from './constant/reserved.js';
import type { CallBack, CallBackAsync, CommandSpecificationType, OptionType, This } from './specs.js';

import { input_setting } from '../run.js';
import { is_alpha_identifier } from '../util/is_alpha_identifier.js';
import { Reserved } from './constant/reserved.js';
import { CLISpecification } from './specs.js';

type CommandSpecification = {
  cb?: CallBack | CallBackAsync;
  description?: string;
  has_flag?: boolean;
  multi_type?: OptionType[];
  required_flag?: string[];
  rest?: unknown[];
  this?: This;
  type?: OptionType;
  usage?: string;
}

/**
 * <u>Adds a new command to the api registry.</u>
 *
 * - _if self_define_flag is true, the command will be responsible for defining its own flag/s._
 *
 * @param {string|string[]} identifier - The unique identifier for the command or a list of unique identifiers.
 * @param {CommandSpecification} [specification] - Optional specification for the command.
 *
 * @returns {Promise<FlagSignature|void>} - A promise that resolves with a flag type or void.
 *
 * @rejects {Error}
 *                  - If the command ID is already defined.
 *                  - If self_define_flag is true and has_flag is false.
 */
export async function command( identifier: string | string[], specification?: CommandSpecification ): Promise<void>{

  if( Array.isArray( identifier ) ){

    for( const command of identifier ){

      is_alpha_identifier( command, '-> command' );
      process_command( command, specification );
    }
  }
  else{

    is_alpha_identifier( identifier, '-> command' );
    process_command( identifier, specification );
  }
}

async function process_command( identifier: string, specification?: CommandSpecification ): Promise<void>{

  if ( Reserved.has( identifier as ReservedType ) ){
    throw( `${ identifier } is a reserved word` );
  }

  if( CLISpecification.get( 'command' ).get( identifier ) ){
    throw( `${ identifier } already defined` );
  }

  if( input_setting.get( 'command_accepts_options' ) === false && specification.type ){
    throw( `command '${ identifier }' cannot have a type, to allow options for commands, set 'command_accepts_options' to true` );
  }

  const command_data: CommandSpecificationType = new Map();

  if( input_setting.get( 'command_accepts_options' ) === true ){

    if( specification?.type && specification?.multi_type ){
      throw( `type and multi_type cannot be defined together -> ${identifier}` );
    }

    if( specification?.type ){
      if( Array.isArray( specification.type ) ){
        throw( `type cannot be an array -> ${identifier}` );
      }
      command_data.set( 'type', specification.type );
    }
    else if( specification?.multi_type ){
      command_data.set( 'multi_type', specification.multi_type );
    }
  }

  if( specification?.has_flag && specification.has_flag === true ){

    command_data.set( 'flag', new Map() );
    if( specification?.required_flag ){

      if( specification.required_flag.length === 0 ){

        throw( `has_required_flag can not be an empty array` );
      }

      command_data.set( 'required_flag', specification.required_flag );
    }
  }

  command_data.set( 'description', specification?.description || 'no description provided' );
  command_data.set( 'usage', specification?.usage || 'no usage provided' );

  if( specification?.cb ){

    // if the command has a callback, it is checked if the callback is a function.
    if( typeof specification.cb !== 'function' ){

      throw( `cb must be a function -> ${identifier}` );
    }
    else{

      // if the command has a callback, it is checked if the callback is a AsyncFunction, Function or Promise.
      // Promise and AsyncFunction are treated as async, Function is treated as sync.
      if( specification.cb.constructor.name === 'AsyncFunction' ){

        command_data.set( 'cb_type', 'async' );
      }
      else if( specification.cb.constructor.name === 'Function' ){

        command_data.set( 'cb_type', 'sync' );
      }
      else if( specification.cb.constructor.name === 'Promise' ){

        command_data.set( 'cb_type', 'async' );
      }
    }

    command_data.set( 'cb', specification.cb );

    if( specification?.rest ){

      command_data.set( 'rest', specification.rest );
    }

    if( specification?.this ){

      if( specification.cb.name === 'cb' ){

        // match the word function or async function followed. determine if the cb is anonymous or not.
        const match = specification.cb.toString().match( /async function\s|function\s/g );
        if( match === null ){

          throw( `cb of command -> ${identifier.red().strong()} cannot be ${'anonymous'.underline()} OR ${'anonymous arrow function'.underline()}, because to access the data passed to it,\nit will be required to call ${'this'.magenta()} within the cb.\ngive it a name ⬇ \n\nfunction my_special_cb(){\n  console.log(this)//to access the data\n}\n` );
        }
      }

      command_data.set( 'this', specification.this );
    }
  }

  if( specification?.rest && ! specification?.cb ){
    throw( `rest can only be defined if cb is defined` );
  }

  if( specification?.this && ! specification?.cb ){
    throw( `data can only be defined if cb is defined` );
  }

  CLISpecification.get( 'command' ).set( identifier, command_data );
}
