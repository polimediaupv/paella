import { Paella } from 'paella';

let paella = new Paella('player-container');

paella.loadManifest()
    .then(() => console.log("done"))
    .catch(e => console.error(e));