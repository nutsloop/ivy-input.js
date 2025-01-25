import type { FlagArgvOptions, FlagSpecificationType } from '../../specs.js';

export function depends_on( specs_flag: FlagSpecificationType, parsed_argv_flag: Map<string, FlagArgvOptions>, flag_key: string ){

  if( ! specs_flag.get( 'depends_on' ) ){

    return;
  }

  // check for the parsed_as value for conflict
  const depends_on = specs_flag.get( 'depends_on' );
  let dependency_satisfied = true;
  let flag_dependency: string = Array.isArray( depends_on ) ? depends_on.join( ', ' ) : depends_on;

  if( typeof depends_on === 'string' ){

    let or_dependency: string[]|undefined = undefined;
    if ( depends_on.includes( '|' ) ){
      or_dependency = depends_on.split( '|' );
    }

    if ( or_dependency !== undefined ){
      for ( const dependency of or_dependency ) {
        if ( ! parsed_argv_flag.has( dependency ) ) {
          dependency_satisfied = false;
          break;
        }
      }
    }
    else {
      dependency_satisfied = parsed_argv_flag.has( depends_on );
      flag_dependency = depends_on;
    }
  }

  if( Array.isArray( depends_on ) ){

    for( const dependency of depends_on ){

      let or_dependency: string[]|undefined = undefined;
      if ( dependency.includes( '|' ) ){
        or_dependency = dependency.split( '|' );
      }
      if ( or_dependency !== undefined ){
        for ( const or_dependency_flag of or_dependency ) {
          if ( ! parsed_argv_flag.has( or_dependency_flag ) ) {
            dependency_satisfied = false;
            break;
          }
        }
      }
      else {
        if ( ! parsed_argv_flag.has( dependency ) ) {
          dependency_satisfied = false;
          break;
        }
      }
    }
  }

  if( ! dependency_satisfied ){

    throw ( `${ flag_key } depends on ${ flag_dependency }` );
  }
}
