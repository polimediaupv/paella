
const {app, BrowserWindow} = require('electron');


const url = require('url');
const path = require('path');
const WindowStateManager = require('electron-window-state-manager');

function launch(indexFile) {
    let win = null;
    
    const mainWindowState = new WindowStateManager('mainWindow', {
        defaultWidth: 1024,
        defaultHeight: 768
    });
    
    function createWindow() {
        win = new BrowserWindow({
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y
//            icon: path.join(__dirname, "data/paella-512.png")
        });
        if (mainWindowState.maximized) {
            win.maximize();
        }
        win.loadURL(url.format({
            pathname: path.join(__dirname, indexFile),
            protocol: 'file',
            slashes: true
        }));
        win.on('close', () => {
            mainWindowState.saveState(win);
        });
    }
    
    app.on('ready', () => {
        createWindow();
    });    
}

launch("index-debug.html",false);
