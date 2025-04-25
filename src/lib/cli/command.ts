import type { CallBack, CallBackAsync, CallBackPromise, CommandSpecificationType, OptionType, This } from './specs.js';

import { input_setting } from '../run.js';
import { is_alpha_identifier } from '../util/is_alpha_identifier.js';
import { Reserved } from './constant/reserved.js';
import { CLISpecification } from './specs.js';

/**
 * Specification for defining a command in the CLI.
 *
 * This type outlines the structure for specifying various attributes and options
 * for a command, including its callback function, description, options, and usage instructions.
 * It allows for extensive customization of commands to suit different needs and scenarios.
 */
export type CommandSpecification<T> = {
  /**
   * The callback function to be executed when the command is invoked.
   * Can be either:
   * - a synchronous function (`CallBack`)
   * - an asynchronous function (`CallBackAsync`)
   * - a function that returns a promise (`CallBackPromise`)
   *
   * By defining the callback type, the Input library will handle the function accordingly,
   * returning the result in case of a synchronous function or the fulfilled or rejected result
   * from the promise/async function.
   */
  cb?: T;

  /**
   * A brief description of what the command does.
   * This description is used for help and usage documentation.
   */
  description?: string;

  /**
   * Indicates whether the command has flags.
   * If true, the command can accept flags as options.
   */
  has_flag?: boolean;

  /**
   * Defines multiple option types for the command.
   * Used when the command can accept multiple types of options.
   *
   * Exported types for options:
   * - `array`
   * - `boolean`
   * - `json`
   * - `kvp`
   * - `number`
   * - `object`
   * - `string`
   * - `void`
   */
  multi_type?: OptionType[];

  /**
   * An array of required flags that must be provided when invoking the command.
   * If this array is empty, an error will be thrown.
   */
  required_flag?: string[];

  /**
   * Additional parameters or data that can be passed to the command.
   * Can be used to pass extra information needed for the command execution.
   */
  rest?: unknown[];

  /**
   * The context (`this` value) for the callback function.
   * Allows accessing instance-specific data within the callback.
   */
  this?: This;

  /**
   * The type of option that the command accepts.
   * Specifies the expected type of the option for validation.
   *
   * Exported types for options:
   * - `array`
   * - `boolean`
   * - `json`
   * - `kvp`
   * - `number`
   * - `object`
   * - `string`
   * - `void`
   */
  type?: OptionType;

  /**
   * Instructions on how to use the command.
   * Provides usage examples or syntax for the command.
   */
  usage?: string;
};

/**
 * Custom error class for CommandValidationError.
 *
 * @extends {Error}
 */
export class CommandValidationError extends Error {
  constructor( message: string ) {
    super( message );
    this.name = 'CommandValidationError';
  }
}

/**
 * Adds a new command to the api registry.
 *
 * if idenfitier is an array, it will add multiple commands to the registry.
 *
 * @param {string|string[]} identifier - The unique identifier for the command or a list of unique identifiers.
 * @param {CommandSpecification} [specification] - Optional specification for the command.
 *
 * @throws {CommandValidationError, IsAlphanumericArgumentError, IsAlphanumericIdentifierError}
 *   - based on is_alpha_identifier function.
 *   - based on the process_command function.
 */
export async function command<T>( identifier: string | string[], specification?: CommandSpecification<T> ): Promise<void>{

  if( Array.isArray( identifier ) ){

    for( const command of identifier ){

      is_alpha_identifier( command, 'command' );
      process_command( command, specification );
    }
  }
  else{

    is_alpha_identifier( identifier, 'command' );
    process_command( identifier, specification );
  }
}

