import type { FlagArgvOptions, FlagSpecification } from '../../specs.js';

import { CommandHasNoFlags } from '../command.js';

export function has_no_flag( parsed_argv_flag:Map<string, FlagArgvOptions>, specs_command_flag: FlagSpecification, identifier: string ): void{

  if ( parsed_argv_flag && parsed_argv_flag.size > 0 ) {

    if( ! specs_command_flag ){

      throw new CommandHasNoFlags( `command '${ identifier }' does not have flags` );
    }
  }
}
