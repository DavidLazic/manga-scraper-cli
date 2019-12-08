import commander, { Command } from 'commander';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

import pkg from '../../../package.json';
import { CLIService } from './cli.service';

export namespace CLI {

  const COMMANDS = [ onInfo, onList, onDownload ];

  /**
   * @description
   * Initializes info command method.
   */
  function onInfo (program: Command): void {
    program
      .version(pkg.version)
      .description('Download hosted manga images to local file system')
      .option('-u, --url <path>', 'custom entries <url|file> path', '');
  }

  /**
   * @description
   * Initializes list command method.
   */
  function onList (program: Command): void {
    program
      .command('list <type>')
      .alias('ls')
      .description('list supported <providers|entries>')
      .action(async (type: string): Promise<void> => {
        if ((<any>CLIService.list)[type]) {
          console.log(`[Supported ${type}]: `, '\n');

          const res: any[] = await (<any>CLIService.list)[type](program);
          res.forEach((item: any) => console.log(item));
        }
      });
  }

  /**
   * @description
   * Initializes download command method.
   */
  function onDownload (program: Command): void {
    program
      .command('download')
      .alias('dl')
      .description('download selection')
      .action(() => CLIService.download({ url: program.url }));
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
      
    console.log(chalk.cyan(`v${pkg.version}\n`));

    COMMANDS.forEach(command => command(program));

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.outputHelp();
    }
  })(commander);
}