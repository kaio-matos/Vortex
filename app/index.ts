import { Vortex } from "./packages/Vortex";
import { VariableParser } from "./packages/VariableParser";

const vortex_client = new Vortex.Client(new VariableParser(/__(\w{1,})__/g), {
    variables: {
        baseUrl: "https://dummyjson.com",
    },
});

vortex_client.request({
    path: "__baseUrl__/products",
});
