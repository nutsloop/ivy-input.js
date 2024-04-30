import validate from 'validate-npm-package-name';

import type { CallBackFlag, CallBackFlagArgvData } from '../../../lib/cli/specs.js';

export const project_name_cb: CallBackFlag = ( data: CallBackFlagArgvData<string> ): string => {

  if( data.length > 214 ){

    process.stderr.write( `invalid project name length max is 214. given:\n  ${ data.length }\n`.red() );
    process.exit( 1 );
  }

  if( validate( data ).validForNewPackages === false ){

    process.stderr.write( `invalid project name. given:\n  ${ data }\n`.red() );
    process.exit( 1 );
  }

  return data;
};
