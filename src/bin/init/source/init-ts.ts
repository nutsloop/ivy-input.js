export function init_ts(): string{

  return `import type { CallBackArgvData, CallBackRestArgs } from '@ivy-industries/input';

export function init_cb ( data: CallBackArgvData, process_argv: CallBackRestArgs ): void{

  console.log( 'data', data );
  console.log( 'rest', process_argv );
  console.log( 'this', this );
  console.log( 'init command triggered' );
};`;
}
