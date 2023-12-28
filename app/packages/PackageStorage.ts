import path from "node:path";
import fs from "fs";

export class PackageStorage {
    constructor(protected path = ".vortex") {}

    store<T extends object>(folder: string, filename: string, data: T) {
        try {
            fs.mkdirSync(path.resolve(this.path, folder), { recursive: true });
        } catch {}
        const fd = fs.openSync(path.resolve(this.path, folder, filename), "w");
        fs.closeSync(fd);
        fs.writeFile(
            path.resolve(this.path, folder, filename),
            JSON.stringify(data),
            (err) => (err ? console.error(err) : null)
        );
        return data;
    }

    read<T>(folder: string, filename: string): T | null {
        try {
            const buffer = fs.readFileSync(
                path.resolve(this.path, folder, filename)
            );

            const jsonString = buffer.toString();
            return JSON.parse(jsonString);
        } catch (err) {
            return null;
        }
    }
}
