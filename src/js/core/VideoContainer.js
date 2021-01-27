
import { DomClass } from './dom';
import { getValidLayouts, getValidContentIds, getLayoutStructure } from './VideoLayout';
import { getVideoPlugin } from './VideoPlugin';

function getStreamWithContent(streamData, content) {
    const result = streamData.filter(sd => sd.content === content);
    return result.length >= 1 ? result[0] : null;
}

async function loadLayout(streams) {
    // TODO: load the selected layout
    console.log(streams);

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

    // Hide all video players
    for (const key in streams) {
        const videoData = streams[key];
        videoData.player.video.style.display = "none";
    }
    
    // Conversion factors for video rect
    const wFactor = 100 / 1280;
    const hFactor = 100 / 720;

    layoutStructure?.videos?.forEach(async video => {
        const videoData = streams[video.content];
        const { stream } = videoData;
        const { player } = videoData;
        console.log(video);
        console.log(player);
        console.log(stream);

        const res = await player.getDimensions();
        const videoAspectRatio = res.w / res.h;  // TODO: Get video aspect ratio

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


        // TODO: apply rectangle to player

        player.video.style.display = "block";
        player.video.style.position = "absolute";
 

        // TODO: Create theDOM element
    });
}

export default class VideoContainer extends DomClass {

    constructor(player, parent) {
        const attributes = {
            "class": "video-container",
            "style": "position: relative;"
        };
        const children = `<div class="background-container">video background</div>`
        super(player, {attributes, children, parent});

        this._ready = false;

        this._layoutId = null;

        this._players = [];
    }

    get layoutId() {
        return this._layoutId;
    }

    async load(streamData) {
        this._ready = true;

        this._streamData = streamData;

        console.debug("Loading streams and layout");

        // Find video plugins for each stream
        const streams = {};
        this._streamData.forEach(stream => {
            const videoPlugin = getVideoPlugin(this.player, stream);
            if (!videoPlugin) {
                throw Error(`Incompatible stream type: ${ stream.content }`)
            }
            streams[stream.content] = {
                stream,
                videoPlugin
            };
        });

        // Load players and stream data, and store the players in
        // this.players attribute
        for (const content in streams) {
            const s = streams[content];
            s.player = await s.videoPlugin.getVideoInstance(this.element);
            await s.player.load(s.stream);
            this._players.push(s.player);
        }

        // Load video layout
        loadLayout.apply(this, [streams]);
    }

    get ready() {
        return this._ready;
    }

    get players() {
        return this._players;
    }

    async play() {

    }

    async pause() {

    }

    async stop() {

    }
}

