# Manga Scraper CLI

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
  - [Node version](#test)
  - Local build

## Installation
<a name="installation"></a>

```js
$ npm i -g @davidlazic/manga-scraper-cli
```

*Notice: It is advised that you use Node version 10+ and do a global CLI installation.*


## Usage
<a name="usage"></a>

### Basics
Make sure the CLI can access and read *your own* [entries JSON](#entries).

```js
// db.example.json shows how your entries file should look like.
$ ms list entries -url https://raw.githubusercontent.com/DavidLazic/manga-scraper-cli/master/db.example.json
```

Invoke the CLI with `ms` commands and provide it with entries JSON file.
```js
$ ms download --url https://raw.githubusercontent.com/DavidLazic/manga-scraper-cli/master/db.test.json
```

### Providers
Currently, the CLI supports scraping of only a couple of websites (called `providers`). 
You can see available providers by using:
```js
$ ms list providers
```

*Notice: Code used for scraping these providers might stop working if providers introduce changes on their end, so please issue a `provider update` request.*


### Entries




### Flags

#### `ms -u, --url <FILE_PATH>` (required)
Provide the CLI with location path to your entries JSON file.
Path can describe location of a local file or a remote, hosted one.

*Notice: Path needs to be absolute.*

#### `ms -V, --version`
Echo the current CLI version

#### `ms -h, --help`
List available CLI flags and commands

ms
ms list entries
ms list providers
ms download
ms -u / --url <file_location>

## Development
<a name="development"></a>

In order to run the CLI in development mode, you'll need to install Node version manager, Win / OSX.
- [`nvm OSX`](https://github.com/nvm-sh/nvm)
- [`nvm Win`](https://github.com/coreybutler/nvm-windows)

### Node version
<a name="test"></a>

Make sure you're using compatible Node version:

```js
// Switch to Node version described in .nvmrc file
$ nvm use

// If you don't have the right version, you can install it via
$ nvm install <VERSION>
```

*Notice: These commands might be different between Win / OSX platforms,
so please read the correlating `nvm` documentation
on how to install / switch Node versions.* 


### Local build

```js
$ npm start
```

This task will create `dist` directory and link it locally.\
It will enable you to use the `ms` command as though you've installed the CLI from the `npm` registry.