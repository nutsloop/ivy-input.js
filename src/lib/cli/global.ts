import type { ReservedType } from './constant/reserved.js';
import type { OptionType } from './specs.js';
import type { CallBackTypeGlobal, GlobalFlagSpecificationType } from './specs.js';

import { is_alpha_identifier } from '../util/is_alpha_identifier.js';
import { Reserved } from './constant/reserved.js';
import { CLISpecification } from './specs.js';

type GlobalFlagSpecification = {
  cb?: CallBackTypeGlobal;
  description?: string;
  has_conflict?: string | string[];
  multi_type?: OptionType[];
  only_for?: string | string[];
  type?: OptionType;
  usage?: string;
  void?: boolean;
}

const cbTypeSet = new Set( [ 'async', 'promise', 'sync' ] );

export async function global( identifier: string, specification: GlobalFlagSpecification ){

  is_alpha_identifier( identifier, 'global' );
  if ( Reserved.has( identifier as ReservedType ) ){

    throw( `${ identifier } is a reserved word` );
  }

  const global_flag_data: GlobalFlagSpecificationType = new Map();

  global_flag_data.set( 'description', specification.description || 'no description' );
  global_flag_data.set( 'usage', specification.usage || 'no usage' );

  const cb = specification.cb || false;
  if( typeof cb !== 'boolean' ) {

    if( ! cb.type || ! cb.fn ){
      throw( `'cb' must have a 'type' and 'fn' -> ${identifier}` );
    }

    // if the flag has a callback, it is checked if the callback is a function.
    if( typeof cb.fn !== 'function' ){
      throw( `'cb' must be a function -> ${identifier}` );
    }

    // if the flag has a callback, the type of callback will be set.
    if( ! cbTypeSet.has( cb.type ) ){
      throw( `cb 'type' must be one of ${[ ...cbTypeSet ].join( ', ' )} -> ${identifier}` );
    }
    global_flag_data.set( 'cb', cb );

    if( specification.cb.rest ){
      global_flag_data.get( 'cb' ).rest = specification.cb.rest;
    }

    if( specification.cb.this ){

      if( cb.fn.name === 'cb' ) {

        // match the word function or async function followed. determine if the cb is anonymous or not.
        const match = cb.fn.toString().match( /async function\s|function\s/g );
        if ( match === null ) {

          throw( `cb of global-flag -> ${ identifier.red().strong() } cannot be ${ 'anonymous'.underline() } OR ${ 'anonymous arrow function'.underline() }, because to access the data passed to it,\nit will be required to call ${ 'this'.magenta() } within the cb.\ngive it a name ⬇ \n\nfunction my_special_cb(){\n  console.log(this)//to access the data\n}\n` );
        }
      }

      global_flag_data.get( 'cb' ).this = specification.cb.this;
    }
  }

  if( specification?.void ){

    if( specification?.type ){

      throw( `void global flag cannot have a type -> ${identifier}` );
    }

    if( specification?.multi_type ){

      throw( `void global flag cannot have a multi_type -> ${identifier}` );
    }
  }

  if( specification?.type && specification?.multi_type ){

    throw( `global flag cannot have both a type and multi_type -> ${identifier}` );
  }

  if( specification?.has_conflict ){
    global_flag_data.set( 'has_conflict', specification.has_conflict );
  }

  global_flag_data.set( 'void', specification?.void || ! ( specification?.type || specification?.multi_type ) );

  if( specification?.type ){
    global_flag_data.set( 'type', specification.type );
  }

  if( specification?.multi_type ){
    global_flag_data.set( 'multi_type', specification.multi_type );
  }

  if( specification?.only_for ){
    global_flag_data.set( 'only_for', specification.only_for );
  }

  if( ! CLISpecification.has( 'global' ) ){

    CLISpecification.set( 'global', new Map() );
  }
  CLISpecification.get( 'global' )?.set( identifier, global_flag_data );
}
