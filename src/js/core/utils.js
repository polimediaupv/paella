
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
