import semver from 'semver/preload.js';

import type { CallBackFlag, CallBackFlagArgvData } from '../../../lib/cli/specs.js';

export const project_version_cb: CallBackFlag = ( data: CallBackFlagArgvData<string> ): string => {

  if( semver.valid( data ) === null ){

    process.stderr.write( `invalid project semver version. given:\n  ${ data }\n`.red() );
    process.exit( 1 );
  }

  return data;
};
