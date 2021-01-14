
import PlayerResource from './PlayerResource';

export function createElement({tag='div',attributes={},children="",parent=null}) {
    const result = document.createElement(tag);
    for (let key in attributes) {
        result.setAttribute(key,attributes[key]);
    }
    result.innerHTML = children;
    if (parent) {
        parent.appendChild(result);
    }
    return result;
}

export class DomClass extends PlayerResource {
    constructor(player, {tag='div',attributes=[],children="",parent=null}) {
        super(player);
        this._element = createElement({tag,attributes,children,parent});
    }

    get element() {
        return this._element;
    }

    setAttribute(name,value) {
        this._element.setAttribute(name,value);
    }
}
