import { getUrlParameter, joinPath } from '../core/utils';

export async function defaultLoadConfigFunction(configUrl) {
    console.debug("Using default configuration loading function.");
    const response = await fetch(configUrl);
    return response.json();
}

export async function defaultGetVideoIdFunction() {
    console.debug("Using default getVideoId function");
    return getUrlParameter("id");
}

export async function defaultGetManifestUrlFunction(repoUrl,videoId) {
    console.debug("Using default getManifestUrl function");
    return joinPath([repoUrl,videoId]);
}

export async function defaultGetManifestFileUrlFunction(manifestUrl,manifestFileName) {
    console.debug("Using default getManifestFileUrl function");
    return joinPath([manifestUrl,manifestFileName]);
}

export async function defaultLoadVideoManifestFunction(videoManifestUrl) {
    console.debug("Using default loadVideoManifest function");
    const response = await fetch(videoManifestUrl);
    return response.json();
}
