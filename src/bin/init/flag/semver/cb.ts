import semver from 'semver/preload.js';

import type { CallBackFlag } from '../../../../lib/cli/specs.js';

export const semver_description = 'initialise a new CLI project with the given semver.';
export const semver_usage = 'input init --semver=<semver>';

export const semver_cb: CallBackFlag<string> = ( data: string ): string => {

  if( semver.valid( data ) === null ){

    process.stderr.write( `invalid project semver version. given:\n  ${ data }\n`.red() );
    process.exit( 1 );
  }

  return data;
};
