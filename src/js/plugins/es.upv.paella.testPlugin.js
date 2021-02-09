
import ButtonPlugin from 'paella/core/ButtonPlugin';
import editIcon from 'icons/edit.svg';
import PopUp from 'paella/core/PopUp';
import { createElementWithHtmlText } from 'paella/core/dom';

export default class TestPlugin extends ButtonPlugin {
    get icon() { return editIcon; }
    
    async load() {
    }
    
    async action() {
        if (!this._popUp) {
            this._popUp = new PopUp(this.player, document.body, this.button);
            this._popUp.setContent(`
                <div>
                    <h1>Pop Up Test</h1>
                </div>
                `);
            
            this.popUpButton = createElementWithHtmlText(`
                <button>Test button</button>`, this._popUp.content);
            
            this.popUpButton.addEventListener("click", (evt) => {
                this._popUp.hide();
                alert("Hello");
                evt.stopPropagation();
            });
        }
        else {
            this._popUp.show();
        }
    }
}
