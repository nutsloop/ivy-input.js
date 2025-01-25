import type { ParsedArgv } from '../../../parser.js';
import type { CommandSpecificationType, FlagArgvOptions, FlagSpecification } from '../../specs.js';

import { CommandRequiresFlag } from '../command.js';

export function has_require_flag( selected_command: CommandSpecificationType, identifier: string, parsed_argv: ParsedArgv, parsed_argv_flag: Map<string, FlagArgvOptions>, specs_command_flag: FlagSpecification ){

  // ONLY use the alias of the flag instead of the flag itself.
  if ( selected_command.has( 'required_flag' ) ) {

    const required_flag = selected_command.get( 'required_flag' );
    const match_alias: Map<string, string[]> = new Map();

    for ( const flag of required_flag ) {
      const alias_flags = Array.from( specs_command_flag.entries() )
        .filter( ( [ _alias_flag, details ] ) => details.get( 'alias' ) === flag )
        .map( ( [ alias_flag ] ) => alias_flag );

      match_alias.set( flag, alias_flags );
    }

    for ( const [ alias, flag_identifier_list ] of match_alias.entries() ) {
      if ( ! parsed_argv_flag ) {
        throw new CommandRequiresFlag( `command '${identifier}' requires flags '${flag_identifier_list.join( ', ' )}'` );
      }

      if ( ! parsed_argv_flag.has( alias ) && ! flag_identifier_list.some( alias_flag => parsed_argv_flag.has( alias_flag ) ) ) {
        throw new CommandRequiresFlag( `command '${identifier}' requires flag '${flag_identifier_list.join( ', ' )}'` );
      }
    }
  }
}
