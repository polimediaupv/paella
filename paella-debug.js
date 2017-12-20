
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

    importFolder(coreSources);
    importFolder(pluginSources);

    function doLoad() {

        if (!window.paella || !paella.debugReady) {
            setTimeout(() => doLoad(),100);
        }
        else {
            paella.load(playerContainer,params);
        }
    }

    doLoad();
}