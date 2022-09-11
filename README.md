# importmap-resolver

[![license](https://img.shields.io/github/license/snoown/importmap-resolver)](https://github.com/snoown/importmap-resolver/blob/main/LICENSE)

This package is for resolving and replacing imported module names with `importmap`.

## Installation

``` shell
npm install --save-dev importmap-resolver
```

## Command Line Usage

### Create an `importmap` file

First, create a file `.importmap.yaml` or `.importmap.yml` in your project root. It is searched from the working directory toward the root and uses the first found. Therefore, it is possible to separate `importmap` for each directory as needed.

The map can use a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet) as well as strings. Note the order, as the mappings written earlier are preferred.

``` yaml
# Mapping with strings
a: https://example-a.ex/a.js
b: https://example-b.ex/b.js

# Mapping with a regular expression
(.+): https://example-$1.ex/$1.js
```

Also, note that YAML distinguishes between strings, numbers, etc. Therefore, `1: 2` must be written as `'1': '2'`.

### Execute command

``` shell
importmap <include-path> [options]
```

If a directory path is specified, the files with `.js` or `.mjs` extensions are searched recursively.

#### Options

- `--minify`: Enable code minification.

- `--ecma <version>`: Specify an ECMAScript version such as 5, 2015, etc. It may optimize code minification.

## API Usage

``` javascript
import { resolve, replace, execute } from "importmap-resolver";
```

### Functions

- `resolve(moduleName: string): string`

  Returns resolved module name.

- `replace(code: string): string`

  Returns a code that resolves and replaces module names in the given code.

- `execute(includePath: string, isMinify = false, minifyOptions?: object): void`

  The command uses this function. The main difference from command line execution is that you can set the [minify options](https://terser.org/docs/api-reference#minify-options).
