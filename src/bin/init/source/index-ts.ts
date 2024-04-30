type index_ts_option = {
  project_name: string;
}
export function index_ts( option: index_ts_option ): string{

  return `#!/usr/bin/env -S node
import { cli, run, flag, command } from '@ivy-industries/input';
import { bare_cb } from '../lib/bare.js';
import { init_cb } from '../lib/init.js';
import type { ParsedArgv } from '@ivy-industries/input';

async function input( parsed_argv: ParsedArgv ): Promise<void>{
  await command( 'init', {
    description: 'init a new project',
    usage: '${ option.project_name || 'cli-project' } init',
    has_flag: true,
    rest: [ process.argv ],
    this: [ 'project-name', 'project-directory', 'project-description', 'project-version' ],
    cb: init_cb
  } );

  await flag( ['--bare', '-b'], {
    cb: {
      fn: bare_cb,
      type: 'sync'
    },
    description: 'initialise a bare project.',
    usage: '${ option.project_name || 'cli-project' } init --bare',
    is_flag_of: 'init',
    alias: 'bare'
  } );

  await cli( parsed_argv )
    .catch( ( error ) => {
      console.error( error );
      process.exit( 1 );
    } );
}

await run( process.argv, input, '${ option.project_name || 'cli-project' }' )
  .catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
`;
}
