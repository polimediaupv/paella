
import { DomClass } from './dom';
import { getValidLayouts, getValidContentIds, getLayoutStructure } from './VideoLayout';
import { getVideoPlugins } from './VideoPlugin';

function getStreamWithContent(streamData, content) {
    const result = streamData.filter(sd => sd.content === content);
    return result.length >= 1 ? result[0] : null;
}

function loadLayout() {
    // TODO: load the selected layout

    // Current layout: if not selected, load de default layout
    if (!this._layoutId) {
        // TODO: check if the default layout can be applied to the stream data
    }

    const validLayouts = getValidLayouts(this.player, this._streamData);

    //console.log(validLayouts);
    const validIds = getValidContentIds(this.player, this._streamData);
    console.log(validIds);

    // TODO: get the selected layout
    const selectedContent = validIds[1];
    const layoutStructure = getLayoutStructure(this.player, this._streamData, selectedContent);

    console.log(layoutStructure);
    // validLayouts.forEach(lo => {
    //     console.log(lo.getValidContentIds(streamData));
    // })
    
    layoutStructure?.videos?.forEach(video => {
        const stream = getStreamWithContent(this._streamData, video.content);
        console.log(video);
        console.log(stream);

        // TODO: select source (mp4, hls, image...)
        const source = stream.sources.hls || stream.sources.mp4 || stream.sources.images;
        const videoAspectRatio = 16/9;  // TODO: Get video aspect ratio

        // TODO: Get aspect ratio
        let difference = Number.MAX_VALUE;
        let resultRect = null;
        video.rect.forEach((videoRect) => {
            const aspectRatioData = /^(\d+.?\d*)\/(\d+.?\d*)$/.exec(videoRect.aspectRatio);
            const rectAspectRatio = aspectRatioData ? Number(aspectRatioData[1]) / Number(aspectRatioData[2]) : 1;
            const d = Math.abs(videoAspectRatio - rectAspectRatio);
            if (d < difference) {
                resultRect = videoRect;
                difference = d;
            }
        });

        console.log(resultRect);


        // TODO: Select video rect with aspect ratio

        // TODO: Create the DOM element
    });
}

export default class VideoContainer extends DomClass {

    constructor(player, parent) {
        const attributes = {
            "class": "video-container"
        };
        const children = `<div class="background-container">video background</div>`
        super(player, {attributes, children, parent});

        this._ready = false;

        this._layoutId = null;
    }

    get layoutId() {
        return this._layoutId;
    }

    async load(streamData) {
        this._ready = true;

        this._streamData = streamData;

        console.log("Load videos");

        // TODO: load videos
        const videoPlugins = getVideoPlugins(this.player);
        console.log(videoPlugins);

        loadLayout.apply(this);
    }

    get ready() {
        return this._ready;
    }

    async play() {

    }

    async pause() {

    }

    async stop() {

    }
}

