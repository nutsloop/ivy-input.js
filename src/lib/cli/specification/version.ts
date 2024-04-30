import { CLIInfo } from '../specs.js';
import { Retrieve } from './retrieve.js';


/**
 * **Retrieves the version number of the CLI.**
 *
 * - If the CLI runs from the development project, it will return the version number of the local package.json.
 * - if the CLI is installed as a dependency, it will return the version number of the package.json of the CLI.
 * - if the CLI is installed globally, it will return the version number of the package.json of the CLI.
 * - if the process_title parameter is not passed to the run() function, it will return an error message as string.
 *
 */
export async function version( returns: boolean = false ): Promise<string|void> {

  const retrieve = new Retrieve( 'version' );
  if( CLIInfo.version !== null ) {

    if( returns ) {

      return CLIInfo.version;
    }
    retrieve.stdout( CLIInfo.version );
  }

  const cli_is_local: boolean|string = await retrieve.from( `${process.cwd()}/package.json`, 'local' );
  if( typeof cli_is_local === 'string' ){

    if( returns ) {

      return cli_is_local;
    }
    retrieve.stdout( cli_is_local );
  }

  const cli_is_module: boolean|string = await retrieve.from( 'is_module', 'meta_resolve' );
  if( typeof cli_is_module === 'string' ){

    if( returns ) {

      return cli_is_module;
    }
    retrieve.stdout( cli_is_module );
  }

  const cli_is_global: boolean|string = await retrieve.from( retrieve.global( process.title ), 'global' );
  if( typeof cli_is_global === 'string' ){

    if( returns ) {

      return cli_is_global;
    }
    retrieve.stdout( cli_is_global );
  }
}
