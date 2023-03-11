import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';

export const createFile = async (
  path: string,
  fileName: string,
  data: string,
): Promise<void> => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return await writeFile(`${path}/${fileName}`, data);
};
