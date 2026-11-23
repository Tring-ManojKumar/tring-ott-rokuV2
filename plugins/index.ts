import { PluginManager } from "./core/PluginManager.ts";

import { AppConfigPlugin } from "./AppConfigPlugin.ts";

export function createPluginManager(): PluginManager {

    const manager = new PluginManager();

    manager.register(
        new AppConfigPlugin()
    );

    return manager;
}
