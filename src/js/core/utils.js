
import Events, { bindEvent } from 'paella/js/core/Events';
import PopUp from 'paella/js/core/PopUp';

export function getUrlParameter(name) {
    // Optional: implement this using a fallback to support IE11
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(name) ? urlParams.get(name) : null;
}

export function joinPath(parts, sep){
    const separator = sep || '/';
    parts = parts.map((part, index)=>{
        if (index) {
            part = part.replace(new RegExp('^' + separator), '');
        }
        if (index !== parts.length - 1) {
            part = part.replace(new RegExp(separator + '$'), '');
        }
        return part;
    })
    return parts.join(separator);
}

export function isAbsoluteUrl(src) {
    // We consider that the URLs starting with / are absolute and local to this server
    return new RegExp('^([a-z]+://|//)', 'i').test(src) || /^\//.test(src);
}

// Returns the absolute path of a video manifest resource file.
// If the path is absolute, it returns it unchanged.
export function resolveResourcePath(player,src) {
    if (isAbsoluteUrl(src)) {
        return src;
    }
    else {
        return joinPath([player.manifestUrl, src]);
    }
}

export function setupAutoHideUiTimer(player, hideUiTimePropertyName = "hideUiTime") {
    player.__hideTimer__ = null;
    
    const setupTimer = async () => {
        if (player.__hideTimer__) {
            clearTimeout(player.__hideTimer__);
        }
        await player.showUserInterface();
        player.__hideTimer__ = setTimeout(async () => {
            player.__hideTimer__ = null;
            const visible = PopUp.IsSomePopUpVisible();
            if (visible) {
                console.debug("UI not hidden because there are visible pop ups");
                setupTimer();
            }
            else {
                await player.hideUserInterface();
            }
        }, player[hideUiTimePropertyName]);
    }
    
    player.containerElement.addEventListener("mousemove", async (evt) => {
        setupTimer();
    });
    
    bindEvent(player, Events.PLAY, async () => {
        setupTimer();
    });
    
    bindEvent(player, Events.PAUSE, async () => {
        await player.showUserInterface();
    });
    
    bindEvent(player, Events.ENDED, async () => {
        await player.showUserInterface();
    });
}

export function secondsToTime(timestamp) {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - hours * 60;
    const seconds = Math.floor(timestamp % 60);
    return  (hours>0 ? hours.toString().padStart(2,'0') + ":" : "") +
            minutes.toString().padStart(2,'0') + ":" +
            seconds.toString().padStart(2,'0');
}

