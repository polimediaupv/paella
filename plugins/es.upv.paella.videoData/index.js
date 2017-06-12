(function() {

    class VideoDataPlugin extends paella.VideoOverlayButtonPlugin {
        
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
                    return re.test(parent.location.href);
                });
            }
            onSuccess(!excluded);
        }

        setup() {
            let title = document.createElement("h1");
            title.innerHTML = "";
            title.className = "videoTitle";
            this.button.appendChild(title);

            paella.data.read("metadata","title",function(data) {
                title.innerHTML = data;
            });
        }

        action(button) {
        }

        getName() {
            return "es.upv.paella.videoDataPlugin";
        }
    }

    paella.plugins.videoDataPlugin = new VideoDataPlugin();

    class VideoManifestMetadataDataDelegate extends paella.DataDelegate {
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

    paella.dataDelegates.VideoManifestMetadataDataDelegate = VideoManifestMetadataDataDelegate;

})();