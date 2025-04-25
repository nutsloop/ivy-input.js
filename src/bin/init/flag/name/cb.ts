import validate from 'validate-npm-package-name';

import type { CallBackFlag } from '../../../../lib/cli/specs.js';

export const name_description = 'initialise a new CLI project with the given name. max length is 214 characters.';
export const name_usage = 'input init --name=<name>';

export const name_cb: CallBackFlag<string> = ( data: string ): string => {

  if( data.length > 214 ){

    process.stderr.write( `invalid project name. max length -> ${ '214'.yellow() } <- ${ data.length.toFixed().red() }\n` );
    process.exit( 1 );
  }

  if( validate( data ).validForNewPackages === false ){

    process.stderr.write( `invalid project name. given:\n  ${ data }\n`.red() );
    process.exit( 1 );
  }

  return data;
};
