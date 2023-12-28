import { Vortex } from "./packages/Vortex";
import { PackageVariableParser } from "./packages/PackageVariableParser";
import { PackageCLI } from "./packages/PackageCLI";

import { APIFork } from "./createAPIProcess";
import { PackageStorage } from "./packages/PackageStorage";

const parent = APIFork.parent();

enum Commands {
    STORE = "store",
    STORE_CONFIG = "store-config",
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
        const VortexClient = new Vortex.Client(Parser, Storage);

        const cli = new PackageCLI(Commands);

        cli.question((command, args) => {
            const commands: Record<Commands, Function> = {
                [Commands.STORE]: () => VortexClient.store(args[0]),
                [Commands.STORE_CONFIG]: () => {
                    try {
                        const config = JSON.parse(
                            args[0]
                        ) as Vortex.EnvironmentConfiguration;
                        VortexClient.storeConfig(config);
                    } catch {
                        console.log("Please submit a valid json!");
                    }
                },
            };

            // VortexClient.request({
            //     path: "__baseUrl__/products",
            // }).then((v) => v.json().then(console.log));

            commands[command]();
        });
    }
};
