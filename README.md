# importmap-resolver

[![license](https://img.shields.io/github/license/snoown/importmap-resolver)](https://github.com/snoown/importmap-resolver/blob/main/LICENSE)

This package is for resolving module names with `importmap`.

## Installation

``` shell
npm install --save-dev importmap-resolver
```

## Command Line Usage

### Create an `importmap` file

First, create the file `.importmap.yaml` or `.importmap.yml`. This package searches it from the working directory toward the root and uses the first found one.

You can use [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet) as well as strings in the map. Note its order because the mappings written earlier are preferred.

``` yaml
# Mapping with strings
a: https://example-a.ex/a.js
b: https://example-b.ex/b.js

# Mapping with the regular expressions
(.+): https://example-$1.ex/$1.js
```

Also, note that YAML distinguishes between strings, numbers, etc. Therefore, `1: 2` must be written as `'1': '2'`.

### Execute command

``` shell
importmap <include-path> [options]
```

If a directory path is specified, search files under it with the extension `.js` or `.mjs` recursively.

#### Options

- `--minify`: Enable code minification.

- `--ecma <version>`: Specify an ECMAScript version such as 5, 2015, etc. It helps to optimize code minification.

## API Usage

First, load this package with the following import statement.

``` javascript
import { resolve, replace, execute } from "importmap-resolver";
```

### Functions

- `resolve(moduleName: string): string`

  Convert the module name to resolved one.

- `replace(code: string): string`

  Convert module names in the code to resolved ones.

- `execute(includePath: string, shouldMinify = false, minifyOptions?: object): void`

  The command process uses this function. The [minify options](https://terser.org/docs/api-reference#minify-options) are only available from API.

## Loading AMD (Asynchronous Module Definition)

This package can convert the import statements loading AMD. Meet these conditions to use this feature.

- Resolved module names (URL or GET parameter) include the string `amd` or `umd` sandwiched between the symbols.
- Specified modules output the variable declared in each import statement.

See the following examples for more information.

``` javascript
// 'react.js' outputs 'React'
import React from './amd/react.js'
import * as React from './amd/react.js'
// ↓
import './amd/react.js'

// 'react.umd.js' outputs 'useState'
import { useState } from './react.umd.js'
// ↓
import './react.umd.js'

// 'react.js' outputs 'React'
import React, { useState as ustate } from './react.js?amd';
// ↓
import './react.js?amd'; const { useState: ustate } = React;

// 'react.js' outputs 'React'
import React, * as react from './react.js?name=val&module=umd';
// ↓
import './react.js?name=val&module=umd'; const react = React;
```
