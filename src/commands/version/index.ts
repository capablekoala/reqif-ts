import { version } from '../../version';

/**
 * Command handler for the 'version' command.
 * Displays version information.
 */
export function versionCommand(): void {
  console.log(`reqif-ts version ${version}`);
}