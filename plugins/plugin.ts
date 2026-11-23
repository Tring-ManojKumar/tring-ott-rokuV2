import { CompilerPlugin, FinalizedBsConfig, Program, ProgramBuilder } from 'brighterscript';
import { PluginOptions } from './pluginoptions.ts';
import { createPluginManager } from './index.ts';
import { PluginContext } from './core/PluginContext.ts';

interface AllFilesBuilder {
    _loadAllFilesAST?: () => Promise<void>;
    loadAllFilesAST: () => Promise<void>;
    options: FinalizedBsConfig;
    program: Program;
    plugins: { emit: (id: string, data: any) => void };
}

class Plugin implements CompilerPlugin {
    name: string = 'plugin';
    private pluginManager = createPluginManager();
    private programBuilder?: ProgramBuilder;

    beforeProgramCreate(programBuilder: ProgramBuilder) {
        try {
            const pluginOptions = new PluginOptions(programBuilder);
            pluginOptions.getProgramOptions();
            this.programBuilder = programBuilder;
            this.pluginManager.beforeBuild(this.createContext(programBuilder), programBuilder);
            this.patchProgramBuilderForAfterFilesLoaded(programBuilder);
        } catch (e) {
            const error = e as Error;
            programBuilder.logger.error(error.stack ?? error.message);
            throw error;
        }
    }

    patchProgramBuilderForAfterFilesLoaded(programBuilder: ProgramBuilder) {
        const allFilesBuilder = programBuilder as unknown as AllFilesBuilder;
        allFilesBuilder._loadAllFilesAST = allFilesBuilder.loadAllFilesAST;
        const plugin = this;
        allFilesBuilder.loadAllFilesAST = async function () {
            await this._loadAllFilesAST?.();
            await plugin.pluginManager.afterFilesLoaded(plugin.createContext(programBuilder), this.program);
        };
    }

    afterProgramTranspile(program: Program) {
        if (!this.programBuilder) {
            throw new Error('Plugin manager was not initialized before transpilation');
        }
        this.pluginManager.afterTranspile(this.createContext(this.programBuilder), program);
    }

    afterProgramCreate(program: Program) {
        // BrighterScript/Rooibos cache the manifest during program creation.
        // Load the already-resolved consumer manifest before downstream hooks.
        this.pluginManager.afterProgramCreate(program);
    }

    private createContext(programBuilder: ProgramBuilder): PluginContext {
        const options = programBuilder.options as FinalizedBsConfig & {
            brand?: string;
            market?: string;
            env?: string;
            debug?: boolean;
        };
        return {
            brand: options.market ?? options.brand ?? 'default',
            env: options.env ?? 'prod',
            debug: !!options.debug,
            cwd: options.cwd,
            programBuilder,
            log: message => programBuilder.logger.log(message),
            warn: message => programBuilder.logger.warn(message),
            error: message => programBuilder.logger.error(message)
        };
    }
}

export default () => new Plugin();
