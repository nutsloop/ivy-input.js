import type { CallBackFlag } from '../../../../lib/cli/specs.js';

export const description_description = 'initialise a new CLI project with the given description. max length is 214 characters.';
export const description_usage = 'input init --description=<description>';

export const description_cb: CallBackFlag<string> = ( data: string ): void => {

  if( data.length > 214 ){

    process.stderr.write( `invalid project description length max is 214. given:\n  ${ data.length }\n`.red() );
    process.exit( 1 );
  }
};
