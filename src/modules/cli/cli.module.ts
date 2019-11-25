import commander, { Command } from 'commander';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

import pkg from '../../../package.json';
import { CLIService } from './cli.service';

export namespace CLI {

  const COMMANDS = [ info, list, download ];

  function info (program: Command): void {
    program
      .version(pkg.version)
      .description('Download hosted manga images to local file system')
      .option('-d, --database <path>', 'custom database entries path', null);
  }

  function list (program: Command): void {
    program
      .command('list <type>')
      .alias('ls')
      .description('list supported <providers|entries>')
      .action(async (type: string) => {
        console.log('[Supported Providers]: ', '\n');
        (CLIService.list as any)[type].then((test: any) => console.log('test', test));

            // arr.forEach(provider =>
            //   console.log(
            //     `${provider.name} ${chalk.grey('-->')} ${chalk.green(provider.url)}`
            //   )
            // );
      });
  }

  function download (program: Command): void {
    program
      .command('download')
      .alias('dl')
      .description('download selection')
      .action(() => CLIService.download(program));
  }

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