import type { CallBackTypeFlag, FlagArgvOptions, FlagSpecification } from '../../specs.js';

import { has_thread } from './exec_precedence.js';

export function is_thread( flag_specification: FlagSpecification, parsed_argv_flag: Map<string, FlagArgvOptions> ): 0[] {

  const counter: 0[] = [];
  const alias_counter = [];
  for ( const [ flag_key, _flag_entry ] of flag_specification.entries() ) {

    const specs_cb = flag_specification.get( flag_key ).get( 'cb' ) as CallBackTypeFlag;
    const specs_flag = flag_specification.get( flag_key );
    const alias = specs_flag.get( 'alias' );
    const thread = specs_cb.thread;

    if( ! alias_counter.includes( alias ) && typeof thread !== 'boolean' && parsed_argv_flag.has( flag_key ) ) {

      alias_counter.push( alias, thread );
    }
  }

  for ( let i = 0; i < alias_counter.length; i += 2 ) {

    if( typeof alias_counter[ i + 1 ] === 'object' ) {

      counter.push( 0 );
    }
  }

  if( counter.length > 0 ) {

    let x = 0;
    for ( const _set of counter ) {
      has_thread.add( x ++ );
    }
  }

  return counter;
}
