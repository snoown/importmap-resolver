import { ImportStatement } from './resolve.js';

export const isAMD = (moduleName: string) => /[&\-./=?_][au]md(?:[&\-./=_]|$)/.test(moduleName);

export const convertImportStatement = (importStatement: ImportStatement): string => {
  const [identifier, quotationMark, moduleName] = importStatement;
  const parsedIdentifier = /^import +(.+?) *, *(?:({.+?})|\* *as +(.+?)) *from *$/.exec(identifier);
  let convertedStatemet = `import ${quotationMark}${moduleName}${quotationMark}`;
  if (parsedIdentifier !== null) {
    convertedStatemet += '; const ';
    const [, defaultExport, namedExport, allImport] = parsedIdentifier;
    if (typeof namedExport !== 'undefined') convertedStatemet += namedExport.replace(/ as/, ':');
    else if (typeof allImport !== 'undefined') convertedStatemet += allImport;
    convertedStatemet += ` = ${defaultExport}`;
  }
  return convertedStatemet;
};

export default { isAMD, convertImportStatement };
