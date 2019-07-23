
paella.addPlugin(() => {
    return class RelatedVideoPlugin extends paella.EventDrivenPlugin {
        getName() { return "es.upv.paella.relatedVideosPlugin"; }

        checkEnabled(onSuccess) {
            onSuccess(true);
        }

        setup() {

        }

        getEvents() { return [
            paella.events.endVideo,
            paella.events.timeUpdate
        ];}

        onEvent(eventType, params) {
            console.log(eventType);
        }
    }
});

