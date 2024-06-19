import { readdir, rm } from 'node:fs/promises';

import { CallBackFlagAsync } from '../../../../lib/cli/specs.js';

export const bare_description = 'initialise a bare project. it will delete all the files and directories in the current|project directory.';
export const bare_usage = 'input init --bare';

export const bare_cb: CallBackFlagAsync = async ( _data, absolute_path: string ): Promise<boolean> => {

  const recursive_dir = await readdir( absolute_path, { withFileTypes: true } );

  for ( const dirent of recursive_dir ) {

    if( dirent.isDirectory() ){

      await rm( `${absolute_path}/${dirent.name}`, { force: true, recursive: true } )
        .catch( ( error ) => {
          process.stderr.write( error.toString().red() );
          process.exit( 1 );
        } );
    }
    else if( dirent.isFile() ){

      await rm( `${absolute_path}/${dirent.name}`, { force: true } )
        .catch( ( error ) => {
          process.stderr.write( error.toString().red() );
          process.exit( 1 );
        } );
    }
  }

  return true;
};
