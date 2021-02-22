import { Paella, utils, ButtonPlugin } from 'paella';

const initParams = {
    customPluginContext: [
        require.context("./plugins", true, /\.js/)
    ]
};

let paella = new Paella('player-container', initParams);

console.log(utils.secondsToTime(123312));

paella.loadManifest()
    .then(() => console.log("done"))
    .catch(e => console.error(e));