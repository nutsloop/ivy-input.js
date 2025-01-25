import { CallBackGlobalFlag } from '../../../lib/cli/specs.js';

export const dry_run_description = 'simulates execution of `init` command without making any changes.';
export const dry_run_usage = 'input --dry-run init';

/**
 * Callback function for the `--dry-run` global flag.
 * Sets the `DRY_RUN` environment variable to `true`.
 * Global flag is only available for the `init` command. and must be used before the `init` command.
 * @example
 * ```shell
 * npx input --dry-run init
 * ```
 */
export const dry_run_cb: CallBackGlobalFlag = async (): Promise<void> => {

  process.env.DRY_RUN = 'true';
};
