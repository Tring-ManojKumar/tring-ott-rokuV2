import * as path from 'path';
import * as fs from 'fs';

export function cwdPath(input?: string): string {
    const baseDir = (process as any).bscCwd ?? process.cwd();
    const fullPath = input ? path.resolve(baseDir, input) : baseDir;
    return fullPath.replace(/\\/g, '/'); // normalize to POSIX-style for globbing
}

export function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(cwdPath(filePath)).toString());
}
