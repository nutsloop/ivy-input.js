import { extends_proto } from '@ivy-industries/ansi';

import type { ParsedArgv } from '../parser.js';
import type { OptionType } from './specs.js';
import type { CommandSpecification, FlagSpecification } from './specs.js';

import { CLI } from '../run.js';
import { description } from './specification/description.js';
import { version } from './specification/version.js';
import { CLIInfo, get_specification } from './specs.js';

extends_proto();

/**
 * todo: help system
 *
 * todo: check if the command has required flags.
 *       if it does, mark the required flag entry in a different color.
 */
/**
 * todo: global flag specific for the command.
 *       if the command has a global flag, mark the global flag entry in a different color and specify an 'only-for' property.
 */

export async function help( parsed_argv: ParsedArgv ): Promise<void> {

  let exit_code = 0;
  let manual_entry = '';

  if( ! parsed_argv.has( 'flag' ) ){

    exit_code = 1;
    manual_entry = no_flag_given();
  }
  else if( parsed_argv.has( 'flag' ) ){

    manual_entry += flag_given( parsed_argv );
  }

  manual_entry += help_manual_entry();
  manual_entry += version_manual_entry();

  process.stdout.write( await header() );
  process.stdout.write( manual_entry );
  process.stdout.write( await footer() );
  process.exit( exit_code );
}

async function header(): Promise<string> {

  const name = CLIInfo.name || CLI.get( 'process.title' );
  const version_ = CLIInfo.version || await version( true ) || '0.0.0';
  const description_ = CLIInfo.description || await description() || 'no description provided.';
  const usage = CLIInfo.usage || 'no usage provided.';
  const header1 = `   MANUAL for CLI ${name} @${version_}`.underline().strong();

  return `
${header1}
   ${description_}

   ${'-'.red().repeat( 80 )}
${'   synopsis:'.underline().strong()}

   ${usage}
   ${'-'.red().repeat( 80 )}
`;
}

async function footer(): Promise<string> {

  const npmjs = CLIInfo.npmjs || 'no npmjs link was provided.';
  const github = CLIInfo.github || 'no github link was provided.';
  const website = CLIInfo.website || 'no website link was provided.';

  return `
   ${'-'.red().repeat( 80 )}
${'   links:'.underline().strong()}
   website [${website}]
   github [${github}]
   npmjs [${npmjs}]

`;
}

function flag_given( parsed_argv: ParsedArgv ): string{

  const specs = get_specification();
  let manual_entry = '';
  for( const [ spec, spec_entry ] of specs.entries() ){

    let command_ref: string;
    for ( const [ flag, _flag_entry ] of parsed_argv.get( 'flag' ).entries() ) {

      if( spec === 'command' ){

        if( parsed_argv.get( 'flag' ).size === 2 ){

          if( command_ref ){
            if( spec_entry.has( command_ref ) ){

              if( specs.get( 'command' ).get( command_ref ).has( 'flag' ) ){

                if( specs.get( 'command' ).get( command_ref ).get( 'flag' ).has( flag ) ){

                  manual_entry += `${'   INSTRUCTION for command'.strong().underline()} [${command_ref}] [${flag}]\n\n`;
                  manual_entry += `      description: ${specs.get( 'command' ).get( command_ref ).get( 'flag' ).get( flag ).get( 'description' )}\n`;
                  manual_entry += `      usage: ${ specs.get( 'command' ).get( command_ref ).get( 'flag' ).get( flag ).get( 'usage' ) }\n`;
                  command_ref = undefined;
                  break;
                }
              }
            }
          }
          else {
            command_ref = flag;
            continue;
          }
        }
        if( spec_entry.has( flag ) ){

          manual_entry += `${'   INSTRUCTION for command'.strong().underline()} [${flag}]\n\n`;
          manual_entry += `      description: ${specs.get( 'command' ).get( flag ).get( 'description' )}\n`;
          manual_entry += `      usage: ${ specs.get( 'command' ).get( flag ).get( 'usage' ) }\n`;
          break;
        }
      }
      else if( spec === 'global' ){

        if( spec_entry.has( flag ) ){

          manual_entry += `${'   INSTRUCTION for global flag'.strong().underline()} [${flag}]\n\n`;
          manual_entry += `      description: ${specs.get( 'global' ).get( flag ).get( 'description' )}\n`;
          manual_entry += `      usage: ${ specs.get( 'global' ).get( flag ).get( 'usage' ) }\n`;
          break;
        }
      }
    }
  }

  return manual_entry;
}

function no_flag_given(): string{

  let manual_entry = '';

  const commands = get_specification().get( 'command' );
  const specs = get_specification();

  if( specs.has( 'global' ) ){

    manual_entry += global_manual_entry();
  }

  manual_entry += commands_manual_entry( commands );

  return manual_entry;
}

type Alias = Map<string, string[]>;
type IsolatedAlias = Map<'alias'|'parsed_as', Alias>;
function isolate_alias( flag_specs: FlagSpecification ): Alias{

  const count: IsolatedAlias = new Map( [ [ 'alias', new Map() ] ] );

  for ( const [ flag, flag_entry ] of flag_specs ) {

    const alias = flag_entry.get( 'alias' );
    if( count.get( 'alias' ).has( alias ) ){
      count.get( 'alias' ).get( flag_entry.get( 'alias' ) ).push( flag );
    }
    else{
      count.get( 'alias' ).set( flag_entry.get( 'alias' ), [] );
      count.get( 'alias' ).get( flag_entry.get( 'alias' ) ).push( flag );
    }
  }

  return count.get( 'alias' );
}

