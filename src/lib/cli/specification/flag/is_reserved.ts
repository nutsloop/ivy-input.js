import { Reserved, type ReservedType } from '../../constant/reserved.js';

export function is_reserved( flag_identifier: string ): void {
  if( Reserved.has( flag_identifier as ReservedType ) ){
    throw( `trying to use reserved word -> ${ flag_identifier } to define a flag. reserved identifier names are:
  -> ${Array.from( Reserved.values() ) }` );
  }
}
