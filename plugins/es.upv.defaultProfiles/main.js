
paella.addPlugin(function() {
    return class SingleStreamProfilePlugin extends paella.EventDrivenPlugin {
        getName() {
            return "es.upv.paella.singleStreamProfilePlugin";
        }

        checkEnabled(onSuccess) {
            let config = this.config;
            config.videoSets.forEach((videoSet,index) => {
                let validContent = videoSet.content
                if (validContent.length==1) {
                    let streamCount = 0;
                    paella.player.videoContainer.streamProvider.videoStreams.forEach((v) => {
                        if (validContent.indexOf(v.content)!=-1) {
                            streamCount++
                        }
                    })
                    if (streamCount>=1) {
                        onSuccess(true);
                        paella.addProfile(() => {
                            return new Promise((resolve,reject) => {
                                resolve({
                                    id:videoSet.id,
                                    name:{es:"Un stream"},
                                    hidden:false,
                                    icon:videoSet.icon,
                                    videos: [
                                        {
                                            content:validContent[0],
                                            rect:[
                                                { aspectRatio:"1/1",left:280,top:0,width:720,height:720 },
                                                { aspectRatio:"6/5",left:208,top:0,width:864,height:720 },
                                                { aspectRatio:"5/4",left:190,top:0,width:900,height:720 },
                                                { aspectRatio:"4/3",left:160,top:0,width:960,height:720 },
                                                { aspectRatio:"11/8",left:145,top:0,width:990,height:720 },
                                                { aspectRatio:"1.41/1",left:132,top:0,width:1015,height:720 },
                                                { aspectRatio:"1.43/1",left:125,top:0,width:1029,height:720 },
                                                { aspectRatio:"3/2",left:100,top:0,width:1080,height:720 },
                                                { aspectRatio:"16/10",left:64,top:0,width:1152,height:720 },
                                                { aspectRatio:"5/3",left:40,top:0,width:1200,height:720 },
                                                { aspectRatio:"16/9",left:0,top:0,width:1280,height:720 },
                                                { aspectRatio:"1.85/1",left:0,top:14,width:1280,height:692 },
                                                { aspectRatio:"2.35/1",left:0,top:87,width:1280,height:544 },
                                                { aspectRatio:"2.41/1",left:0,top:94,width:1280,height:531 },
                                                { aspectRatio:"2.76/1",left:0,top:128,width:1280,height:463 }
                                            ],
                                            visible:true,
                                            layer:1
                                        }
                                    ],
                                    background:{content:"slide_professor_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:true,layer:0},
                                    logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
                                    buttons: [],
                                    onApply: function() {
                                    }
                                })
                            })
                        });
                    }
                    else {
                        onSuccess(false)
                    }
                }
            })
        }
    }
})

paella.addPlugin(function() {
	return class DualStreamProfilePlugin extends paella.EventDrivenPlugin {
		
		getName() {
			return "es.upv.paella.dualStreamProfilePlugin";
		}
		
		checkEnabled(onSuccess) {
            let config = this.config;
            config.videoSets.forEach((videoSet,index) => {
                let validContent = videoSet.content
                if (validContent.length==2) {
                    let streamCount = 0;
                    paella.player.videoContainer.streamProvider.videoStreams.forEach((v) => {
                        if (validContent.indexOf(v.content)!=-1) {
                            streamCount++
                        }
                    })
                    if (streamCount>=2) {
                        onSuccess(true)

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

                        function nextLayout() {
                            let selectedLayout = JSON.parse(JSON.stringify(layouts[layout]));
                            layout = (layout + 1) % layouts.length;
                            selectedLayout.videos[0].content = validContent[0];
                            selectedLayout.videos[1].content = validContent[1];
                            return selectedLayout;
                        }

                        paella.addProfile(() => {
                            const selectedLayout = nextLayout();
                            return new Promise((resolve) => {
                                resolve({
                                    id:videoSet.id,
                                    name:{es:"Dos streams con posición dinámica"},
                                    hidden:false,
                                    icon:videoSet.icon,
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
                                })
                            })
                        });
                    }
                    else {
                        onSuccess(false);
                    }
                }
            })
        }
	};
});

paella.addPlugin(function() {
	return class TripleStreamProfilePlugin extends paella.EventDrivenPlugin {
		
		getName() {
			return "es.upv.paella.tripleStreamProfilePlugin";
		}
		
		checkEnabled(onSuccess) {
            let config = this.config;
            config.videoSets.forEach((videoSet,index) => {
                let validContent = videoSet.content
                if (validContent.length==3) {
                    let streamCount = 0;
                    paella.player.videoContainer.streamProvider.videoStreams.forEach((v) => {
                        if (validContent.indexOf(v.content)!=-1) {
                            streamCount++
                        }
                    })
                    if (streamCount>=3) {
                        onSuccess(true);
                        paella.addProfile(() => {
                            return new Promise((resolve,reject) => {
                                resolve({
                                    id:videoSet.id,
                                    name:{es:"Tres streams posición dinámica"},
                                    hidden:false,
                                    icon:videoSet.icon,
                                    videos: [
                                        {
                                            content: validContent[0],
                                            rect:[
                                                { aspectRatio:"16/9",left:239, top:17, width:803, height:451 }
                                            ],
                                            visible:true,
                                            layer:1
                                        },
                                        {
                                            content:  validContent[1],
                                            rect:[
                                                { aspectRatio:"16/9",left:44, top:482, width:389, height:218 }
                                            ],
                                            visible:true,
                                            layer:1
                                        },
                                        {
                                            content:  validContent[2],
                                            rect:[
                                                { aspectRatio:"16/9",left:847, top:482, width:389, height:218 }
                                            ],
                                            visible:true,
                                            layer:1
                                        }
                                    ],
                                    background: {content:"slide_professor_paella.jpg",zIndex:5,rect: { left:0,top:0,width:1280,height:720},visible: true,layer:0},
                                    logos: [{content:"paella_logo.png",zIndex:5,rect: { top:10,left:10,width:49,height:42}}],
                                    buttons: [
                                        {
                                            rect: { left: 618, top: 495, width: 45, height: 45 },
                                            onClick: function(event) { this.rotate(); },
                                            label:"Rotate",
                                            icon:"icon_rotate.svg",
                                            layer: 2
                                        }
                                    ],
                                    onApply: function() {
                                    },
                                    rotate: function() {
                                        let v0 = this.videos[0].content;
                                        let v1 = this.videos[1].content;
                                        let v2 = this.videos[2].content;
                                        this.videos[0].content = v2;
                                        this.videos[1].content = v0;
                                        this.videos[2].content = v1;
                                        paella.profiles.placeVideos();
                                    }
                                })
                            })
                        });
                    }
                    else {
                        onSuccess(false);
                    }
                }
            })
        }
	};
});

paella.addProfile(() => {
    return new Promise((resolve,reject) => {
        paella.events.bind(paella.events.videoReady,() => {
            let available = paella.player.videoContainer.streamProvider.videoStreams.some((v) => v.content=="blackboard")
			if(!available) {
                resolve(null);
            }
            else {
                resolve({
                    id:"blackboard_video_stream",
                    name:{es:"Pizarra"},
                    hidden:false,
                    icon:"s_p_blackboard.svg",
                    videos: [
                        {
                            content: "presentation",
                            rect:[
                            {aspectRatio:"16/9",left:10,top:70,width:432,height:243}],
                            visible:true,
                            layer:1
                        },
                        {
                            content:"blackboard",
                            rect:[{aspectRatio:"16/9",left:450,top:135,width:816,height:459}],
                            visible:true,
                            layer:1
                        },
                        {
                            content:"presenter",
                            rect:[{aspectRatio:"16/9",left:10,top:325,width:432,height:324}],
                            visible:true,
                            layer:1

                        }
                    ],
                    //blackBoardImages: {left:10,top:325,width:432,height:324},
                    background: {content:"slide_professor_paella.jpg",zIndex:5,rect: { left:0,top:0,width:1280,height:720},visible: true,layer:0},
                    logos: [{content:"paella_logo.png",zIndex:5,rect: { top:10,left:10,width:49,height:42}}],
                    buttons: [
                        {
                            rect: { left: 422, top: 295, width: 45, height: 45 },
                            onClick: function(event) { this.rotate(); },
                            label:"Rotate",
                            icon:"icon_rotate.svg",
                            layer: 2
                        }
                    ],
                    rotate: function() {
                        let v0 = this.videos[0].content;
                        let v1 = this.videos[1].content;
                        let v2 = this.videos[2].content;
                        this.videos[0].content = v2;
                        this.videos[1].content = v0;
                        this.videos[2].content = v1;
                        paella.profiles.placeVideos();
                    }
                });
            }
        });
    })
});

paella.addProfile(() => {
    return new Promise((resolve,reject) => {
        paella.events.bind(paella.events.videoReady, () => {
            // TODO: videoContainer.sourceData is deprecated. Update this code
            var n = paella.player.videoContainer.sourceData[0].sources;
            if (!n.chroma) {
                resolve(null);
            }
            else {
                resolve({
                    id:"chroma",
                    name:{es:"Polimedia"},
                    hidden:false,
                    icon:"chroma.svg",
                    videos: [
                        {
                            content:"presenter",rect:[
                                {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                                {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                                {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                                {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                                {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
                            ],visible:"true",layer:"1"
                        },
                        {
                            content:"presentation",rect:[
                                {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                                {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                                {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                                {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                                {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
                            ],visible:"true",layer:"0"
                        }
                    ],
                    background:{content:"default_background_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:"true",layer:"0"},
                    logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}]
                })
            }
        })
    })
});

