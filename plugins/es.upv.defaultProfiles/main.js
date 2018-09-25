paella.setMonostreamProfile(() => {
    return new Promise((resolve,reject) => {
        resolve({
            id:"monostream",
            name:{es:"Monostream"},
            hidden:true,
            icon:"",
            videos: [
                {
                    content:"presenter",
                    visible:true,
                    layer:1,
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
                    ]
                }
            ],
            logos: [{content:"paella_logo.png",zIndex:5,rect: { top:10,left:10,width:49,height:42}}]
        })
    });
});

paella.addPlugin(function() {
    return class SingleStreamProfilePlugin extends paella.EventDrivenPlugin {
        getName() {
            return "es.upv.paella.singleStreamProfilePlugin";
        }

        checkEnabled(onSuccess) {
            let config = this.config;
            let enabled = false
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
                        enabled = true
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
            let enabled = false
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
                        enabled = true
                        paella.addProfile(() => {
                            return new Promise((resolve,reject) => {
                                resolve({
                                    id:videoSet.id,
                                    name:{es:"Dos streams con posición dinámica"},
                                    hidden:false,
                                    icon:videoSet.icon,
                                    videos: [
                                        {
                                            content:validContent[0],
                                            rect:[
                                                {aspectRatio:"16/9",left:712,top:302,width:560,height:315},
                                                {aspectRatio:"16/10",left:712,top:267,width:560,height:350},
                                                {aspectRatio:"4/3",left:712,top:198,width:560,height:420},
                                                {aspectRatio:"5/3",left:712,top:281,width:560,height:336},
                                                {aspectRatio:"5/4",left:712,top:169,width:560,height:448}
                                            ],
                                            visible:true,
                                            layer:1
                                        },
                                        {
                                            content:validContent[1],
                                            rect:[
                                                {aspectRatio:"16/9",left:10,top:225,width:695,height:390},
                                                {aspectRatio:"16/10",left:10,top:183,width:695,height:434},
                                                {aspectRatio:"4/3",left:10,top:96,width:695,height:521},
                                                {aspectRatio:"5/3",left:10,top:200,width:695,height:417},
                                                {aspectRatio:"5/4",left:10,top:62,width:695,height:556}
                                            ],
                                            visible:true,
                                            layer:"1"
                                        }
                                    ],
                                    background:{content:"slide_professor_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:true,layer:0},
                                    logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
                                    buttons: [
                                        {
                                            rect: { left: 682, top: 565, width: 45, height: 45 },
                                            onClick: function(event) { this.switch(); },
                                            label:"Switch",
                                            icon:"icon_rotate.svg",
                                            layer: 2
                                        },
                                        {
                                            rect: { left: 682, top: 515, width: 45, height: 45 },
                                            onClick: function(event) { this.switchMinimize(); },
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
                                        if (this.minimized) {
                                            this.minimized = false;
                                            this.videos = [
                                                {
                                                    content:validContent[0],
                                                    rect:[
                                                        {aspectRatio:"16/9",left:712,top:302,width:560,height:315},
                                                        {aspectRatio:"16/10",left:712,top:267,width:560,height:350},
                                                        {aspectRatio:"4/3",left:712,top:198,width:560,height:420},
                                                        {aspectRatio:"5/3",left:712,top:281,width:560,height:336},
                                                        {aspectRatio:"5/4",left:712,top:169,width:560,height:448}
                                                    ],
                                                    visible:true,
                                                    layer:1
                                                },
                                                {
                                                    content:validContent[1],
                                                    rect:[
                                                        {aspectRatio:"16/9",left:10,top:225,width:695,height:390},
                                                        {aspectRatio:"16/10",left:10,top:183,width:695,height:434},
                                                        {aspectRatio:"4/3",left:10,top:96,width:695,height:521},
                                                        {aspectRatio:"5/3",left:10,top:200,width:695,height:417},
                                                        {aspectRatio:"5/4",left:10,top:62,width:695,height:556}
                                                    ],
                                                    visible:true,
                                                    layer:2
                                                }
                                            ];
                                            this.buttons = [
                                                {
                                                    rect: { left: 682, top: 565, width: 45, height: 45 },
                                                    onClick: function(event) { this.switch(); },
                                                    label:"Switch",
                                                    icon:"icon_rotate.svg",
                                                    layer: 2
                                                },
                                                {
                                                    rect: { left: 682, top: 515, width: 45, height: 45 },
                                                    onClick: function(event) { this.switchMinimize(); },
                                                    label:"Minimize",
                                                    icon:"minimize.svg",
                                                    layer: 2
                                                }
                                            ];
                                        }
                                        else {
                                            this.minimized = true;
                                            this.videos = [
                                                {
                                                    content:validContent[0],rect:[
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
                                                    content:validContent[1],rect:[
                                                        {aspectRatio:"16/9",left:50,top:470,width:350,height:197},
                                                        {aspectRatio:"16/10",left:50,top:448,width:350,height:219},
                                                        {aspectRatio:"5/3",left:50,top:457,width:350,height:210},
                                                        {aspectRatio:"5/4",left:50,top:387,width:350,height:280},
                                                        {aspectRatio:"4/3",left:50,top:404,width:350,height:262}
                                                    ],
                                                    visible:true,
                                                    layer:2
                                                }
                                            ];
                                            this.buttons = [
                                                {
                                                    rect: { left: 388, top: 465, width: 45, height: 45 },
                                                    onClick: function(event) { this.switch(); },
                                                    label:"Switch",
                                                    icon:"icon_rotate.svg",
                                                    layer: 2
                                                },
                                                {
                                                    rect: { left: 388, top: 415, width: 45, height: 45 },
                                                    onClick: function(event) { this.switchMinimize(); },
                                                    label:"Switch",
                                                    icon:"minimize.svg",
                                                    layer: 2
                                                }
                                            ];
                                        }
                                        paella.profiles.placeVideos();
                                    }
                                })
                            })
                        });
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
            let enabled = false
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
                        enabled = true
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
        resolve({
            id:"blank_professor",
            name:{es:"Nada y presentador"},
            hidden:true,
            icon:"slide_professor_icon.png",
            videos: [
                {
                    content:"presenter",rect:[
                        {aspectRatio:"16/9",left:712,top:302,width:560,height:315},
                        {aspectRatio:"16/10",left:712,top:267,width:560,height:350},
                        {aspectRatio:"4/3",left:712,top:198,width:560,height:420},
                        {aspectRatio:"5/3",left:712,top:281,width:560,height:336},
                        {aspectRatio:"5/4",left:712,top:169,width:560,height:448}
                    ],visible:"true",layer:"1"
                },
                {
                    content:"presentation",rect:[
                        {aspectRatio:"4/3",left:0,top:0,width:300,height:300}
                    ],visible:"false",layer:"1"
                }
            ],
            background:{content:"slide_professor_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:"false",layer:"0"},
            logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
            isMonostream:true
        })
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

