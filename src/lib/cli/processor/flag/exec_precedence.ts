import type { ParsedAsARGV } from '../flag.js';

import { get_precedence } from '../../precedence.js';
import { cb } from './cb.js';

export const has_thread = new Set<number>();

export async function exec_precedence( parsedAsARGV : ParsedAsARGV ){
  for ( const [ _order, ident ] of get_precedence().entries() ) {
    for ( const [ _ident_key, ident_entry ] of ident.entries() ) {
      await cb( parsedAsARGV, ident_entry );
    }
  }
}
