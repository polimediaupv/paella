
import Plugin from '../core/Plugin';

export default class TestPlugin extends Plugin {
    get type() { return "test"; }
    get order() { return 2; }
    
    async isEnabled() {
        console.log("Test is enabled");
        return true;
    }

    async load() {
        console.log("Test plugin load");
        return true;
    } 
}
