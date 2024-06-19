import { Path } from '@ivy-industries/cross-path';
import { spawn } from 'node:child_process';
import { access, chmod, mkdir, writeFile } from 'node:fs/promises';

import type { CallBackArgvData, CallBackAsync } from '../../lib/cli/specs.js';

import { generate_name } from '../constant/project-name.js';
import { bare_ts } from './source/bare-ts.js';
import { index_ts } from './source/index-ts.js';
import { init_ts } from './source/init-ts.js';
import { package_json } from './source/package-json.js';
import { tsconfig_json } from './source/tsconfig-json.js';

type OptionType =
  CallBackArgvData<'bare', boolean> &
  CallBackArgvData<'description' | 'directory' | 'name' | 'semver', string> &
  CallBackArgvData<'git', boolean & string[]>
;

const p = new Path();

export const init_description = `initialises a new CLI project. Flags are optional.
If no options are provided, a new project will be created in a sub-directory of the current working directory. the name of the project and sub-directory will be generated automatically.

If the --directory flag is provided, the project will be created in the specified directory.
If the --name flag is provided, the name will be added to the package.json file.
If the --description flag is provided, the description will be added to the package.json file.
If the --version flag is provided, the version will be added to the package.json file.
If the --bare flag is provided, everything in the current working directory will be deleted and replaced with the new project. using the current working directory as the root of the new project.
`;
export const init_usage = 'input [--dry-run] init [options]';

