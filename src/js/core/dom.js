
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

export class DomClass {
    constructor(player, {tag='div',attributes=[],children="",parent=null}) {
        this._player = player;
        this._element = createElement({tag,attributes,children,parent});
    }

    get player() {
        return this._player;
    }

    get element() {
        return this._element;
    }

    setAttribute(name,value) {
        this._element.setAttribute(name,value);
    }
}
