import type { KVP } from '../parser/key_value_pair.js';
import type { FlagThreadSpecification } from './flag.js';

export type FlagArgvOptions = {} | KVP | boolean | number | string | string[] | unknown[];
export type CallBackArgvData<I = string, V = FlagArgvOptions> = Map<I, V>
export type CallBackFlagArgvData<V = FlagArgvOptions> = V
export type This<T = unknown> = T;
export type CallBackType = 'async' | 'promise' | 'sync';
export type OptionType = 'array' | 'boolean' | 'json' | 'kvp' | 'number' | 'object' | 'string' | 'void';
export type CallBackRestArgs<T = unknown[]> = T;
export type CallBackFlagReturn<T = FlagArgvOptions | unknown | unknown[] | void> = T;

/**
 * @description callback function
 *
 *              **Parsed arguments from the command-line given to the cb.**
 *              - to the `flag_cb` is passed the flag value<argv> and the rest_args if any
 *              - to the `command_cb` is passed the parsed flag Map<string, argv> and the rest_args if any
 */
export type CallBack = ( cb_data: CallBackArgvData, ...cb_rest: CallBackRestArgs ) => void;
export type CallBackAsync = ( cb_data: CallBackArgvData, ...cb_rest: CallBackRestArgs ) => Promise<void>;
export type CallBackPromise = ( cb_data: CallBackArgvData, ...cb_rest: CallBackRestArgs ) => Promise<unknown>;
export type CallBackFlag = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => CallBackFlagReturn;
export type CallBackFlagAsync = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => Promise<CallBackFlagReturn>;
export type CallBackFlagPromise = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => Promise<CallBackFlagReturn<unknown>>;
export type CallBackGlobalFlag = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => void;
export type CallBackGlobalFlagAsync = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => Promise<void>;
export type CallBackGlobalFlagPromise = ( cb_data: CallBackFlagArgvData, ...cb_rest: CallBackRestArgs ) => Promise<unknown>;

export type CallBackTypeFlag = {
  fn: CallBackFlag | CallBackFlagAsync | CallBackFlagPromise;
  rest?: CallBackRestArgs;
  this?: This;
  thread?: FlagThreadSpecification;
  type: CallBackType;
};

export type FlagSpecificationType =
  Map<'alias' |
    'description' |
    'long' |
    'short' |
    'usage', string> &
  Map<'cb', CallBackTypeFlag | false> &
  Map<'depends_on' | 'has_conflict', string | string[]> &
  Map<'multi_type', OptionType[]> &
  Map<'precedence', number> &
  Map<'type', OptionType> &
  Map<'void', boolean>;

export type FlagSpecification = Map<string, /* flag name */
 FlagSpecificationType>;

export type CallBackTypeGlobal = {
  fn: CallBackGlobalFlag | CallBackGlobalFlagAsync | CallBackGlobalFlagPromise;
  rest?: CallBackRestArgs;
  this?: This;
  type: CallBackType;
};

export type GlobalFlagSpecificationType =
  Map<'cb', CallBackTypeGlobal> &
  Map<'description' | 'usage', string> &
  Map<'has_conflict' | 'only_for', string | string[]> &
  Map<'multi_type', OptionType[]> &
  Map<'type', OptionType> &
  Map<'void', boolean>;

export type CallBackTypeCommand = {
  fn: CallBack | CallBackAsync | CallBackPromise;
  rest?: CallBackRestArgs;
  this?: This;
  type: CallBackType;
};

export type CommandSpecificationType =
  Map<'cb', CallBack | CallBackAsync | CallBackPromise> &
  Map<'cb_type' | 'description' | 'usage', string> &
  Map<'flag', FlagSpecification> &
  Map<'multi_type', OptionType[]> &
  Map<'required_flag', string[]> &
  Map<'rest', CallBackRestArgs> &
  Map<'this', This> &
  Map<'type', OptionType>;

export type CommandSpecification = Map<string, /* command name */
  CommandSpecificationType>;

export type CLISpecification =
  Map<'command', CommandSpecification
  > &
  Map<'global',
    Map<string, // global flag name
      GlobalFlagSpecificationType>
  >;

export const CLISpecification: CLISpecification = new Map().set( 'command', new Map() );

export function get_specification(): CLISpecification {
  return CLISpecification;
}

export function reset_specification(): void {
  CLISpecification.clear();
  CLISpecification.set( 'command', new Map() );
}

/**
 * @description the specification for the command line interface (CLI).
 *             this interface is not being used by the CLI, it is used by the `help` & `version` functions to generate the help documentation.
 */
export type CLIInfoSpecification = {
  /**
   * @description the description of the CLI application
   */
  description?: null | string;
  /**
   * @description the github page of the CLI application
   */
  github?: null | string;
  /**
   * @description the name of the CLI application
   */
  name?: null | string;
  /**
   * @description the npmjs page of the CLI application
   */
  npmjs?: null | string;
  /**
   * @description the usage of the CLI application
   */
  usage?: null | string;
  /**
   * @description the version of the CLI application
   */
  version?: null | string;
  /**
   * @description the website of the CLI application
   */
  website?: null | string;
};

/**
 * **The specification for the command line interface (CLI).**
 *
 * this interface is not being used by the CLI, it is used by the `help` & `version` functions to generate the help documentation.
 * it is unnecessary to define all the properties, only the ones that are needed.
 * the properties that are not defined will be replaced with a default value.
 *
 * <u>the default values are:</u>
 * - name: null
 * - description: null
 * - usage: null
 * - version: null
 * - website: null
 * - npmjs: null
 * - github: null
 *
 */
export const CLIInfo: CLIInfoSpecification = {
  description: null,
  github: null,
  name: null,
  npmjs: null,
  usage: null,
  version: null,
  website: null
};

export function set_cli_info_specification( specification: CLIInfoSpecification ): void {

  if( specification === undefined ) {
    throw( 'unnecessary call to this function' );
  }

  if ( specification.name ) {
    CLIInfo.name = specification.name;
  }

  if ( specification.description ) {
    CLIInfo.description = specification.description;
  }

  if ( specification.usage ) {
    CLIInfo.usage = specification.usage;
  }

  if ( specification.version ) {
    CLIInfo.version = specification.version;
  }

  if ( specification.website ) {
    CLIInfo.website = specification.website;
  }

  if ( specification.npmjs ) {
    CLIInfo.npmjs = specification.npmjs;
  }

  if ( specification.github ) {
    CLIInfo.github = specification.github;
  }
}
