
import PlayerResource from './PlayerResource';

export function createElement({tag='div',attributes={},children="",innerText="",parent=null}) {
    const result = document.createElement(tag);
    result.innerText = innerText;
    for (let key in attributes) {
        result.setAttribute(key,attributes[key]);
    }
    result.innerHTML = children;
    if (parent) {
        parent.appendChild(result);
    }
    return result;
}

export function createElementWithHtmlText(htmlText,parent = null) {
    const tmpElem = document.createElement('div');
    tmpElem.innerHTML = htmlText;
    const result = tmpElem.children[0];
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
    
    hide() {
        this._prevDisplay = this.element.style.display;
        this.element.style.display = "none";
    }
    
    show() {
        this.element.style.display = this._prevDisplay || "block";
    }
    
    get isVisible() {
        return this.element.style.display !== "none";
    }

    setAttribute(name,value) {
        this._element.setAttribute(name,value);
    }

    removeFromParent() {
        this._element.parentElement.removeChild(this._element);
    }
}
