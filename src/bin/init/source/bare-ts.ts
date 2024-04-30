export function bare_ts(): string{

  return `import type { CallBackFlag } from '@ivy-industries/input';

export const bare_cb: CallBackFlag = (): void => {
  console.log( 'bare flag triggered' );
};`;
}
