
function loadPaellaDebug(playerContainer,params) {
    let fs = require("fs");
    let path = require("path");


    function importFile(file) {
        let script = document.createElement("script");
        if (file.split(".").pop()=='js') {
            script.src = file;
            //script.type = "text/javascript";
            script.async = false;
            document.head.appendChild(script);
        }
    }

    function importFolder(src) {
        let sortFn = (a,b) => {
            if (a<b) return -1;
            else return 1;
        };

        let stat = fs.statSync(src);
        if (stat.isDirectory()) {
            let dirContents = fs.readdirSync(src);
            dirContents.sort(sortFn);
            dirContents.forEach((fileName) => importFolder(path.join(src,fileName)));
        }
        else {
            importFile(src);
        }
    }
    
    let corePath = __dirname;
    let coreSources = path.join(corePath,"src");
    let pluginSources = path.join(corePath,"plugins");

    window.paella_debug_baseUrl = path.join(corePath,'build/player/');

    importFolder(coreSources);
    importFolder(pluginSources);

    function doLoad() {

        // Fill in the video selector field
        let currentVideoId = paella.utils.parameters.get('id');
        let selectField = document.getElementById('videoSelector');
        fs.readdirSync(__dirname + '/repository_test/repository').forEach((videoId) => {
            let option = document.createElement('option');
            option.id = videoId;
            option.innerHTML = videoId;
            if (videoId==currentVideoId) {
                option.selected = true;
            }
            selectField.appendChild(option);
        });
        selectField.addEventListener('change',function(event) {
            location.href = location.pathname + '?id=' + event.target.value;
        });

        if (!window.paella) {
            setTimeout(() => doLoad(),100);
        }
        else {
            paella.load(playerContainer,params);
        }
    }

    doLoad();
}