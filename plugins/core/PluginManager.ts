import {
    Program,
    ProgramBuilder
} from "brighterscript";

import { IBuildPlugin } from "./IBuildPlugin.ts";
import { PluginContext } from "./PluginContext.ts";

export class PluginManager {

    private plugins: IBuildPlugin[] = [];

    register(plugin: IBuildPlugin): void {
        this.plugins.push(plugin);
    }

    getPlugins(): IBuildPlugin[] {
        return this.plugins;
    }

    beforeBuild(
        context: PluginContext,
        programBuilder: ProgramBuilder
    ): void {

        for (const plugin of this.plugins) {

            context.log(
                `[PluginManager] beforeBuild → ${plugin.name}`
            );

            plugin.beforeBuild?.(
                context,
                programBuilder
            );
        }
    }

    async afterFilesLoaded(
        context: PluginContext,
        program: Program
    ): Promise<void> {

        for (const plugin of this.plugins) {

            context.log(
                `[PluginManager] afterFilesLoaded → ${plugin.name}`
            );

            await plugin.afterFilesLoaded?.(
                context,
                program
            );
        }
    }

    afterProgramCreate(program: Program): void {
        for (const plugin of this.plugins) plugin.afterProgramCreate?.(program);
    }

    afterTranspile(
        context: PluginContext,
        program: Program
    ): void {

        for (const plugin of this.plugins) {

            context.log(
                `[PluginManager] afterTranspile → ${plugin.name}`
            );

            plugin.afterTranspile?.(
                context,
                program
            );
        }
    }
}
