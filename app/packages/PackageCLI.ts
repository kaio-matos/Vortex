import readline from "node:readline";

export class PackageCLI<T extends Record<string, string | number>> {
    rl: readline.Interface;

    constructor(
        protected enumerator: T,
        protected docs: Record<T[keyof T], string>
    ) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    help() {
        for (const [key, doc] of Object.entries(this.docs)) {
            console.info(`${key}: ${doc}\n`);
        }
    }

    question(handler: (command: T[keyof T], args: string[]) => void) {
        const qst = () => {
            this.rl.question("> ", (answer) => {
                const [command, ...args] = answer.split(" ");

                if (answer === "exit") {
                    process.exit(0);
                    return;
                }

                if (answer === "--help") {
                    this.help();
                    return;
                }

                Object.values(this.enumerator).forEach((value) => {
                    if (command === value) {
                        handler(command as T[keyof T], args);
                    }
                });

                qst();
            });
        };

        qst();
    }
}
