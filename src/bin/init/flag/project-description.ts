import type { CallBackFlag, CallBackFlagArgvData } from '../../../lib/cli/specs.js';

export const project_description_cb: CallBackFlag = ( data: CallBackFlagArgvData<string> ): void => {

  if( data.length > 214 ){

    process.stderr.write( `invalid project description length max is 214. given:\n  ${ data.length }\n`.red() );
    process.exit( 1 );
  }
};
