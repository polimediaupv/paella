
import Plugin from '../core/Plugin';

export default class TestPlugin2 extends Plugin {
    get type() { return "test"; }
    get order() { return 3; }
    
    async isEnabled() {
        console.log("Test2 is enabled");
        return true;
    }

    async load() {
        console.log("Test2 plugin load");
        return true;
    } 
}
