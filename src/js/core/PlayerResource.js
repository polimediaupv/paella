
export default class PlayerResource {
    constructor(player) {
        this._player = player;
    }

    get player() { return this._player; }
}