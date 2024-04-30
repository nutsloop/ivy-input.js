import type { ParsedArgv } from '../../../parser.js';

import { CLISpecification } from '../../specs.js';

export function remove_global_entries( parsed_argv: ParsedArgv ): void{
  parsed_argv.delete( 'global' );
  CLISpecification.delete( 'global' );
}
