export class Environment {
    static get getEnvironment() {
        if (typeof Bun !== "undefined")
            return "bun";
        if (typeof Deno !== "undefined")
            return "deno";
        if (typeof process !== "undefined" && process.versions?.node)
            return "node";
        return "unknown";
    }
}
export const runtime = Environment.getEnvironment;
