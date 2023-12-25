import { VariableParser } from "./VariableParser";
import { Environment as PackageEnvironment } from "./Environment";
import { argv, env } from "process";

export namespace Vortex {
    export interface Configuration {
        variables?: Record<string, string | number>;
        headers?: Record<string, string | number>;
    }

    export interface RequestConfiguration extends RequestInit {
        path: string | URL;
    }

    export interface Flags {}

    export class Environment {
        private _environment: PackageEnvironment<Flags>;

        endpoint: URL | undefined;

        constructor(
            protected rawArgv: string[],
            protected rawEnv: NodeJS.ProcessEnv
        ) {
            this._environment = new PackageEnvironment<Flags>(argv, env);

            try {
                this.endpoint = new URL(this._environment.app_arguments[0]);
            } catch {}
        }

        get flags() {
            return this._environment.app_flags;
        }
    }

    export class Client {
        constructor(
            protected parser: VariableParser,
            protected config?: Configuration
        ) {
            this.parser.setVariables(config?.variables ?? {});
        }

        request({ path, ...configuration }: RequestConfiguration) {
            if (path instanceof URL) {
                return fetch(this.parser.parse(path.href), configuration);
            }

            return fetch(this.parser.parse(path), configuration);
        }
    }
}
