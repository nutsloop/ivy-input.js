import type { CallBackFlag } from '../../../../lib/cli/specs.js';

export const directory_description = 'initialise a new CLI project in the given directory. defaults to the current directory.';
export const directory_usage = 'input init --directory=<directory>';

export const directory_cb: CallBackFlag<string> = ( data: string ): string => {

  return data.endsWith( '/' ) ? data : `${data}/`;
};
