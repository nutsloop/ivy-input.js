#!/usr/bin/env -S node

import type { GlobalFlagDeclaration } from '../lib/parser/global.js';

import { CLILogic, ParsedArgv } from '../index.js';
import {
  cli,
  command,
  flag,
  global,
  run,
  set_cli_info_specification,
  set_global_flag_declaration
} from '../index.js';
import { dry_run_cb, dry_run_description, dry_run_usage } from './global/dry-run/cb.js';
import { spec_description, spec_usage } from './help/text.js';
import { init_cb, init_description, init_usage } from './init/cb.js';
import { git_cb, git_description, git_usage } from './init/flag//git/cb.js';
import { bare_cb, bare_description, bare_usage } from './init/flag/bare/cb.js';
import { description_cb, description_description, description_usage } from './init/flag/description/cb.js';
import { directory_cb, directory_description, directory_usage } from './init/flag/directory/cb.js';
import { name_cb, name_description, name_usage } from './init/flag/name/cb.js';
import { semver_cb, semver_description, semver_usage } from './init/flag/semver/cb.js';

set_cli_info_specification( {
  description: spec_description,
  github: 'https://www.github.com/nutsloop/ivy-input.js',
  name: '@nutsloop/ivy-input',
  npmjs: 'https://www.npmjs.com/~nutsloop',
  usage: spec_usage,
  version: '1.0.1-alpha.0',
  website: 'https://github.com/sponsors/nutsloop'
} );

const globals: GlobalFlagDeclaration = new Map();
globals.set( 'has_global', true );
globals.set( 'cli_command_identifier_list', [ 'init' ] );
globals.set( 'cli_global_identifier_list', [ '--dry-run' ] );

set_global_flag_declaration( globals );

const input: CLILogic = async ( parsed_argv: ParsedArgv ): Promise<void> => {

  await global( '--dry-run', {
    cb: {
      fn: dry_run_cb,
      type: 'sync'
    },
    description: dry_run_description,
    only_for: 'init',
    usage: dry_run_usage
  } );

  await command( 'init', {
    cb: init_cb,
    description: init_description,
    has_flag: true,
    rest: [ process.cwd() ],
    usage: init_usage
  } );

  await flag( [ '--name', '-n' ], {
    alias: 'name',
    cb: {
      fn: name_cb,
      type: 'sync'
    },
    description: name_description,
    is_flag_of: 'init',
    type: 'string',
    usage: name_usage
  } );

  await flag( [ '--semver', '-sv' ], {
    alias: 'semver',
    cb: {
      fn: semver_cb,
      type: 'sync'
    },
    description: semver_description,
    is_flag_of: 'init',
    type: 'string',
    usage: semver_usage
  } );

  await flag( [ '--description', '-ds' ], {
    alias: 'description',
    cb: {
      fn: description_cb,
      type: 'sync'
    },
    description: description_description,
    is_flag_of: 'init',
    type: 'string',
    usage: description_usage
  } );

  await flag( [ '--directory', '-d' ], {
    alias: 'directory',
    cb: {
      fn: directory_cb,
      type: 'sync'
    },
    description: directory_description,
    is_flag_of: 'init',
    type: 'string',
    usage: directory_usage
  } );

  await flag( [ '--git', '-g' ], {
    alias: 'git',
    cb: {
      fn: git_cb,
      type: 'sync'
    },
    description: git_description,
    is_flag_of: 'init',
    multi_type: [ 'void', 'array' ],
    usage: git_usage
  } );

  await flag( [ '--bare', '-b' ], {
    alias: 'bare',
    cb: {
      fn: bare_cb,
      rest: [ process.cwd() ],
      type: 'async'
    },
    description: bare_description,
    is_flag_of: 'init',
    usage: bare_usage
  } );

  await cli( parsed_argv );
};

await run( process.argv, input, '@ivy-industries/input', {
  handle_uncaught_error: true,
  no_warnings: true,
  show_no_warnings_warn: false
} );
