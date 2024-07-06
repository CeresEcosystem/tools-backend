import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';

export const createFile = (
  path: string,
  fileName: string,
  data: string | Buffer,
): Promise<void> => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return writeFile(`${path}/${fileName}`, data);
};
