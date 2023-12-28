import { Vortex } from "./packages/Vortex";
import { PackageVariableParser } from "./packages/PackageVariableParser";
import { PackageCLI } from "./packages/PackageCLI";

import { APIFork } from "./createAPIProcess";
import { PackageStorage } from "./packages/PackageStorage";

const parent = APIFork.parent();

enum Commands {
    STORE = "store",
}

parent.listeners.onAPIReady = () => {
    const Parser = new PackageVariableParser(/__(\w{1,})__/g);
    const Storage = new PackageStorage();
    const VortexEnvironment = new Vortex.Environment(process.argv, process.env);
    if (VortexEnvironment.endpoint) {
        const VortexClient = new Vortex.Client(Parser, Storage);
        VortexClient.request({
            path: VortexEnvironment.endpoint,
        });
    } else {
        const VortexClient = new Vortex.Client(Parser, Storage, {
            variables: {
                baseUrl: "http://localhost:9292",
            },
            headers: {
                "Content-Type": "application/json",
            },
        });

        const cli = new PackageCLI(Commands);

        cli.question((command, args) => {
            const commands: Record<Commands, Function> = {
                [Commands.STORE]: () => VortexClient.store(args[0]),
            };
            // VortexClient.request({
            //     path: "__baseUrl__/products",
            // }).then((v) => v.json().then(console.log));

            commands[command]();
        });
    }
};
