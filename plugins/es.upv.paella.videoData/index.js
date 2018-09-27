paella.addDataDelegate('metadata', () => {
    return class VideoManifestMetadataDataDelegate extends paella.DataDelegate {
        read(context, params, onSuccess) {
            let metadata = paella.player.videoLoader.getMetadata();
            onSuccess(metadata[params], true);
        }

        write(context, params, value, onSuccess) {
            onSuccess({}, true);
        }

        remove(context, params, onSuccess) {
            onSuccess({}, true);
        }
    }
});

paella.addPlugin(function() {

    return class VideoDataPlugin extends paella.VideoOverlayButtonPlugin {
        
        getIndex() { return 10; }

        getSubclass() {
            return "videoData";
        }

        getAlignment() {
            return 'left';
        }

        getDefaultToolTip() { return ""; }

        checkEnabled(onSuccess) {
            // Check if enabled
            let plugin = paella.player.config.plugins.list["es.upv.paella.videoDataPlugin"];
            let exclude = (plugin && plugin.excludeLocations) || [];
            let excludeParent = (plugin && plugin.excludeParentLocations) || [];
            let excluded = exclude.some((url) => {
                let re = RegExp(url,"i");
                return re.test(location.href);
            });

            if (window!=window.parent) {
                excluded = excluded || excludeParent.some((url) => {
                    let re = RegExp(url,"i");
                    try {
                        return re.test(parent.location.href);
                    }
                    catch(e) {
                        // Cross domain error
                        return false;
                    }
                });
            }
            onSuccess(!excluded);
        }

        setup() {
            let title = document.createElement("h1");
            title.innerText = "";
            title.className = "videoTitle";
            this.button.appendChild(title);

            paella.data.read("metadata","title",function(data) {
                title.innerText = data;
            });
        }

        action(button) {
        }

        getName() {
            return "es.upv.paella.videoDataPlugin";
        }
    }
});