import { VariableParser } from "./VariableParser";

export namespace Vortex {
    export interface Environment {
        variables?: Record<string, string | number>;
        headers?: Record<string, string | number>;
    }

    export interface RequestConfiguration extends RequestInit {
        path: string;
    }

    export class Client {
        constructor(
            protected parser: VariableParser,
            protected environment: Environment
        ) {
            this.parser = parser;
            this.parser.setVariables(environment.variables ?? {});
        }

        request({ path, ...configuration }: RequestConfiguration) {
            return fetch(this.parser.parse(path), configuration);
        }
    }
}