/**
 * Processes a command and adds it to the CLI specification registry.
 *
 * @param {string} identifier - The unique identifier for the command.
 * @param {CommandSpecification} [specification] - Optional specification for the command.
 *
 * @throws {CommandValidationError}
 *   - If the command ID is a reserved word.
 *   - If the command ID is already defined.
 *   - If the command type is given and the command_accepts_options setting is false.
 *   - If the type and multi_type are defined together.
 *   - If the type is an array.
 *   - If has_required_flag is an empty array.
 *   - If cb is not a function.
 *   - If CommandSpecification.this is set but the cb is an anonymous function.
 *   - If CommandSpecification.rest and|or CommandSpecification.this are defined but cb is not.
 */
async function process_command<T>( identifier: string, specification?: CommandSpecification<T> ): Promise<void> {

  // Check if the identifier is a reserved word.
  // todo: may be better that throws ReservedError.
  if ( Reserved.has( identifier ) ) {
    throw new CommandValidationError( `${identifier} is a reserved word` );
  }

  // Check if the command is already defined.
  if ( CLISpecification.get( 'command' ).has( identifier ) ) {
    throw new CommandValidationError( `${identifier} already defined` );
  }

  // Check if the command accepts options and if the type is defined.
  const commandAcceptsOptions = input_setting.get( 'command_accepts_options' );
  if ( ! commandAcceptsOptions && specification?.type ) {
    throw new CommandValidationError( `command '${identifier}' cannot have a type, to allow options for commands, set 'command_accepts_options' to true` );
  }

  const command_data: CommandSpecificationType = new Map();

  if ( commandAcceptsOptions ) {
    // Check if both type and multi_type are defined together.
    if ( specification?.type && specification?.multi_type ) {
      throw new CommandValidationError( `type and multi_type cannot be defined together -> ${identifier}` );
    }

    // Check if the type is an array.
    if ( specification?.type ) {
      if ( Array.isArray( specification.type ) ) {
        throw new CommandValidationError( `type cannot be an array -> ${identifier}` );
      }
      command_data.set( 'type', specification.type );
    }
    else if ( specification?.multi_type ) {
      command_data.set( 'multi_type', specification.multi_type );
    }
  }

  if ( specification?.has_flag ) {
    command_data.set( 'flag', new Map() );

    if ( specification?.required_flag ) {
      if ( specification.required_flag.length === 0 ) {
        throw new CommandValidationError( `required_flag cannot be an empty array` );
      }
      command_data.set( 'required_flag', specification.required_flag );
    }
  }

  command_data.set( 'description', specification?.description || 'no description provided' );
  command_data.set( 'usage', specification?.usage || 'no usage provided' );

  if ( specification?.cb ) {
    if ( typeof specification.cb !== 'function' ) {
      throw new CommandValidationError( `cb must be a function -> ${identifier}` );
    }

    const cbType = specification.cb.constructor.name;
    if ( cbType === 'AsyncFunction' || cbType === 'Promise' ) {
      command_data.set( 'cb_type', 'async' );
    }
    else if ( cbType === 'Function' ) {
      command_data.set( 'cb_type', 'sync' );
    }

    command_data.set( 'cb', specification.cb as unknown as CallBack | CallBackAsync | CallBackPromise );

    if ( specification?.rest ) {
      command_data.set( 'rest', specification.rest );
    }

    if ( specification?.this ) {
      if ( specification.cb.name === 'cb' ) {
        const match = specification.cb.toString().match( /async function\s|function\s/g );
        if ( match === null ) {
          throw new CommandValidationError( `cb of command -> ${identifier} cannot be anonymous or an anonymous arrow function, because to access the data passed to it, it will be required to call 'this' within the cb. Give it a name.` );
        }
      }
      command_data.set( 'this', specification.this );
    }
  }

  if ( specification?.rest && ! specification?.cb ) {
    throw new CommandValidationError( `"rest" can only be defined if "cb" is defined` );
  }

  if ( specification?.this && ! specification?.cb ) {
    throw new CommandValidationError( `"this" can only be defined if "cb" is defined` );
  }

  CLISpecification.get( 'command' ).set( identifier, command_data );
}
