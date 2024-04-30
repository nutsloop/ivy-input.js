import { EventEmitter } from 'events';

// todo - process events.
type CLIThreadEventListener = {
  'cb-flag-all-executed': ( thread_count: 0[] ) => Promise<void> | void;
  'data': ( thread: { data: unknown, thread_id: number } ) => Promise<void> | void;
  'thread-error': ( error: Error ) => Promise<void> | void;
  'thread-executed': ( thread: { data: unknown, thread_id: number } ) => Promise<void> | void;
  'thread-queue-empty': () => Promise<void> | void;
};

type CLIThreadEventType = Record<string | symbol, ( data: unknown|unknown[] ) => Promise<void> | void>;

export interface ICLIThreadEmitter<T extends CLIThreadEventType = CLIThreadEventListener> extends EventEmitter{
  emit<eventName extends keyof T>( event: eventName, ...args: Parameters<T[eventName]> ): boolean;
  on<eventName extends keyof T>( eventName: eventName, listener: T[eventName] ): this;
}

export const CLIThreadEventEmitter: ICLIThreadEmitter = new EventEmitter();
