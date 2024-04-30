import { async_import_meta_resolve } from '@ivy-industries/cross-path';
import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import semver from 'semver/preload.js';

//todo retrieve other data from package.json or add data to the CLIGlobalSpecification interface.
export class Retrieve{

  readonly #what: 'description'|'version';
  constructor( what: 'description'|'version' ){

    this.#what = what;
  }

  async #meta_resolve( title: string ): Promise<Error|string>{

    const meta_resolve: Error|string = await async_import_meta_resolve( title ).catch( error => error );
    if( typeof meta_resolve === 'string' ) {

      return `${meta_resolve.match( /.*?node_modules/ )}/${process.title}/package.json`;
    }

    return meta_resolve;
  }

  async from( path: 'is_module'|string, action: 'global'|'local'|'meta_resolve'|'module' ): Promise<boolean|string>{

    const global = action === 'global';
    let goto_default = false;

    if( path !== 'is_module' ) {

      const is_file = await access( path, constants.F_OK ).catch( error => error );
      if( is_file instanceof Error ) {
        goto_default = true;
        if( ! global ) {

          this.stdout( `Unable to find the file -> ${path}`, true );
        }
      }
    }

    let package_json: { description: string, name: string, version: string };

    switch ( action ) {
      case 'local': {
        package_json = ( await import( path, { assert: { type: 'json' } } ) ).default;
        if ( package_json.name === process.title ) {

          return package_json[ this.#what ];
        }

        return false;
      }

      case 'module': {

        return ( await import( path, { assert: { type: 'json' } } ) ).default[ this.#what ];
      }

      case 'meta_resolve': {
        const meta_resolve = await this.#meta_resolve( process.title );
        if( typeof meta_resolve === 'string' ) {
          this.from( meta_resolve, 'module' );
        }

        return false;
      }

      // break omitted: going on looking for the global version if module failed.
      case 'global': {

        if( ! goto_default ) {

          return ( await import( path, { assert: { type: 'json' } } ) ).default[ this.#what ];
        }
      }

      // break omitted: if process_title is not found globally, locally or as a module it will throw an error.
      default: {
        const message = 'impossible to find the process name, did you forget to pass process_title parameter to function run() for your CLI? it is a required parameter btw.';
        this.stdout( message, true );
      }
        break;
    }
  }

  global( title: string ): string{

    const npm_get_global_directory = spawnSync( 'npm', [ 'config', 'get', 'prefix' ] );

    npm_get_global_directory.error?.message && this.stdout( `spawn sync error: ${npm_get_global_directory.error.message}`, true );
    if( npm_get_global_directory.stderr.toString().trim() !== '' ) {

      this.stdout( npm_get_global_directory.stderr.toString().trim(), true );
    }

    return `${npm_get_global_directory.stdout.toString().trim()}/lib/node_modules/${title}/package.json`;
  }

  /**
   * <u>This function validates, when retrieving the version, the semantic versioning string of a CLI application.</u>
   *
   * - `value` - A string representing the version of the CLI application. Must follow semantic versioning.
   * - `semver.valid(value)` - It checks if 'value' is a valid semantic version string. if it is not valid, it returns null.
   * - if valid, process.stdout.write() will write the 'value' to the console and exit the process with an error code '0'.
   * - if is not valid as per semantic versioning norms, process.stderr.write() will write the `not a valid semver -> ${value}` to the console and exit the process with an error code '1'.
   * - if the version_error is true, it will write the `value` to the console and exit the process with an error code '1'.
   */
  stdout( value: string, error?: boolean ): void {

    if( error ) {

      process.stderr.write( `${value}\n\r` );
      process.exit( 1 );
    }

    if( this.#what === 'version' ) {
      if ( semver.valid( value ) === null ) {

        process.stderr.write( `not a valid semver -> ${value}\n\r` );
        process.exit( 1 );
      }
    }

    process.stdout.write( `${value}\n\r` );
    process.exit( 0 );
  }
}
