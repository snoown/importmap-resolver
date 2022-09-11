#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import url from 'url';
import { program } from 'commander';

import { execute } from '../component/resolve.js';

const minifyOptions: { ecma?: number; module: true } = {
  module: true,
};

const packageRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const data = fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8');
const { name, version } = JSON.parse(data) as { name: string; version: string };

program
  .name(name)
  .version(version, '-v, --version')
  .usage('<include-path> [options]')
  .argument('<include-path>')
  .option('-m, --minify', 'Enable code minification')
  .option('-e, --ecma <version>', 'Specify an ECMAScript version such as 5, 2015, etc', parseInt)
  .action((includePath: string, options: { minify: boolean; ecma?: number }) => {
    if (typeof options.ecma === 'number') minifyOptions.ecma = options.ecma;
    execute(includePath, options.minify, minifyOptions);
  })
  .parse();
