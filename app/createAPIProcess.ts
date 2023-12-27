import { Fork } from "./tools/fork";
import path from "node:path";

export const APIFork = new Fork(path.resolve(__dirname, "fake-api.ts"), {
    onAPIReady() {},
});
