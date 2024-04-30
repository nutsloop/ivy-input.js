import { CallBackFlag, CallBackFlagArgvData } from '../../../lib/cli/specs.js';

type default_ignores = [
  'node_modules',
  'package-lock.json',
  'lib',
  'bin',
  'types',
  '*.js'
];

const default_ignores: default_ignores = [
  'node_modules',
  'package-lock.json',
  'lib',
  'bin',
  'types',
  '*.js'
];

function unique( data: string[], default_ignores: default_ignores ): string[]{

  return [ ...new Set( [ ...data, ...default_ignores ] ) ];
}

export const git_cb: CallBackFlag = ( data: CallBackFlagArgvData<null|string[]> ): boolean|string[] => {

  if( data === null ) {

    return true;
  }

  if( data.includes( 'default' ) ){

    data.splice( data.indexOf( 'default' ), 1 );

    return unique( data, default_ignores );
  }

  if( data.includes( 'no-default' ) ){

    data.splice( data.indexOf( 'no-default' ), 1 );

    return data;
  }

  return unique( data, default_ignores );
};
