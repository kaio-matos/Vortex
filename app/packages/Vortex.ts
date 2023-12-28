import { PackageVariableParser } from "./PackageVariableParser";
import { PackageEnvironment } from "./PackageEnvironment";
import { PackageStorage } from "./PackageStorage";

export namespace Vortex {
    export interface EnvironmentConfiguration {
        headers?: Record<string, string>;
        variables?: Record<string, string | number>;
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
            this._environment = new PackageEnvironment<Flags>(rawArgv, rawEnv);

            try {
                this.endpoint = new URL(this._environment.app_arguments[0]);
            } catch {}
        }

        get flags() {
            return this._environment.app_flags;
        }
    }

    export class Client {
        headers?: HeadersInit;

        constructor(
            protected parser: PackageVariableParser,
            protected storage: PackageStorage
        ) {
            let data = storage.read<EnvironmentConfiguration>(
                "config",
                "config.json"
            );

            if (!data) {
                data = this.storeConfig({
                    headers: {
                        "Content-Type": "application/json",
                    },
                    variables: {
                        baseUrl: "http://localhost:9292",
                    },
                });
            }

            this.headers = data?.headers;
            this.parser.setVariables({ ...data?.variables });
        }

        request({ path, ...configuration }: RequestConfiguration) {
            if (path instanceof URL) {
                return fetch(this.parser.parse(path.href), {
                    ...configuration,
                    headers: {
                        ...this.headers,
                        ...configuration.headers,
                    },
                });
            }

            return fetch(this.parser.parse(path), {
                ...configuration,
                headers: {
                    ...this.headers,
                    ...configuration.headers,
                },
            });
        }

        store(url: string) {
            if (!url) throw new Error("You must write a valid endpoint!");

            const parsedURL = new URL(this.parser.parse(url));

            const folder = parsedURL.pathname.slice(1);
            const file = (parsedURL.pathname.split("/").pop() ?? "_") + ".json";

            this.storage.store(folder, file, {
                url,
            });
        }

        storeConfig(data: EnvironmentConfiguration) {
            const config = this.storage.store("config", "config.json", data);
            this.headers = config.headers;
            if (config.variables) {
                this.parser.setVariables(config.variables);
            }
            return data;
        }
    }
}
