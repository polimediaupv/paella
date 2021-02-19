import Paella from 'paella/js/Paella';

let paella = new Paella('player-container')
paella.loadManifest()
	.then(() => console.log("done"))
	.catch(e => console.error(e));
