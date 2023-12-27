import { Vortex } from "./packages/Vortex";
import { VariableParser } from "./packages/VariableParser";
import { CLI } from "./packages/CLI";

import { APIFork } from "./createAPIProcess";
import { AppStorage } from "./packages/AppStorage";

const parent = APIFork.parent();

enum Commands {
    STORE = "store",
}

parent.listeners.onAPIReady = () => {
    const Parser = new VariableParser(/__(\w{1,})__/g);
    const Storage = new AppStorage();
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

        const cli = new CLI(Commands);

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
