import "regenerator-runtime/runtime";

import twitterIcon from '../../icons/twitter.svg';

function buildDocument(containerElement, message) {    
    containerElement.innerHTML = `
        <h1>Webpack base config test</h1>
        <p>${message}</p>
        <img src=${twitterIcon} alt="arrow-left"></img>
        `;
}


export default class Paella {
    constructor(containerElement) {
        if (typeof(containerElement) === "string") {
            containerElement = document.getElementById(containerElement);
        }

        this._containerElement = containerElement;
    }

    async load() {
        this._config = await this.loadConfig();
        buildDocument(this._containerElement, this._config.message);
    }

    loadConfig() {
        return new Promise((resolve,reject) => {
            fetch('config/config.json')
                .then(response => response.json())
                .then(config => resolve(config))
                .catch(e => reject(e));
        })
    }
}
