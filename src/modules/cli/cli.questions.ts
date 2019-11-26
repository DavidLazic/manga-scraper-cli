import { TEntry } from '../../types';

export const QUESTIONS = {
  manga: (entries: TEntry[]) => [
    {
      type: 'list',
      name: 'name',
      message: 'Select manga',
      choices: entries
        .map((entry: any) =>
          ({
            name: entry.name,
            value: entry,
            short: entry.name
          })
        )
    }
  ],
  config: (selected: TEntry) => [
    {
      type: 'list',
      name: 'provider',
      message: 'Select provider',
      choices: Object
        .keys(selected.providers)
        .map((provider: any) =>
          ({
            name: provider,
            value: { name: provider, ...selected.providers[provider] },
            short: provider
          })
        )
    },
    {
      type: 'list',
      name: 'type',
      message: 'Select download type',
      choices: [ 'all', 'latest' ]
    },
    {
      type: 'input',
      name: 'outDir',
      message: 'Enter download directory name',
      default: 'export'
    }
  ]
};