import './css/base.css';

import Paella from './js/Paella';

let paella = new Paella('player-container');
paella.load()
    .then(() => console.log("done"))
    .catch(e => console.error(e));

