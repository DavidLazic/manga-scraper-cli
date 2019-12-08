# Manga Scraper CLI

Download mangas of your own choosing from specific providers.\
Written in TypeScript. 

## Table of Contents
1. [Installation](#installation)
2. [Entities](#entities)\
   2.1 [Providers](#entity_providers)\
   2.2 [Entries](#entity_entries)
3. [Usage](#usage)\
   3.1 [Basics](#usage_basics)\
   3.2 [Commands](#usage_commands)\
   3.3 [Flags](#usage_flags)
4. [Development](#dev)\
    4.1 [Node version](#dev_version)\
    4.2 [Local build](#dev_build)
5. [Improvements](#improvements)
6. [License](#license)

## Installation
<a name="installation"></a>

```js
$ npm i -g @davidlazic/manga-scraper-cli
```

*Notice: It is advised that you use Node version 10+ and do a global CLI installation.*

## Entities

### Providers
<a name="entity_providers"></a>

The CLI only supports scraping of websites (called `providers`) that come bundled with the CLI. There is no option to extend supported providers via external configuration file.\
You can see available providers by using the following command:
```js
$ ms list providers
```

*Notice: Code used for scraping these providers might stop working if providers introduce changes on their end, so please send a **`provider update`** request.*


### Entries
<a name="entity_entries"></a>

Entries JSON file represents configuration file which needs to contain the **`entries`** array field. The CLI will list all entries as download options.\
You can see available entries by using the following command:
```js
$ ms list entries --url <ENTRIES_PATH>
```
*Notice: URL can point to a local file or remotely hosted one, but needs to be an absolute path.*

Here's an example of entries JSON file:
```js
{
  "entries": [
    {
      "name": "Jackals",
      "providers": {
        "https://mangairo.com": { "id": 1288902540 }
      }
    }
  ]
}
```

`Name` field represents manga name.\
`Providers` field describes a manga ID on a supported provider.

*Notice: You will need to manually look for manga IDs on available providers and create entries JSON accordingly.*


## Usage
<a name="usage"></a>

### Basics
<a name="usage_basics"></a>
CLI is accessible by using the `ms` command.

Make sure the CLI can access and read *your own* [entries JSON](#entity_entries).

```js
$ ms list entries -url https://raw.githubusercontent.com/DavidLazic/manga-scraper-cli/master/db.example.json
```

Download options selection.
```js
$ ms download --url https://raw.githubusercontent.com/DavidLazic/manga-scraper-cli/master/db.example.json
```

### Commands
<a name="usage_commands"></a>

#### `ms list, ls <providers|entries>`

List all supported download providers or available entries from a JSON configuration file.

#### `ms download, dl`

Start download options selection.


### Flags
<a name="usage_flags"></a>

#### `ms -u, --url <ENTRIES_PATH>` (required)
Provide the CLI with location path to your [entries JSON](#entity_entries) file.
Path can describe location of a local or remotely hosted file.

*Notice: Path needs to be absolute.*

#### `ms -V, --version`
Echo the current CLI version

#### `ms -h, --help`
List available CLI flags and commands

## Development
<a name="dev"></a>

In order to run the CLI in development mode, you'll need to install Node version manager, Win / OSX.
- [`nvm OSX`](https://github.com/nvm-sh/nvm)
- [`nvm Win`](https://github.com/coreybutler/nvm-windows)

### Node version
<a name="dev_version"></a>

Make sure you're using compatible Node version:

```js
// Switch to Node version described in .nvmrc file
$ nvm use

// If you don't have the right version, you can install it via
$ nvm install <VERSION>
```

*Notice: These commands might be different between Win / OSX platforms,
so please read the correlating **`nvm`** documentation
on how to install / switch Node versions.* 


### Local build
<a name="dev_build"></a>

```js
$ npm start
```

This task will create **`dist`** directory and link it locally.\
It will enable you to use the **`ms`** command as though you've installed the CLI from the `npm` registry.


## Improvements
<a name="improvements"></a>
- [ ] Write provider tests
- [ ] Add more providers

## License 
<a name="license"></a>

Copyright (c) 2019 David Lazic. Licensed under the [MIT license](https://github.com/DavidLazic/manga-scraper-cli/blob/master/LICENSE).