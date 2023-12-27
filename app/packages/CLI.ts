import { url } from "node:inspector";
import readline from "node:readline";

export class CLI<T extends object> {
    rl: readline.Interface;

    constructor(protected enumerator: T) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    question(handler: (command: T[keyof T], args: string[]) => void) {
        const rl = this.rl;
        const enumerator = this.enumerator;

        function qst() {
            rl.question("> ", (answer) => {
                const [command, ...args] = answer.split(" ");

                Object.values(enumerator).forEach((value) => {
                    if (command === value) {
                        handler(command as T[keyof T], args);
                    }
                });

                qst();
            });
        }

        qst();
    }
}
