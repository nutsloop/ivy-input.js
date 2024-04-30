import { cb_options, type cbOptions } from './processor/flag.js';

type PrecedenceSpecification = Map<number, Map<string, cbOptions>>;

const PrecedenceQueue: PrecedenceSpecification = new Map();

export function get_precedence(): PrecedenceSpecification{

  return new Map( [ ...PrecedenceQueue.entries() ].sort() );
}

export function set_precedence(): void{

  const order = cb_options.get( 'precedence' );
  if( ! PrecedenceQueue.get( order ) ) {

    PrecedenceQueue.set( order, new Map() );
  }

  const ident = cb_options.get( 'flag' );
  const cb = cb_options.get( 'cb' );
  const flag_data = cb_options.get( 'option' );
  const data = cb_options.get( 'data' );
  const flag_rest = cb_options.get( 'rest' );
  const cb_type = cb_options.get( 'type' );
  const thread = cb_options.get( 'thread' );
  const alias = cb_options.get( 'alias' );

  PrecedenceQueue.get( order )?.set( ident, new Map() );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'option', flag_data );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'flag', ident );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'data', data );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'cb', cb );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'rest', flag_rest );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'type', cb_type );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'thread', thread );
  PrecedenceQueue.get( order )?.get( ident )?.set( 'alias', alias );
}

export function reset_precedence(): void{

  PrecedenceQueue.clear();
}
