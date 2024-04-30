import type { FlagArgvOptions, FlagSpecificationType } from '../../specs.js';

export function depends_on( specs_flag: FlagSpecificationType, parsed_argv_flag: Map<string, FlagArgvOptions>, flag_key: string ){

  if( ! specs_flag.get( 'depends_on' ) ){

    return;
  }

  // check for the parsed_as value for conflict
  const depends_on = specs_flag.get( 'depends_on' );
  let dependency_satisfied = true;
  let flag_dependency: string;

  if( typeof depends_on === 'string' ){

    dependency_satisfied = parsed_argv_flag.has( depends_on );
    flag_dependency = depends_on;
  }

  if( Array.isArray( depends_on ) ){

    for( const dependency of depends_on ){
      if ( ! parsed_argv_flag.has( dependency ) ) {
        dependency_satisfied = false;
        flag_dependency = dependency;
        break;
      }
    }
  }

  if( ! dependency_satisfied ){

    throw ( `${ flag_key } depends on ${ flag_dependency }` );
  }
}
