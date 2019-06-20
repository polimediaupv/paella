/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


(() => {

	class Node {
		get identifier() { return this._identifier; }
		set identifier(id) { this._identifier = id; }
		get nodeList() { return this._nodeList; }
		get parent() { return this._parent; }
		set parent(p) { this._parent = p; } 
	
		constructor(id) {
			this._nodeList = {};
			this.identifier = id;
		}
	
		addTo(parentNode) {
			parentNode.addNode(this);
		}
	
		addNode(childNode) {
			childNode.parent = this;
			this.nodeList[childNode.identifier] = childNode;
			return childNode;
		}

		getNode(id) {
			return this.nodeList[id];
		}
		
		removeNode(childNode) {
			if (this.nodeList[childNode.identifier]) {
				delete this.nodeList[childNode.identifier];
				return true;
			}
			return false;
		}
	}

	paella.Node = Node;
	
	class DomNode extends paella.Node {
		get domElement() { return this._domElement; }
		
		get domElementType() { return this._elementType; }
		set domElementType(newType) {
			this._elementType = newType;
			let oldElement = this._domElement;
			let parent = oldElement.parentNode;
			let newElement = document.createElement(newType);
			parent.removeChild(oldElement);
			parent.appendChild(newElement);
			this._domElement = newElement;
			newElement.innerHTML = oldElement.innerHTML;
			for (let i = 0; i<oldElement.attributes.length; ++i) {
				let attr = oldElement.attributes[i];
				newElement.setAttribute(attr.name,attr.value);
			}
		}
	
		constructor(elementType,id,style) {
			super(id);
			this._elementType = elementType;
			this._domElement = document.createElement(elementType);
			this.domElement.id = id;
			if (style) this.style = style;
		}

		set style(s) { $(this.domElement).css(s); }
	
		addNode(childNode) {
			let returnValue = super.addNode(childNode);
			this.domElement.appendChild(childNode.domElement);
			return returnValue;
		}
	
		onresize() {
		}
		
		removeNode(childNode) {
			if (super.removeNode(childNode)) {
				this.domElement.removeChild(childNode.domElement);
			}
		}
	}

	paella.DomNode = DomNode;
	
	class Button extends paella.DomNode {
		get isToggle() { return this._isToggle; }
		set isToggle(t) { this._isToggle = t; } 
	
		constructor(id,className,action,isToggle) {
			var style = {};
			super('div',id,style);
			this.isToggle = isToggle;
			this.domElement.className = className;
			if (isToggle) {
				$(this.domElement).click((event) => {
					this.toggleIcon();
				});
			}
			$(this.domElement).click('click',action);
		}
	
		isToggled() {
			if (this.isToggle) {
				var element = this.domElement;
				return /([a-zA-Z0-9_]+)_active/.test(element.className);
			}
			else {
				return false;
			}
		}
	
		toggle() {
			this.toggleIcon();
		}
	
		toggleIcon() {
			var element = this.domElement;
			if (/([a-zA-Z0-9_]+)_active/.test(element.className)) {
				element.className = RegExp.$1;
			}
			else {
				element.className = element.className + '_active';
			}
		}
	
		show() {
			$(this.domElement).show();
		}
	
		hide() {
			$(this.domElement).hide();
		}
	
		visible() {
			return this.domElement.visible();
		}
	}

	paella.Button = Button;
	
})();
