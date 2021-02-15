
import PopUpButtonPlugin from 'paella/js/core/PopUpButtonPlugin';
import editIcon from 'paella/icons/edit.svg';
import { createElementWithHtmlText } from 'paella/js/core/dom';

export default class TestPlugin extends PopUpButtonPlugin {
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
