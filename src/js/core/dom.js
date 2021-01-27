
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

        // Add a getter as a shortcut to the DOM element tag
        Object.defineProperty(this, tag, {
            get: () => this._element
        });
    }

    get element() {
        return this._element;
    }

    get parent() {
        return this._element.parentElement;
    }

    setAttribute(name,value) {
        this._element.setAttribute(name,value);
    }

    removeFromParent() {
        this._element.parentElement.removeChild(this._element);
    }
}
