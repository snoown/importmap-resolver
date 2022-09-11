import fs from 'fs';
import path from 'path';
import { minify } from 'terser';

import { map } from './importmap.js';

const ESMODULE_EXTENSIONS = ['.js', '.mjs'];

const recursiveSearch = (dirPath: string): string[] => {
  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
  const filePaths: string[] = [];
  for (let i = 0; i < dirents.length; i += 1) {
    const dirent = dirents[i];
    if (dirent.isFile() && ESMODULE_EXTENSIONS.includes(path.extname(dirent.name)))
      filePaths.push(path.join(dirPath, dirent.name));
    else if (dirent.isDirectory() && dirent.name !== 'node_modules')
      filePaths.push(...recursiveSearch(path.join(dirPath, dirent.name)));
  }
  return filePaths;
};

const search = (includePath: string): string[] => {
  const stat = fs.statSync(includePath);
  let filePaths: string[] = [];
  if (stat.isFile() && ESMODULE_EXTENSIONS.includes(path.extname(includePath))) {
    filePaths.push(path.normalize(includePath));
  } else if (stat.isDirectory()) {
    filePaths = recursiveSearch(includePath);
  }
  return filePaths;
};

const RESOLVE_PATTERN = /(import(?:.+from)? *["'])(.+)(["'])/g;

export const resolve = (moduleName: string): string => {
  for (let i = 0; i < map.length; i += 1) {
    const [regexp, resolvedName] = map[i];
    if (regexp.test(moduleName)) {
      return moduleName.replace(regexp, resolvedName);
    }
  }
  return moduleName;
};

const replacer = (_: string, before: string, moduleName: string, after: string): string =>
  before + resolve(moduleName) + after;

export const replace = (code: string): string => code.replace(RESOLVE_PATTERN, replacer);

export const execute = (includePath: string, isMinify = false, minifyOptions?: object) => {
  const filePaths = search(includePath);
  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const code = fs.readFileSync(filePath, 'utf8');
    const replacedCode = replace(code);
    if (isMinify) {
      minify(replacedCode, minifyOptions)
        .then((minifiedCode) => fs.promises.writeFile(filePath, minifiedCode.code!))
        .catch((error) => console.error(error));
    } else {
      fs.promises.writeFile(filePath, replacedCode).catch((error) => console.error(error));
    }
  }
};

export default { resolve, replace, execute };
