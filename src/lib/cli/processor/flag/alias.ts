import type { FlagArgvOptions, FlagSpecificationType } from '../../specs.js';
import type { ParsedAsARGV } from '../flag.js';

type AliasOptions = {
  flag_entry: FlagArgvOptions;
  flag_entry_is_now_array: string[];
  flag_key: string;
  parsedAsARGV: ParsedAsARGV;
};

export function alias( specs_flag: FlagSpecificationType, { flag_entry, flag_entry_is_now_array, flag_key, parsedAsARGV }: AliasOptions ): string {

  const alias = specs_flag.get( 'alias' );
  if( alias !== flag_key ) {

    parsedAsARGV.set( flag_key, new Map( [ [ alias, flag_entry_is_now_array || flag_entry ] ] ) );
  }

  return alias;
}
