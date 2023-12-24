export class VariableParser {
    protected variables: Record<string, string | number> = {};

    constructor(protected pattern: RegExp) {}

    setVariables(variables: Record<string, string | number>) {
        this.variables = variables;
    }

    parse(text: string): string {
        const matches = [...text.matchAll(this.pattern)];
        let result = text;

        for (const match of matches) {
            const matchedString = match[0];
            const matchedKey = match[1];
            const variable = this.variables?.[matchedKey];

            result = result.replace(matchedString, String(variable));
        }

        return result;
    }
}
