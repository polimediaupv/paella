
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
