import { extends_proto } from '@ivy-industries/ansi';
import worker_threads from 'worker_threads';

import { thread_getter } from './getter.js';
extends_proto();
worker_threads.parentPort.on( 'message', async ( { thread_cb_name, thread_cb_path } ) => {

  const cb = await thread_getter( thread_cb_name, thread_cb_path ).catch( ( error ) => {
    throw ( `callback of flag '${ thread_cb_name }' thrown an error -> ${ error.message || error }. thread id{${worker_threads.threadId}}\n`.red() );
  } );

  try{
    if( cb.constructor.name === 'Function' ){
      const data = cb( worker_threads.workerData );
      if( data instanceof Promise ){
        const data_promise = await data.catch( ( error ) => {
          throw ( `callback of flag '${ thread_cb_name }' thrown an error -> ${ error.message || error }. thread id{${worker_threads.threadId}}\n`.red() );
        } );
        worker_threads.parentPort.postMessage( { data: data_promise, thread_id : worker_threads.threadId } );
        process.exit( 0 );
      }
      else{
        worker_threads.parentPort.postMessage( { data: data, thread_id : worker_threads.threadId } );
        process.exit( 0 );
      }
    }
    else if( cb.constructor.name === 'AsyncFunction' ){
      const data = await cb( worker_threads.workerData ).catch( ( error: Error ) => {
        throw ( `callback of flag '${ thread_cb_name }' thrown an error -> ${ error.message || error }. thread id{${worker_threads.threadId}}\n`.red() );
      } );
      worker_threads.parentPort.postMessage( { data: data, thread_id : worker_threads.threadId } );
      process.exit( 0 );
    }
  }
  catch ( error ) {
    throw ( `callback of flag '${ thread_cb_name }' thrown an error -> ${ error.message || error }. thread id{${worker_threads.threadId}}\n`.red() );
  }
} );
