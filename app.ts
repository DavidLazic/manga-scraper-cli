require('module-alias/register');

// import path from 'path';
import inquirer from 'inquirer';


// import { DownloadService } from '@services';
import { CLI } from '@modules';

CLI.init();



// const questions = [
//   { type: 'list', name: 'coffeType', message: 'Choose coffee type', choices: values.typesPlain },
//   { type: 'list', name: 'sugarLevel', message: 'Choose your sugar level', choices: values.sugarPlain },
//   { type: 'confirm', name: 'decaf', message: 'Do you prefer your coffee to be decaf?', default: false },
//   { type: 'confirm', name: 'cold', message: 'Do you prefer your coffee to be cold?', default: false },
//   { type: 'list', name: 'servedIn', message: 'How do you prefer your coffee to be served in', choices: values.servedIn },
//   { type: 'confirm', name: 'stirrer', message: 'Do you prefer your coffee with a stirrer?', default: true },
// ];

// inquirer
//   .prompt(questions)
//   .then(function (answers) {
//       console.log(answers);
//   })

// DownloadService.all({
//   name: 'Test',
//   provider: 'Manganelo',
//   outDir: 'export'
// });
  
  