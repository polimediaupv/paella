
import ButtonPlugin from 'paella/core/PopUpButtonPlugin';
import editIcon from 'icons/edit.svg';
import { createElementWithHtmlText } from 'paella/core/dom';

export default class TestPlugin extends ButtonPlugin {
    get icon() { return editIcon; }
    
    async getContent() {
        const content = createElementWithHtmlText(`
            <div>
                <h1>Pop Up Test</h1>
            </div>`);
        
        const button = createElementWithHtmlText('<button>Test Button</button>', content);
        button.addEventListener("click", (evt) => {
            this.hidePopUp();
            alert("Hello");
            evt.stopPropagation();
        });
        
        return content;
    }
}
