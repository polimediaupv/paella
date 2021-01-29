
import { DomClass } from 'paella/core/dom';
import { getValidLayouts, getValidContentIds, getLayoutStructure } from 'paella/core/VideoLayout';
import { getVideoPlugin } from 'paella/core/VideoPlugin';
import StreamProvider from 'paella/core/StreamProvider';

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

async function loadLayout() {
    console.log("Esto son los streams:");
    console.log(this.streamProvider.streams);
    await this.updateLayout(this.streamProvider.streams);
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
        
        this._streamProvider = new StreamProvider(this.player, this.baseVideoRect);
    }

    get layoutId() {
        return this._layoutId;
    }

    get baseVideoRect() {
        return this._baseVideoRect;
    }
    
    get streamProvider() {
        return this._streamProvider;
    }

    async load(streamData) {
        
        await this.streamProvider.load(streamData);
        
        this._ready = true;
        
        // Load video layout
        loadLayout.apply(this);
    }

    async updateLayout() {

        // Current layout: if not selected, load de default layout
        if (!this._layoutId) {
            // TODO: check if the default layout can be applied to the stream data
        }

        const validLayouts = getValidLayouts(this.player, this.streamProvider.streamData);

        //console.log(validLayouts);
        const validIds = getValidContentIds(this.player, this.streamProvider.streamData);
        console.log(validIds);

        // TODO: get the selected layout
        const selectedContent = validIds[0];
        const layoutStructure = getLayoutStructure(this.player, this.streamProvider.streamData, selectedContent);

        // Hide all video players
        for (const key in this.streamProvider.streams) {
            const videoData = this.streamProvider.streams[key];
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
            const videoData = this.streamProvider.streams[video.content];
            const { stream } = videoData;
            const { player } = videoData;
            console.log(video);
            console.log(player);
            console.log(stream);

            const res = await player.getDimensions();
            const videoAspectRatio = res.w / res.h;  // TODO: Get video aspect ratio
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

            player.video.style.display = "block";
            player.video.style.position = "absolute";
            player.video.style.left = `${ resultRect.left * wFactor }%`;
            player.video.style.top = `${ resultRect.top * wFactor }%`;
            player.video.style.width = `${ resultRect.width * wFactor }%`;
            player.video.style.height = `${ resultRect.height * hFactor }%`;
            
        });
        
        // TODO: apply structure to buttons and other elements
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