function help_manual_entry(): string{

  return `
   ${'-'.red().repeat( 80 )}
${'   INSTRUCTION for command [help|-h|--help]'.strong().underline()}

      description: retrieve the manual entry for a command, global flags and flags.
      usage: help [global] | [command] <[flag]>

      ● if command, flag or global are omitted, the whole manual will be shown.
      ● if command is selected and flag is omitted, the manual for the command will be shown.
      ● if command and flag are selected, the manual for the flag will be shown.
      ● if global is selected, the manual for the global flags will be shown.
`;
}

function version_manual_entry(): string{

  return `
   ${'-'.red().repeat( 80 )}
${'   INSTRUCTION for command [version|-v|--version]'.strong().underline()}

      description: retrieve the version of the CLI.
      usage: version|-v|--version

${'   this command has no flags.'.strong().underline().red()}
`;
}

function commands_manual_entry( commands: CommandSpecification ): string{

  let manual_entry = '';
  for( const [ command, command_entry ] of commands ) {

    const command_header = `   INSTRUCTION for command [${command}]`.underline().strong();
    manual_entry += `${ command_header }\n\n`;
    manual_entry += `      description: ${ command_entry.get( 'description' ) }\n\n`;
    manual_entry += `      usage: ${ command_entry.get( 'usage' ) }\n`;

    if( commands.get( command ).has( 'flag' ) ){

      manual_entry += flags_manual_entry( commands, command );
    }
    else{

      manual_entry += `\n   this command has no flags.\n\n`.strong().underline().red();
    }
  }

  return manual_entry;
}

function flags_manual_entry( commands: CommandSpecification, command: string ): string{

  let manual_entry = '';
  const flags = commands.get( command ).get( 'flag' );
  const flags_header = `\n   flags for command [${command}]`.underline().strong();

  manual_entry += `   ${ flags_header }\n\n`;

  const alias_list = isolate_alias( flags );
  let skip = '!@#$%^&*()'; // this is a hack to skip the first alias in the alias list.
  for( const [ flag, flag_entry ] of flags ) {

    if( skip !== flag ){

      const alias = alias_list.get( flag_entry.get( 'alias' ) );
      const flag_type: OptionType = flag_entry.get( 'type' );
      const flag_multi_type: OptionType[] = flag_entry.get( 'multi_type' );

      let type = '';

      if( flag_type ){

        type += `${ process_flag_type( flag_type, flag_entry.get( 'void' ) ) }`;
      }
      else if( flag_multi_type ){

        type += `${ flag_multi_type.map( type => process_flag_type( type, flag_entry.get( 'void' ) ) ).join( '|' ) }`;
      }
      else{

        type = 'void'.white();
      }


      const flag_header = `      flag [${alias.join( '|' )}[=${type}]]`.underline().strong();

      manual_entry += `      ${ flag_header }\n\n`;
      manual_entry += `         description: ${ flag_entry.get( 'description' ) }\n`;
      manual_entry += `         usage: ${ flag_entry.get( 'usage' ) }\n\n`;

      if( alias.length === 2 ){

        skip = alias[ 1 ];
      }
    }
  }

  manual_entry += `\n   ${'-'.red().repeat( 80 )}\n\n`;

  return manual_entry;
}

function global_manual_entry(): string{

  let manual_entry = '';
  const global_flags = get_specification().get( 'global' ).entries();
  const global_flags_header = `\n   global flags`.underline().strong();
  manual_entry += `   ${ global_flags_header }

    ● global flags are flags that can be used with any command.
    ● global flags must be given before the command always, no exceptions.

`;
  for( const [ flag, flag_entry ] of global_flags ) {

    const flag_header = `      flag [${flag}]`.underline().strong();
    manual_entry += `      ${ flag_header }\n\n`;
    manual_entry += `         description: ${ flag_entry.get( 'description' ) }\n`;
    manual_entry += `         usage: ${ flag_entry.get( 'usage' ) }\n\n`;
  }

  manual_entry += `\n   ${'-'.red().repeat( 80 )}\n\n`;

  return manual_entry;
}

function process_flag_type( type: OptionType, flag_is_void?: boolean ): 'any'|'void'|OptionType{

  if( flag_is_void ){
    return 'void'.white() as 'void';
  }

  switch ( type ) {

    case 'string':
      return 'string'.magenta() as 'string';

    case 'number':
      return 'number'.yellow() as 'number';

    case 'boolean':
      return 'boolean'.blue() as 'boolean';

    case 'array':
      return 'array'.red() as 'array';

    case 'object':
      return 'object'.red() as 'object';

    case 'kvp':
      return 'kvp'.cyan() as 'kvp';

    case 'json':
      return 'json'.magenta() as 'json';

    case 'void':
      return 'void'.white() as 'void';

    default:
      return 'any'.white() as 'any';
  }
}
