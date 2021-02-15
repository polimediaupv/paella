
import PopUpButtonPlugin from 'paella/js/core/PopUpButtonPlugin';
import { createElementWithHtmlText } from 'paella/js/core/dom';

import 'paella/styles/MenuButton.css';

export default class MenuButtonPlugin extends PopUpButtonPlugin {
	
	async getContent() {
		const content = createElementWithHtmlText(`<ul class="menu-button-content"></ul>`);
		
		const menuItems = await this.getMenu();
		this._menuItems = menuItems;
		let radioItemChecked = false;
		menuItems.forEach(item => {
			const itemElem = createElementWithHtmlText(`<li class="menu-button-item"></li>`, content);
			let className = "";
			if (this.buttonType === "button") {
				className = "menu-item-type-button";
			}
			else if (this.buttonType === "check") {
				className = "menu-item-type-button" + (item.selected ? " selected" :  "");
			}
			else if (this.buttonType === "radio") {
				className = "menu-item-type-button";
				if (!radioItemChecked && item.selected) {
					className += " selected";
					radioItemChecked = true;
				}
			}
			const itemButton = createElementWithHtmlText(`
				<button class="${ className }">${ item.title }</button>`
				, itemElem);
			item.buttonElement = itemButton;
			itemButton._itemData = item;
			itemButton.addEventListener("click", (evt) => {
				if (this.buttonType === "check") {
					evt.target._itemData.selected = !evt.target._itemData.selected;
					evt.target._itemData.selected ?
						evt.target.classList.add("selected") :
						evt.target.classList.remove("selected");
				}
				else if (this.buttonType === "radio") {
					this.menuItems.forEach(i => {
						i.selected = false;
						i.buttonElement.classList.remove("selected");
					});
					evt.target._itemData.selected = !evt.target._itemData.selected;
					evt.target._itemData.selected ?
						evt.target.classList.add("selected") :
						evt.target.classList.remove("selected");
				}
				this.itemSelected(evt.target._itemData, this._menuItems);
				evt.stopPropagation();
				
				if (this.buttonType !== "check") {
					this.closeMenu();
				}
			})
		});
		
		return content;
	}
	
	async getMenu() {
		const items = [
			{ id: 0, title: "Option 1" },
			{ id: 1, title: "Option 2" },
			{ id: 2, title: "Option 3" },
			{ id: 3, title: "Option 4" },
			{ id: 4, title: "Option 5" }
		];
		return items;
	}
	
	// Returns the menuItems with the current menu state
	get menuItems() {
		return this._menuItems;
	}
	
	buttonType() {
		// check, radio or button
		return "button";	
	}
	
	itemSelected(itemData,menuItems) {
		console.warn(`MenuButtonPlugin (${ this.name }): itemSelected() function not implemented.`);
	}
	
	closeMenu() {
		this._popUp.hide();
	}
}
