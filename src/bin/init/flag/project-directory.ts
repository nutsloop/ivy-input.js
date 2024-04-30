import type { CallBackFlag, CallBackFlagArgvData } from '../../../lib/cli/specs.js';

export const project_directory_cb: CallBackFlag = ( data: CallBackFlagArgvData<string> ): string => {

  return data.endsWith( '/' ) ? data : `${data}/`;
};
