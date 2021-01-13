

const s_pluginClasses = [];
const s_pluginInstances = {};

export function registerPlugins(config) {
    // If the s_pluginClasses array is not empty, the plugins have already been registered
    if (s_pluginClasses.length !== 0) return;

    // Import plugins
    const context = require.context('../plugins', true, /\.js/);
    context.keys().forEach(key => {
        const module = context(key);
        const PluginClass = module.default;
        const pluginInstance = new PluginClass(config,key.substring(2,key.length - 3));
        const type = pluginInstance.type;
        s_pluginClasses[key] = PluginClass;
        s_pluginInstances[type] = s_pluginInstances[type] || [];
        s_pluginInstances[type].push(pluginInstance);
        
    });

    console.debug("Plugins have been registered:")

    // Sort plugins
    for (const type in s_pluginInstances) {
        s_pluginInstances[type].sort((a,b) => a.order - b.order);
        s_pluginInstances[type].forEach(p => console.debug(`type: ${type}, name: ${p.name}`));
    }
}

export function getPluginsOfType(type) {
    return s_pluginInstances[type];
}

export async function loadPluginsOfType(playerInstance,type) {
    s_pluginInstances[type]?.forEach(async (plugin) => {
        const enabled = await plugin.isEnabled(playerInstance);
        if (enabled) {
            await plugin.load(playerInstance);
        }
    })
}

export default class Plugin {
    constructor(config,name) {
        this._config = config.plugins[this.name];
        this._name = name;
    }

    get config() { return this._config; }

    get type() { return "none"; }

    get order() { return 0; }
    
    get name() { return this._name; }

    async isEnabled(playerInstance) {
        return true;
    }

    async load(playerInstance) {

    }
}