
import Plugin, { getPluginsOfType } from "./Plugin";


export function getValidLayouts(player, streamData) {
    // Find the valid layouts that matches the streamData content
    const result = getPluginsOfType(player, "layout")
        .filter(layout => layout.canApply(streamData));
    return result;
}

export default class VideoLayout extends Plugin {
    
    get type() { return "layout"; }

    // Return the layout identifier, for example, presenter-presentation
    get identifier() { return "default"; }

    // Return the array of valid content in the configuration of the plugin
    get validContent() {
        return [];
    }

    canApply(streamData) {
        // Check if the streamData can be applied to this layout
        // TODO: Check de configuration file to get the valid content
        return false;
    }

}
