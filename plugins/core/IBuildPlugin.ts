import {
    Program,
    ProgramBuilder
} from "brighterscript";

import { PluginContext } from "./PluginContext.ts";

export interface IBuildPlugin {
    name: string;

    /** BrighterScript's beforeProgramCreate hook is synchronous; keep this hook synchronous too. */
    beforeBuild?(
        context: PluginContext,
        programBuilder: ProgramBuilder
    ): void;

    afterProgramCreate?(program: Program): void;

    afterFilesLoaded?(
        context: PluginContext,
        program: Program
    ): void | Promise<void>;

    /** BrighterScript emits afterProgramTranspile synchronously. */
    afterTranspile?(
        context: PluginContext,
        program: Program
    ): void;
}
