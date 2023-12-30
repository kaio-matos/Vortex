import { Vortex } from "./packages/Vortex";
import { PackageVariableParser } from "./packages/PackageVariableParser";
import { PackageCLI } from "./packages/PackageCLI";

import { APIFork } from "./tools/fake-api/createAPIProcess";
import { PackageStorage } from "./packages/PackageStorage";

const parent = APIFork.parent();

enum Commands {
    STORE = "store",
    STORE_CONFIG = "store-config",
    REQUEST = "request",
}

const docs: Record<Commands, string> = {
    [Commands.STORE]: "Stores a request configuration",
    [Commands.STORE_CONFIG]: "Stores a global configuration",
    [Commands.REQUEST]: "Send an request for the specified endpoint",
};

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

        const cli = new PackageCLI(Commands, docs);

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
                [Commands.REQUEST]: async () => {
                    const path = args[0];

                    VortexClient.request({
                        path,
                    });
                },
            };

            commands[command]();
        });
    }
};
