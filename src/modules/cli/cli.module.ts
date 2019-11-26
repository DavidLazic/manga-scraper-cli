import commander, { Command } from 'commander';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

import pkg from '../../../package.json';
import { CLIService } from './cli.service';

export namespace CLI {

  const COMMANDS = [ info, list, download ];

  /**
   * @description
   * Initializes info command method.
   */
  function info (program: Command): void {
    program
      .version(pkg.version)
      .description('Download hosted manga images to local file system')
      .option('-d, --database <path>', 'custom database entries path', '');
  }

  /**
   * @description
   * Initializes list command method.
   */
  function list (program: Command): void {
    program
      .command('list <type>')
      .alias('ls')
      .description('list supported <providers|entries>')
      .action(async (type: string): Promise<void> => {
        if ((CLIService.list as any)[type]) {
          console.log(`[Supported ${type}]: `, '\n');

          const res: any[] = await (CLIService.list as any)[type]({ database: program.database });
          res.forEach((item: any) => console.log(item));
        }
      });
  }

  /**
   * @description
   * Initializes download command method.
   */
  function download (program: Command): void {
    program
      .command('download')
      .alias('dl')
      .description('download selection')
      .action(() => CLIService.download({ database: program.database }));
  }

  /**
   * @description
   * Initializes all CLI command listeners methods.
   */
  export const init = ((program: Command): any => (): void => {
    clear();
    console.log(
      chalk.green(
        figlet.textSync('Manga Scraper CLI', { horizontalLayout: 'full' })
      )
    );

    COMMANDS.forEach(command => command(program));

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.outputHelp();
    }
  })(commander);
}