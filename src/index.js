import './css/base.css';

import twitterIcon from '../icons/twitter.svg';

function buildDocument(message) {
    const container = document.getElementById('player-container');
    
    container.innerHTML = `
        <h1>Webpack base config test</h1>
        <p>${message}</p>
        <img src=${twitterIcon} alt="arrow-left"></img>
        `;
}

fetch('config/config.json')
    .then(response => response.json())
    .then(config => buildDocument(config.message))
    .catch(e => buildDocument(e.message));

