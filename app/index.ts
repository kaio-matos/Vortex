import { Vortex } from "./packages/Vortex";
import { VariableParser } from "./packages/VariableParser";

const Parser = new VariableParser(/__(\w{1,})__/g);

const VortexEnvironment = new Vortex.Environment(process.argv, process.env);

if (VortexEnvironment.endpoint) {
    const VortexClient = new Vortex.Client(Parser);
    VortexClient.request({
        path: VortexEnvironment.endpoint,
    });
} else {
    const VortexClient = new Vortex.Client(Parser, {
        variables: {
            baseUrl: "https://dummyjson.com",
        },
    });
    VortexClient.request({
        path: "__baseUrl__/products",
    });
}
