export class PackageEnvironment<Flags extends object> {
    runtime: string;
    executable: string;
    app_arguments: string[];
    app_flags: Flags;

    constructor(protected argv: string[], protected env: NodeJS.ProcessEnv) {
        this.runtime = argv[0];
        this.executable = argv[1];
        const app_arguments = argv.slice(2);

        this.app_arguments = app_arguments.filter((v) => !v.includes("--"));
        this.app_flags = this.parseFlags(app_arguments);
    }

    private parseFlags(app_arguments: string[]) {
        let flagList = app_arguments.filter((v) => v.includes("--"));
        flagList = flagList.map((v) => v.replace("--", ""));

        return flagList
            .map((v) => v.split("="))
            .reduce<Flags>(
                (prev, [flag, value]) => ({
                    ...prev,
                    [flag]: value,
                }),
                {} as Flags
            );
    }
}
