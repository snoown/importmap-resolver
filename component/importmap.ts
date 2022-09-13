import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const FILENAME_PRIORITY = ['.importmap.yaml', '.importmap.yml'];

const recursiveSearch = (absoluteDirPath: string): string => {
  const dirents = fs.readdirSync(absoluteDirPath, { withFileTypes: true });
  const fileNames: string[] = [];
  for (let i = 0; i < dirents.length; i += 1) {
    const dirent = dirents[i];
    if (dirent.isFile()) fileNames.push(dirent.name);
  }

  for (let i = 0; i < FILENAME_PRIORITY.length; i += 1) {
    const mapFileName = FILENAME_PRIORITY[i];
    if (fileNames.includes(mapFileName)) return path.join(absoluteDirPath, mapFileName);
  }

  return absoluteDirPath === path.parse(absoluteDirPath).root
    ? ''
    : recursiveSearch(path.dirname(absoluteDirPath));
};

const search = (): string => recursiveSearch(process.cwd());

const isRecord = (record: [string, any]): record is [string, string] =>
  typeof record[1] === 'string';

const load = (): [RegExp, string][] => {
  const filePath = search();
  const map: [RegExp, string][] = [];
  if (filePath !== '') {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = Object.entries(yaml.load(data) as Record<string, any>);
    for (let i = 0; i < parsedData.length; i += 1) {
      const record = parsedData[i];
      if (isRecord(record)) map.push([new RegExp(`^${record[0]}$`), record[1]]);
      else throw new TypeError('The importmap contains invalid value');
    }
  }
  return map;
};

export const map = load();

export default { map };
