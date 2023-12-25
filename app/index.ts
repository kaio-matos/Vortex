import { Vortex } from "./packages/Vortex";
import { VariableParser } from "./packages/VariableParser";

import { fork } from "node:child_process";
import path from "node:path";

const api = fork(path.resolve(__dirname, "tools/fake-api/index"));

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
            baseUrl: "http://localhost:9292",
        },
        headers: {
            "Content-Type": "application/json",
        },
    });

    VortexClient.request({
        path: "__baseUrl__/products",
    }).then((v) => v.json().then(console.log));
}
