import { ParsedArgv } from '../../parser.js';
import { command } from './command.js';

export async function processor( command_ident: string, parsed_argv: ParsedArgv ): Promise<void>{

  await command( command_ident, parsed_argv );
}
