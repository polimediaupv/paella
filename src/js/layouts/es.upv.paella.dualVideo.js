import VideoLayout from '../core/VideoLayout';

let layout = 0;
const layouts = [
    // First layout: side by side
    {
        videos: [
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",width:560,height:315,top:198,left:712},
                    {aspectRatio:"16/10",width:560,height:350,top:186,left:712},
                    {aspectRatio:"4/3",width:560,height:420,top:153,left:712},
                    {aspectRatio:"5/3",width:560,height:336,top:186,left:712},
                    {aspectRatio:"5/4",width:560,height:448,top:140,left:712}
                ],
                visible:true,
                layer:1
            },
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",width:688,height:387,top:166,left:10},
                    {aspectRatio:"16/10",width:688,height:430,top:148,left:10},
                    {aspectRatio:"4/3",width:688,height:516,top:111,left:10},
                    {aspectRatio:"5/3",width:690,height:414,top:154,left:10},
                    {aspectRatio:"5/4",width:690,height:552,top:96,left:10}
                ],
                visible:true,
                layer:"1"
            }
        ],
        buttons: [
            {
                rect: { left: 682, top: 565, width: 45, height: 45 },
                label:"Switch",
                icon:"icon_rotate.svg",
                layer: 2
            },
            {
                rect: { left: 682, top: 515, width: 45, height: 45 },
                label:"Minimize",
                icon:"minimize.svg",
                layer: 2
            }
        ]
    },

    // Second layout: PIP left
    {
        videos:[
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                    {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                    {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                    {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                    {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
                ],
                visible:true,
                layer:1
            },
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",left:50,top:470,width:350,height:197},
                    {aspectRatio:"16/10",left:50,top:448,width:350,height:219},
                    {aspectRatio:"5/3",left:50,top:457,width:350,height:210},
                    {aspectRatio:"5/4",left:50,top:387,width:350,height:280},
                    {aspectRatio:"4/3",left:50,top:404,width:350,height:262}
                ],
                visible:true,
                layer:2
            }
        ],
        buttons: [
            {
                rect: { left: 388, top: 465, width: 45, height: 45 },
                label:"Switch",
                icon:"icon_rotate.svg",
                layer: 2
            },
            {
                rect: { left: 388, top: 415, width: 45, height: 45 },
                label:"Switch",
                icon:"minimize.svg",
                layer: 2
            }
        ]
    },

    // Third layout: PIP right
    {
        videos: [
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                    {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                    {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                    {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                    {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
                ],
                visible:true,
                layer:1
            },
            {
                content:null,
                rect:[
                    {aspectRatio:"16/9",left:880,top:470,width:350,height:197},
                    {aspectRatio:"16/10",left:880,top:448,width:350,height:219},
                    {aspectRatio:"5/3",left:880,top:457,width:350,height:210},
                    {aspectRatio:"5/4",left:880,top:387,width:350,height:280},
                    {aspectRatio:"4/3",left:880,top:404,width:350,height:262}
                ],
                visible:true,
                layer:2
            }
        ],
        buttons: [
            {
                rect: { left: 848, top: 465, width: 45, height: 45 },
                onClick: function() { this.switch(); },
                label:"Switch",
                icon:"icon_rotate.svg",
                layer: 2
            },
            {
                rect: { left: 848, top: 415, width: 45, height: 45 },
                onClick: function() { this.switchMinimize(); },
                label:"Switch",
                icon:"minimize.svg",
                layer: 2
            }
        ]
    }
];

function nextLayout(validContent) {
    layout = (layout + 1) % layouts.length;
    return currentLayout(validContent);
}

function currentLayout(validContent) {
    let selectedLayout = JSON.parse(JSON.stringify(layouts[layout]));
    selectedLayout.videos[0].content = validContent[0];
    selectedLayout.videos[1].content = validContent[1];
    return selectedLayout;
}

export default class DualVideoLayout extends VideoLayout {
    get identifier() { return "dual-video"; }

    async load() {
        console.debug("Dual video layout loaded");
    }

    getValidStreams(streamData) {
        // As this is a dual stream layout plugin, we make sure that the valid streams containis
        // two streams. This prevents a bad configuration of the plugin
        return super.getValidStreams(streamData)
            .filter(stream => stream.length === 2);
    }

    getLayoutStructure(streamData, contentId) {
        const {content} = this.validContent.find(content => content.id === contentId);
        const selectedLayout = currentLayout(content);
        const result = {
            name:{es:"Dos streams con posición dinámica"},
            hidden:false,
            videos: selectedLayout.videos,
            background:{content:"slide_professor_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:true,layer:0},
            logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
            buttons: [
                {
                    rect: selectedLayout.buttons[0].rect,
                    onClick: function() { this.switch(); },
                    label:"Switch",
                    icon:"icon_rotate.svg",
                    layer: 2
                },
                {
                    rect: selectedLayout.buttons[1].rect,
                    onClick: function() { this.switchMinimize(); },
                    label:"Minimize",
                    icon:"minimize.svg",
                    layer: 2
                }
            ],
            onApply: function() {
            },
            switch: function() {
                let v0 = this.videos[0].content;
                let v1 = this.videos[1].content;
                this.videos[0].content = v1;
                this.videos[1].content = v0;
                paella.profiles.placeVideos();
            },
            switchMinimize: function() {
                const newLayout = nextLayout();
                this.videos = newLayout.videos;
                this.buttons[0].rect = newLayout.buttons[0].rect;
                this.buttons[1].rect = newLayout.buttons[1].rect;
                paella.profiles.placeVideos();
            }
        };
        
        return result;
    }
}
