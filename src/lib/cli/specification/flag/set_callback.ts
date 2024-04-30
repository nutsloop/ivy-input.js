import type { FlagThreadSpecification } from '../../flag.js';
import type { CallBackType, CallBackTypeFlag, FlagSpecificationType } from '../../specs.js';

export function set_callback( flag_data: FlagSpecificationType, callback_option: CallBackTypeFlag | false, flag: string ) {

  flag_data.set( 'cb', callback_option || false );
  if( ! callback_option ) {
    flag_data.set( 'cb', false );

    return;
  }

  const { fn, rest, this: this_arg, thread, type } = callback_option;
  if( ! type ){
    throw new Error( `type must be defined for flag ${ flag }` );
  }
  if( ! [ 'async', 'promise', 'sync' ].includes( type ) ){
    throw new Error( `type must be async, sync, or promise for flag ${ flag }` );
  }
  if( ! fn ){
    throw new Error( `no callback function specified for flag ${ flag }` );
  }
  if( thread && ! fn ){
    throw new Error( `thread specified but no callback function provided for flag ${ flag }. call function must be provided` );
  }

  set_thread( flag_data, thread );
  set_fn( flag_data, fn, type, flag );
  set_this( flag_data, this_arg, flag );
  set_rest( flag_data, rest, flag );
}

function set_thread( flag_data: FlagSpecificationType, thread: FlagThreadSpecification ) {

  const thread_specs = thread || false;
  const cb = flag_data.get( 'cb' ) as CallBackTypeFlag;

  if( typeof thread_specs !== 'boolean' && typeof thread_specs === 'object' ){

    if( ! thread_specs.thread_cb_name || ! thread_specs.thread_cb_path ){
      throw( `thread_cb_name and thread_cb_path must be defined together` );
    }

    cb.thread = {
      thread_cb_name: thread_specs.thread_cb_name,
      thread_cb_path: thread_specs.thread_cb_path
    };
  }
  else{

    cb.thread = false;
  }
}

function set_fn( flag_data: FlagSpecificationType, fn: CallBackTypeFlag['fn'], type: CallBackType, flag: string ) {

  const cb = flag_data.get( 'cb' ) as CallBackTypeFlag;
  // if the flag has a callback, it is checked if the callback is a function.
  if( typeof fn !== 'function' ){
    throw( `cb must be a function -> ${flag}` );
  }
  else{
    cb.fn = fn;
    // if the flag has a callback, it is checked if the callback is a AsyncFunction, Function or Promise.
    // Promise and AsyncFunction are treated as async, Function is treated as sync.
    if( type === 'async' ){

      cb.type = 'async';
    }
    else if( type === 'sync' ){

      cb.type = 'sync';
    }
    else if( type === 'promise' ){

      cb.type = 'promise';
    }
  }
}

function set_this( flag_data: FlagSpecificationType, this_arg: CallBackTypeFlag['this'], flag: string ) {

  if( this_arg ){

    const cb = flag_data.get( 'cb' ) as CallBackTypeFlag;
    if( cb.fn.name === 'cb' ) {

      // match the word function or async function followed. determine if the cb is anonymous or not.
      const match = cb.fn.toString().match( /async function\s|function\s/g );
      if ( match === null ) {
        throw( `cb of flag -> ${ flag.red().strong() } cannot be ${ 'anonymous'.underline() } OR ${ 'anonymous arrow function'.underline() }, because to access the data passed to it,\nit will be required to call ${ 'this'.magenta() } within the cb.\ngive it a name ⬇ \n\nfunction my_special_cb(){\n  console.log(this)//to access the data\n}\n` );
      }
    }
    cb.this = this_arg;
  }
}

function set_rest( flag_data: FlagSpecificationType, rest: CallBackTypeFlag['rest'], flag: string ) {

  if( ! rest ){
    return;
  }

  if( ! Array.isArray( rest ) || rest.length === 0 ){
    throw new Error( `rest cannot be an empty array and must be array -> ${ flag }` );
  }

  if( rest ){

    const cb = flag_data.get( 'cb' ) as CallBackTypeFlag;
    cb.rest = rest;
  }
}
