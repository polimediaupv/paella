
import { DomClass } from 'paella/core/dom';
import { getValidLayouts, getValidContentIds, getLayoutStructure } from 'paella/core/VideoLayout';
import { getVideoPlugin } from 'paella/core/VideoPlugin';

import 'styles/VideoContainer.css';

export async function getContainerBaseSize(player) {
    // TODO: In the future, this function can be modified to support different
    // aspect ratios, which can be loaded from the video manifest.
    return { w: 1280, h: 720 }
}

function getStreamWithContent(streamData, content) {
    const result = streamData.filter(sd => sd.content === content);
    return result.length >= 1 ? result[0] : null;
}

async function loadLayout(streams) {
    this._streams = streams;

    await this.updateLayout();
}

export default class VideoContainer extends DomClass {

    constructor(player, parent) {
        const baseVideoRectClass = "base-video-rect";

        const attributes = {
            "class": "video-container",
            "style": "position: relative;"
        };
        const children = `
            <div class="${ baseVideoRectClass }">
                <div class="background-container">video background</div>
            </div>
        `
        super(player, {attributes, children, parent});

        this._baseVideoRect = this.element.getElementsByClassName(baseVideoRectClass)[0];

        this._ready = false;

        this._layoutId = null;

        this._players = [];
    }

    get layoutId() {
        return this._layoutId;
    }

    get baseVideoRect() {
        return this._baseVideoRect;
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
            s.player = await s.videoPlugin.getVideoInstance(this.baseVideoRect);
            await s.player.load(s.stream);
            this._players.push(s.player);
        }

        // Load video layout
        loadLayout.apply(this, [streams]);
    }

    async updateLayout() {

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
        for (const key in this._streams) {
            const videoData = this._streams[key];
            videoData.player.video.style.display = "none";
        }

        // Conversion factors for video rect
        const baseSize = await getContainerBaseSize(this.player);
        const playerSize = this.player.containerSize;
        const wFactor = 100 / baseSize.w;
        const hFactor = 100 / baseSize.h;
        const playerRatio = playerSize.w / playerSize.h;
        const baseRatio = baseSize.w / baseSize.h; 
        const containerCurrentSize = playerRatio>baseRatio ?
            { w: playerSize.h * baseRatio, h: playerSize.h } :
            { w: playerSize.w, h: playerSize.w / baseRatio };

        this.baseVideoRect.style.width = containerCurrentSize.w;
        this.baseVideoRect.style.height = containerCurrentSize.h;

        layoutStructure?.videos?.forEach(async video => {
            const videoData = this._streams[video.content];
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

            //player.video.style.display = "block";
            player.video.style.position = "absolute";


            // TODO: Create theDOM element
        });
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

