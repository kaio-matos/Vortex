import { VariableParser } from "./VariableParser";
import { Environment as PackageEnvironment } from "./Environment";

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
        endpoint: URL | undefined;
        flags: Flags;

        constructor(
            protected argv: string[],
            protected env: NodeJS.ProcessEnv
        ) {
            const Env = new PackageEnvironment<Flags>(argv, env);

            try {
                this.endpoint = new URL(Env.app_arguments[0]);
            } catch {}
            this.flags = Env.app_flags;
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
