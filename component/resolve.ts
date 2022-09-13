import fs from 'fs';
import path from 'path';
import { minify } from 'terser';

import { map } from './importmap.js';
import { isAMD, convertImportStatement } from './amd.js';

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

export const resolve = (moduleName: string): string => {
  for (let i = 0; i < map.length; i += 1) {
    const [regexp, resolvedName] = map[i];
    if (regexp.test(moduleName)) return moduleName.replace(regexp, resolvedName);
  }
  return moduleName;
};

const TARGET_PATTERN =
  /(import(?:.+?from)? *)?(["'])(.*?)(?<!\\)\2|`[^]*?(?<!\\)`|\/\/.*?\n|\/\*[^]*?\*\//g;

type CapturedGroup = [string?, string?, string?];
export type ImportStatement = [string, string, string];

const isImportStatement = (capturedGroup: CapturedGroup): capturedGroup is ImportStatement =>
  typeof capturedGroup[0] === 'string';

const replacer = (whole: string, ...capturedGroup: CapturedGroup): string => {
  if (isImportStatement(capturedGroup)) {
    const [identifier, quotationMark, moduleName] = capturedGroup;
    const resolvedName = resolve(moduleName);
    return isAMD(resolvedName)
      ? convertImportStatement([identifier, quotationMark, resolvedName])
      : `${identifier}${quotationMark}${resolvedName}${quotationMark}`;
  }
  return whole;
};

export const replace = (code: string): string => code.replace(TARGET_PATTERN, replacer);

export const execute = (includePath: string, shouldMinify = false, minifyOptions?: object) => {
  const filePaths = search(includePath);
  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const code = fs.readFileSync(filePath, 'utf8');
    const replacedCode = replace(code);
    if (shouldMinify) {
      minify(replacedCode, minifyOptions)
        .then((minifiedCode) => fs.promises.writeFile(filePath, minifiedCode.code!))
        .catch((error) => console.error(error));
    } else {
      fs.promises.writeFile(filePath, replacedCode).catch((error) => console.error(error));
    }
  }
};

export default { resolve, replace, execute };
