import worker_threads from 'worker_threads';

import type { FlagThreadSpecification } from '../flag.js';

import { CLIThreadEventEmitter, type ICLIThreadEmitter } from '../../event/emitter.js';
import { type ParsedAsARGV, type cbOptions, thread_count } from '../processor/flag.js';
import { cb } from '../processor/flag/cb.js';

const thread_queue: cbOptions[] = [];

export async function spawn_worker( parsedAsARGV: ParsedAsARGV, ident_entry: cbOptions ): Promise<ICLIThreadEmitter>{

  thread_count.pop();
  thread_queue.push( ident_entry );

  if( thread_count.length === 0 ){

    for ( const thread of thread_queue ) {

      if( typeof thread.get( 'thread' ) === 'object' ){

        const worker = new worker_threads.Worker(
          new URL( './worker.js', import.meta.url ),
          {
            workerData: thread.get( 'option' ),
          }
        );

        worker.on( 'error', ( error ) => {
          CLIThreadEventEmitter.emit( 'thread-error', error );
        } );

        worker.on( 'exit', () => {} );

        worker.on( 'message', async ( { data, thread_id } ) => {

          thread.set( 'option', { data : data, thread_id: thread_id } );
          thread.set( 'thread', false );
          await cb( parsedAsARGV, thread );
          thread_queue.shift();
          if( thread_queue.length === 0 ){
            CLIThreadEventEmitter.emit( 'thread-queue-empty' );
          }
        } );

        const thread_parameters: FlagThreadSpecification = thread.get( 'thread' );
        worker.postMessage( thread_parameters );
      }
    }
  }

  return CLIThreadEventEmitter;
}
