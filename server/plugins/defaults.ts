import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const neededFolders = ['/data/images/tags'];
const base = process.cwd();

export default defineNitroPlugin((nitroApp) => {
    console.log('Creating base folders ...');

    for (const folder of neededFolders) {
        const folderPath = join(base, folder);

        if (!existsSync(folderPath)) {
            console.log(`Creating folder: ${folderPath}`);
            mkdirSync(folderPath, { recursive: true });
        }
    }

    console.log('Base folders created!');
});
