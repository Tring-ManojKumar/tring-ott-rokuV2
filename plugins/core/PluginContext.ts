import { ProgramBuilder } from "brighterscript";

export interface PluginContext {
    brand: string;
    env: string;
    debug: boolean;
    cwd: string;

    programBuilder: ProgramBuilder;

    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}