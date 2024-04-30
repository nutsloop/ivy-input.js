import type { FlagSpecificationType } from '../../specs.js';

export function not_found( specs_flag: FlagSpecificationType, key: string, flag_key: string ){

  if( ! specs_flag ){

    throw( `flag '${ flag_key }' not found in ${key}` );
  }
}

export function not_found_global( argv: string[], global_identifier_list: string[], index: number ){

  const equal_sign = argv[ index ].indexOf( '=' );
  const global_flag = equal_sign !== - 1
    ? argv[ index ].substring( 0, equal_sign )
    : argv[ index ];

  if( ! global_identifier_list.includes( global_flag ) ) {
    throw( `global flag '${ argv[ index ] }' not found` );
  }
}
