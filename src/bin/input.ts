#!/usr/bin/env -S node

import type { GlobalFlagDeclaration } from '../lib/parser/global.js';

import { CLILogic, CallBackGlobalFlag, ParsedArgv } from '../index.js';
import {
  cli,
  command,
  flag,
  global,
  run,
  set_cli_info_specification,
  set_global_flag_declaration
} from '../index.js';
import {
  spec_description,
  spec_usage
} from './help/text.js';
import { init_cb } from './init/cb.js';
import { bare_cb } from './init/flag/bare.js';
import { git_cb } from './init/flag/git_cb.js';
import { project_directory_cb } from './init/flag/project-directory.js';
import { project_name_cb } from './init/flag/project-name.js';
import { project_version_cb } from './init/flag/project-version.js';

set_cli_info_specification( {
  description: spec_description,
  github: 'https://www.github.com/ivy-industries/input',
  name: '@ivy-industries/input',
  npmjs: 'https://www.npmjs.com/package/@ivy-industries/input',
  usage: spec_usage,
  version: '1.0.0-alpha.4',
  website: 'https://www.ivy.run'
} );

const globals: GlobalFlagDeclaration = new Map();
globals.set( 'has_global', true );
globals.set( 'cli_command_identifier_list', [ 'init' ] );
globals.set( 'cli_global_identifier_list', [ '--dry-run' ] );

set_global_flag_declaration( globals );

const input: CLILogic = async ( parsed_argv: ParsedArgv ): Promise<void> => {

  const dry_run_cb: CallBackGlobalFlag = (): void => {
    process.env.DRY_RUN = 'true';
  };

  await global( '--dry-run', {
    cb: {
      fn: dry_run_cb,
      type: 'sync'
    },
    description: 'run the CLI without creating any files.',
    only_for: 'init',
    usage: 'input --dry-run init'
  } );

  await command( 'init', {
    cb: init_cb,
    description: 'to initialise a new CLI project, flags are optional.',
    has_flag: true,
    rest: [ process.cwd() ],
    usage: 'input init'
  } );

  await flag( [ '--project-name', '-n' ], {
    alias: 'project-name',
    cb: {
      fn: project_name_cb,
      type: 'sync'
    },
    description: 'initialise a new CLI project with a name.',
    is_flag_of: 'init',
    type: 'string',
    usage: 'input init --project-name=<name>'
  } );

  await flag( [ '--project-version', '-vs' ], {
    alias: 'project-version',
    cb: {
      fn: project_version_cb,
      type: 'sync'
    },
    description: 'initialise a new CLI project with a version.',
    is_flag_of: 'init',
    type: 'string',
    usage: 'input init --project-version=<version>'
  } );

  await flag( [ '--project-description', '-ds' ], {
    alias: 'project-description',
    description: 'initialise a new CLI project with a description.',
    is_flag_of: 'init',
    type: 'string',
    usage: 'input init --project-description=<description>'
  } );

  await flag( [ '--project-directory', '-d' ], {
    alias: 'project-directory',
    cb: {
      fn: project_directory_cb,
      type: 'sync'
    },
    description: 'initialise a new CLI project in a specific directory.',
    is_flag_of: 'init',
    type: 'string',
    usage: 'input init --project-directory=<directory>'
  } );

  await flag( [ '--git', '-g' ], {
    alias: 'git',
    cb: {
      fn: git_cb,
      type: 'sync'
    },
    description: 'initialise a project and create a git repository',
    is_flag_of: 'init',
    multi_type: [ 'void', 'array' ],
    usage: `input init --git # this will just initialise a git repository.
input init --git='file.js,directory' # this will initialise a git repository and ignore the given files and directories.
`
  } );

  await flag( [ '--bare', '-b' ], {
    alias: 'bare',
    cb: {
      fn: bare_cb,
      rest: [ process.cwd() ],
      type: 'async'
    },
    description: 'initialise a bare project. it will delete all the files and directories in the current|project directory.',
    is_flag_of: 'init',
    usage: 'input init --bare'
  } );

  await cli( parsed_argv );
};

await run( process.argv, input, '@ivy-industries/input', {
  handle_uncaught_error: true,
  no_warnings: true,
  show_no_warnings_warn: false
} );
