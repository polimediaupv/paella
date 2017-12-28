paella.addPlugin(function() {

    return class Track4KPlugin extends paella.EventDrivenPlugin {
        getName() { return "es.upv.paella.track4kPlugin"; }
        getEvents() {
            return [ paella.events.timeupdate ]
        }
        onEvent(eventType) {
            if (eventType==paella.events.timeupdate) {
                console.log("Hola");
            }
        }
    }
});

