
// Change this data delegate to read the related videos form an external source
// Default behaviour is to get the related videos from the data.json file

paella.addDataDelegate("relatedVideos",() => {
    return class RelatedVideoDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            let videoMetadata = paella.player.videoLoader.getMetadata();
            if (videoMetadata.related) {
                onSuccess(videoMetadata.related);
            }
        }
    }
});

paella.addPlugin(() => {
    return class RelatedVideoPlugin extends paella.EventDrivenPlugin {
        getName() { return "es.upv.paella.relatedVideosPlugin"; }

        checkEnabled(onSuccess) {
            paella.data.read('relatedVideos', {id:paella.player.videoIdentifier}, (data) => {
                this._relatedVideos = data;
                onSuccess(Array.isArray(this._relatedVideos) &&  this._relatedVideos.length > 0);
            });
        }

        setup() {

        }

        getEvents() { return [
            paella.events.ended,
            paella.events.timeUpdate,
            paella.events.play,
            paella.events.seekTo,
            paella.events.seekToTime,
        ];}

        onEvent(eventType, params) {
            if (eventType == paella.events.ended) {
                this.showRelatedVideos();
            }
            else {
                this.hideRelatedVideos();
            }
        }

        showRelatedVideos() {
            this.hideRelatedVideos();
            let container = document.createElement('div');
            container.className = "related-video-container";

            function getRelatedVideoLink(data,className) {
                let linkContainer = document.createElement("a");
                linkContainer.className = "related-video-link " + className;
                linkContainer.innerHTML = `
                <img src="${ data.thumb }" alt="">
                <p>${ data.title }</p>
                `;
                linkContainer.addEventListener("click", function() {
                    try {
                        if (window.self !== window.top) {
                            window.parent.document.dispatchEvent(new CustomEvent('paella-change-video', { detail: data }));
                        }
                    }
                    catch (e) {

                    }
                    location.href = data.url;
                });
                return linkContainer;
            }

            this._messageContainer = paella.player.videoContainer.overlayContainer.addElement(container, {
                left: 0,
                right: 0,
                width: 1280,
                height: 720
            });
            switch (this._relatedVideos.length) {
            case 1:
                container.appendChild(getRelatedVideoLink(this._relatedVideos[0],'related-video-single'));
                break;
            case 2:
            default:
                container.appendChild(getRelatedVideoLink(this._relatedVideos[0],'related-video-dual-1'));
                container.appendChild(getRelatedVideoLink(this._relatedVideos[1],'related-video-dual-2'));
                break;
            }
            
            paella.player.videoContainer.attenuationEnabled = true;
        }

        hideRelatedVideos() {
            if (this._messageContainer) {
                paella.player.videoContainer.overlayContainer.removeElement(this._messageContainer);
                this._messageContainer = null;

                paella.player.videoContainer.attenuationEnabled = false;
            }
        }
    }
});

