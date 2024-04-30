import type { CallBackFlag, CallBackFlagAsync, CallBackFlagPromise, CallBackGlobalFlag, CallBackGlobalFlagAsync, CallBackGlobalFlagPromise, FlagArgvOptions, GlobalFlagSpecificationType } from '../../specs.js';

import { spawn_worker } from '../../thread/main.js';
import { type ParsedAsARGV, cbOptions } from '../flag.js';

export async function cb( parsedAsARGV: ParsedAsARGV, ident_entry: cbOptions ): Promise<void>{

  // todo change as per global async/sync/promise cb and cb is an object of { fn, type, this, rest, thread }
  const cb_returns = new Set( [ undefined ] );
  const flag = ident_entry.get( 'flag' );
  const alias = ident_entry.get( 'alias' );
  const thread = ident_entry.get( 'thread' );

  if( typeof thread === 'object' ){
    await exec_thread_cb( parsedAsARGV, ident_entry )
      .catch( ( error ) => {
        throw error;
      } );
  }
  else {

    await exec_async_cb( cb_returns, {
      data: ident_entry.get( 'data' ),
      flag,
      fn: ident_entry.get( 'cb' ),
      option: ident_entry.get( 'option' ),
      rest: ident_entry.get( 'rest' ),
      type: ident_entry.get( 'type' )
    } );

    await exec_promise_cb( cb_returns, {
      data: ident_entry.get( 'data' ),
      flag,
      fn: ident_entry.get( 'cb' ),
      option: ident_entry.get( 'option' ),
      rest: ident_entry.get( 'rest' ),
      type: ident_entry.get( 'type' )
    } );

    exec_sync_cb( cb_returns, {
      data: ident_entry.get( 'data' ),
      flag,
      fn: ident_entry.get( 'cb' ),
      option: ident_entry.get( 'option' ),
      rest: ident_entry.get( 'rest' ),
      type: ident_entry.get( 'type' )
    } );

    // if the flag cb returns something, it is stored in the parsedAsARGV Map and it will overwrite the flag value.
    if( ! cb_returns.has( undefined ) ){

      parsedAsARGV.set( flag, new Map( [ [ alias, cb_returns.values().next().value ] ] ) );
    }
  }
}

async function exec_thread_cb( parsedAsARGV: ParsedAsARGV, ident_entry: cbOptions ): Promise<void>{

  await spawn_worker( parsedAsARGV, ident_entry ).catch( ( error ) => {
    throw error;
  } );
}

async function exec_async_cb( cb_returns: Set<undefined|unknown>, { data, flag, fn, option, rest, type } ): Promise<void>{

  if( type !== 'async' ){
    return;
  }

  const bind_cb: CallBackFlagAsync = fn.bind( data );
  cb_returns.add( await bind_cb( option, ...rest )
    .catch( ( error: Error ) => {
      throw( `callback of flag '${ flag }' thrown an error -> ${ error.message || error }` );
    } ) );
  if( cb_returns.size > 1 ){

    cb_returns.delete( undefined );
  }
}

async function exec_promise_cb( cb_returns: Set<undefined|unknown>, { data, flag, fn, option, rest, type } ): Promise<void>{

  if( type !== 'promise' ){
    return;
  }

  const bind_cb: CallBackFlagPromise = fn.bind( data );
  cb_returns.add( await bind_cb( option, ...rest )
    .catch( ( error: Error ) => {
      throw( `callback of flag '${ flag }' thrown an error -> ${ error.message || error }` );
    } ) );
  if( cb_returns.size > 1 ){

    cb_returns.delete( undefined );
  }
}

function exec_sync_cb( cb_returns: Set<undefined|unknown>, { data, flag, fn, option, rest, type } ): void{

  if( type !== 'sync' ){
    return;
  }

  try{

    const bind_cb: CallBackFlag = fn.bind( data );
    cb_returns.add( bind_cb( option, ...rest ) );
    if( cb_returns.size > 1 ){

      cb_returns.delete( undefined );
    }
  }
  catch ( error ) {

    throw( `callback of flag '${ flag }' thrown an error -> ${ error.message || error }` );
  }
}

export async function global_cb( option: FlagArgvOptions, flag_key: string, specs_global_flag: GlobalFlagSpecificationType ): Promise<void>{

  if( specs_global_flag.get( 'cb' ) === undefined ){
    return;
  }

  // cb section
  const { fn, rest, this: _this, type } = specs_global_flag.get( 'cb' );

  // the flag cb is passed ONLY the flag value, flag data, and the rest_args if any.
  if( type === 'async' ){

    const bind_cb: CallBackGlobalFlagAsync = fn.bind( _this );
    await bind_cb( option, ...rest || [] )
      .catch( ( error ) => {
        throw( `callback of global flag '${ flag_key }' thrown an error -> ${ error.message || error }` );
      } );
  }
  else if( type === 'sync' ){

    try{

      const bind_cb: CallBackGlobalFlag = fn.bind( _this );
      bind_cb( option, ...rest || [] );
    }
    catch ( error ) {

      throw( `callback of global flag '${ flag_key }' thrown an error -> ${ error.message || error }` );
    }
  }
  else if( type === 'promise' ){

    const bind_cb: CallBackGlobalFlagPromise = fn.bind( _this );
    const promise = bind_cb( option, ...rest || [] );
    await promise
      .catch( ( error ) => {
        throw( `callback of global flag '${ flag_key }' thrown an error -> ${ error.message || error }` );
      } );
  }
}
