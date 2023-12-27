import path from "node:path";
import fs from "fs";

export class AppStorage {
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
    }
}
