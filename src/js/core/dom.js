
export function createElement({tag='div',attributes=[],children=""}) {
    const result = document.createElement(tag);
    for (let key in attributes) {
        result.setAttribute(key,attributes[key]);
    }
    result.innerHTML = children;
    return result;
}