export const init_cb: CallBackAsync = async ( data: OptionType, absolute_path: string ): Promise<void> => {

  const dry_run: boolean = process.env.DRY_RUN === 'true';
  const pkg_json = package_json( {
    project_description: data?.get( 'description' ),
    project_name: data?.get( 'name' ),
    project_version: data?.get( 'semver' )
  } );
  const tsc_json = tsconfig_json();
  const src_index_ts = `export {}\n`;
  const src_bin_index_ts = index_ts( { project_name: data?.get( 'name' ) } );
  const src_lib_bare_ts = bare_ts();
  const src_lib_init_ts = init_ts();
  const git = data?.get( 'git' ) || false;
  const bare = data?.get( 'bare' ) || false;
  const project_dir = bare === true
    ? p.resolve( absolute_path, `${ data?.get( 'directory' ) || ''}` )
    : p.resolve( absolute_path, `${ data?.get( 'directory' ) || generate_name()}` );
  const dir_src = p.resolve( project_dir, 'src' );
  const dir_lib = p.resolve( dir_src, 'lib' );
  const dir_bin = p.resolve( dir_src, 'bin' );
  const package_json_path = p.resolve( project_dir, 'package.json' );
  const tsconfig_json_path = p.resolve( project_dir, 'tsconfig.json' );
  const src_index_ts_path = p.resolve( dir_src, 'index.ts' );
  const src_bin_index_ts_path = p.resolve( dir_bin, 'index.ts' );
  const src_lib_bare_ts_path = p.resolve( dir_lib, 'bare.ts' );
  const src_lib_init_ts_path = p.resolve( dir_lib, 'init.ts' );
  const gitignore_path = p.resolve( project_dir, '.gitignore' );
  const bin_index_js_path = p.resolve( project_dir, 'bin', 'index.js' );
  const execute = p.relative(
    process.cwd(),
    p.resolve( project_dir, 'bin', 'index.js' )
  );

  if( bare === true ){
    process.stdout.write( 'initialising bare project\n'.blue() );
    process.stdout.write( `removing all files and directories in the directory -> ${ project_dir }\n`.blue() );
  }

  await check_presence_of_package_json( project_dir, dry_run );

  if( dry_run === false ){

    await mkdir( dir_bin, { recursive: true } )
      .catch( ( error ) => {
        process.stderr.write( error.toString().red() );
        process.exit( 1 );
      } );

    await mkdir( dir_lib, { recursive: true } )
      .catch( ( error ) => {
        process.stderr.write( error.toString().red() );
        process.exit( 1 );
      } );
  }
  process.stdout.write( `create directory: ${dir_bin}\n`.green() );
  process.stdout.write( `create directory: ${dir_lib}\n`.green() );

  if( dry_run === false ){

    await writeFile( package_json_path, pkg_json )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${package_json_path}\n`.green() );

  if( dry_run === false ){

    await writeFile( tsconfig_json_path, tsc_json )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${tsconfig_json_path}\n`.green() );

  if( dry_run === false ){

    await writeFile( src_bin_index_ts_path, src_bin_index_ts )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${src_bin_index_ts_path}\n`.green() );

  if( dry_run === false ){

    await writeFile( src_index_ts_path, src_index_ts )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${src_index_ts_path}\n`.green() );

  if( dry_run === false ){

    await writeFile( src_lib_bare_ts_path, src_lib_bare_ts )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${src_lib_bare_ts_path}\n`.green() );

  if( dry_run === false ){

    await writeFile( src_lib_init_ts_path, src_lib_init_ts )
      .catch( ( error ) => {
        process.stderr.write( `${error.toString().red()}\n` );
        process.exit( 1 );
      } );
  }

  process.stdout.write( `create file: ${src_lib_init_ts_path}\n`.green() );

  // if dry_run is true, only check if the required programs are installed.
  if ( dry_run ) {

    // check if npm is installed.
    const npm = spawn( 'npm', [ '--version' ] );
    npm.on( 'error', () => {
      process.stderr.write( `${`npm wasn't found`.red()}\n` );
      process.exit( 1 );
    } );
    npm.on( 'spawn', () => {
      process.stdout.write( 'npm found\n'.blue() );
    } );

    // check if npx is installed.
    const npx = spawn( 'npx', [ '--version' ] );
    npx.on( 'error', () => {
      process.stderr.write( `${`npx wasn't found`.red()}\n` );
      process.exit( 1 );
    } );
    npx.on( 'spawn', () => {
      process.stdout.write( 'npx found\n'.blue() );
    } );

    // check if git is installed.
    const git = spawn( 'git', [ '--version' ] );
    git.on( 'error', () => {
      process.stderr.write( `${`git wasn't found`.red()}\n` );
      process.exit( 1 );
    } );
    git.on( 'spawn', () => {
      process.stdout.write( 'git found\n'.blue() );
    } );

    // check if tsc is installed using npx.
    const tsc = spawn( 'npx', [ 'tsc', '--version' ] );
    tsc.on( 'error', () => {
      process.stderr.write( `${`tsc wasn't found`.red()}\n` );
      process.exit( 1 );
    } );
    tsc.on( 'spawn', () => {
      process.stdout.write( 'tsc found\n'.blue() );
    } );

    process.stdout.write( '📦 project prerequisites are checked, and a project can be created\n'.green() );
  }

  if( dry_run === false ){

    const install = spawn( 'npm', [ 'install' ], {
      cwd: project_dir,
      stdio: 'inherit'
    } );

    install.on( 'error', ( error ) => {
      process.stderr.write( `${error.toString().red()}\n` );
      process.exit( 1 );
    } );

    install.on( 'spawn', () => {
      process.stdout.write( 'installing dependencies\n'.blue() );
    } );

    install.on( 'exit', ( code ) => {

      if( code === 0 ){

        process.stdout.write( 'installed dependencies\n'.magenta() );
        const tsc = spawn( 'npx', [ 'tsc' ], {
          cwd: project_dir,
          stdio: 'inherit'
        } );

        tsc.on( 'spawn', () => {
          process.stdout.write( 'compiling project\n'.blue() );
        } );

        tsc.on( 'error', ( error ) => {
          process.stderr.write( `${error.toString().red()}\n` );
          process.exit( 1 );
        } );

        tsc.on( 'exit', async ( code ) => {

          if( code === 0 ){

            if( git !== false ){
              const git_init = spawn( 'git', [ 'init' ], {
                cwd: project_dir,
                stdio: 'inherit'
              } );

              git_init.on( 'spawn', () => {
                process.stdout.write( 'initialising git\n'.blue() );
              } );

              git_init.on( 'error', ( error ) => {
                process.stderr.write( `${error.toString().red()}\n` );
                process.exit( 1 );
              } );

              git_init.on( 'exit', async ( code ) => {

                if( code === 0 ){

                  if( Array.isArray( git ) ){

                    await writeFile( gitignore_path, git.join( '\n' ) )
                      .catch( ( error ) => {
                        process.stderr.write( `${error.toString().red()}\n` );
                        process.exit( 1 );
                      } );

                    process.stdout.write( `create file: ${gitignore_path}\n`.green() );
                    process.stdout.write( `added ignored files: \n${'['.blue()}\n${ git.join( '\n' ) }\n${']'.blue()}\n`.green() );
                  }

                  process.stdout.write( 'initialised git repository\n'.magenta() );
                  process.stdout.write( '📦 project created && compiled\n'.green() );
                  await chmod( bin_index_js_path, 0o755 );
                  process.stdout.write( '   run: ./bin/index.js init\n'.yellow() );
                }
                else{
                  process.stderr.write( `git init failed with code: ${ code }\n`.red() );
                }
              } );
            }
            else {

              process.stdout.write( '📦 project created && compiled\n'.green() );
              await chmod( src_bin_index_ts_path, 0o755 );
              process.stdout.write( `   run: ${execute} init\n`.yellow() );
            }
          }
          else{
            process.stderr.write( `npm run build failed with code: ${ code }\n`.red() );
          }
        } );
      }
      else {
        process.stderr.write( `npm install failed with code: ${ code }\n`.red() );
      }
    } );
  }
};

const dry_run_text = `${'⚠'.yellow()}
if you want to initialise a new project in this directory, use the flag --bare.
this will delete all files in the directory and initialise a new project.
`;

// function to check the existence of a file another project in the directory.
async function check_presence_of_package_json( directory: string, dry_run: boolean ): Promise<void>{

  await access( p.resolve( directory, 'package.json' ) ).then( () => {
    if ( dry_run === false ) {
      process.stderr.write( `package.json found in ${directory}, exiting...\n`.red() );
      process.stderr.write( dry_run_text.yellow() );
      process.exit( 1 );
    }

    process.stdout.write( `package.json found in ${directory}, proceeding... in dry run\n`.green() );
    process.stdout.write( dry_run_text.yellow() );
  } )
    .catch( () => {
      process.stdout.write( `no package.json found in ${directory}, proceeding...\n`.green() );
    } );
}
