export { cli, run_without_command } from './lib/cli.js';
export { type CallBackWithoutCommand, CallBackWithoutCommandData } from './lib/cli.js';
export { command } from './lib/cli/command.js';
export { set_reserved } from './lib/cli/constant/reserved.js';
export { flag } from './lib/cli/flag.js';
export type{ FlagThreadSpecification } from './lib/cli/flag.js';
export { global } from './lib/cli/global.js';
export {
  get_specification,
  reset_specification,
  set_cli_info_specification
} from './lib/cli/specs.js';
export type {
  CallBack,
  CallBackArgvData,
  CallBackAsync,
  CallBackFlag,
  CallBackFlagArgvData,
  CallBackFlagAsync,
  CallBackFlagPromise,
  CallBackFlagReturn,
  CallBackGlobalFlag,
  CallBackGlobalFlagAsync,
  CallBackGlobalFlagPromise,
  CallBackPromise,
  CallBackRestArgs,
} from './lib/cli/specs.js';

export { thread_setter } from './lib/cli/thread/setter.js';
export { InputError } from './lib/error.js';
export { CLIThreadEventEmitter } from './lib/event/emitter.js';
export type { ParsedArgv } from './lib/parser.js';
export {
  get_global_declaration,
  has_global,
  reset_global_declaration,
  set_global_flag_declaration
} from './lib/parser/global.js';
export { CLI, run } from './lib/run.js';
export type { CLILogic } from './lib/run.js';
