import { CLIInfo } from '../specs.js';
import { Retrieve } from './retrieve.js';

export async function description(): Promise<string|undefined> {

  const retrieve = new Retrieve( 'description' );
  if( CLIInfo.description !== null ) {
    return CLIInfo.description;
  }

  const cli_is_local: boolean|string = await retrieve.from( `${process.cwd()}/package.json`, 'local' );
  if( typeof cli_is_local === 'string' ){
    return cli_is_local;
  }

  const cli_is_module: boolean|string = await retrieve.from( 'is_module', 'meta_resolve' );
  if( typeof cli_is_module === 'string' ){
    return cli_is_module;
  }

  const cli_is_global: boolean|string = await retrieve.from( retrieve.global( process.title ), 'global' );
  if( typeof cli_is_global === 'string' ){
    return cli_is_global;
  }

  return undefined;
}
