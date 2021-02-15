# Initialization

## 1. Create Paella Player instance with basic initialization
### 1.1. Load player

```javascript
const initParams = {};
const paella = new Paella('container-id', initParams);
paella.load()
    .then(() => console.log("Initialization done"))
    .catch(e => console.error(e));
```

### 1.2. Lazy load

To load the minimum amount of data needed to present the video thumbnail, you can load the player in two steps. The `load()` function used in the previous section is implemented like this:

```javascript
async load() {
    await this.loadManifest();
    await this.loadPlayer();
}
```

If you only call `loadManifest()`, paella will only load the manifest and the plugins of type `preload`, which will leave the player ready for the user to complete the load when clicked. At that point the 'loadPlayer()` will be called.:

```javascript
const paella = new Paella('container-id');
paella.loadManifest()
    .then(() => console.log("Initialization done"))
    .catch(e => console.error(e));
```

## 2. Initialization parameters

```javascript
const initParams = {
    // Initialiation attributes
    configUrl: 'config/config.json',    // Used by the default loadConfig function
    repositoryUrl: 'repository',    // URL to locate the video manifests (see getManifestUrl)
    manifestFileName: 'data.json',     // manifest file name (can be overrided in config.json)

    // Initialization callbacks
    loadConfig: [default_load_config_function],      // overrides the config.json file load
    getVideoId: [default_video_id_function],     // get the video identifier
    getManifestUrl: [default_manifest_url_function],    // get the video manifest url
    getManifestFileUrl: [default_manifest_file_url_function],   // get the full manifest file url
    loadVideoManifest: [default_load_video_manifest_function],   // get the manifest file content
} 
```

### 2.1. Default initialization functions

The default initialization functions are located at `src/core/initFunctions`.

```javascript
import {
    defaultLoadConfigFunction,
    defaultGetVideoIdFunction,
    defaultGetManifestUrlFunction,
    defaultGetManifestFileUrlFunction,
    defaultLoadVideoManifestFunction
} from 'paella/js/core/initFunctions';
```

default load config funciton:

```javascript
export async function defaultLoadConfigFunction(configUrl) {
    console.debug("Using default configuration loading function.");
    const response = await fetch(configUrl);
    return response.json();
}
```

default video id function

```javascript
import { getUrlParameter } from 'paella/js/core/utils';


export async function defaultGetVideoIdFunction() {
    console.debug("Using default getVideoId function");
    return getUrlParameter("id");
}
```

default manifest url function

```javascript
import { joinPath } from 'paella/js/core/utils';

// repoUrl: the value specified in initParams.repositoryUrl
// videoId: the video identifier returned by initParams.getVideoId()
export async function defaultGetManifestUrlFunction(repoUrl,videoId) {
    console.debug("Using default getManifestUrl function");
    return joinPath([repoUrl,videoId]);
}
```

default manifest file URL function

```javascript
export async function defaultGetManifestFileUrlFunction(manifestUrl,manifestFileName) {
    console.debug("Using default getManifestFileUrl function");
    return joinPath([manifestUrl,manifestFileName]);
}
```

default manifest file content function

```javascript
export async function defaultLoadVideoManifestFunction(videoManifestUrl) {
    console.debug("Using default loadVideoManifest function");
    const response = await fetch(videoManifestUrl);
    return response.json();
}
```

