/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


Class ("paella.Node", {
	identifier:'',
	nodeList:null,

	initialize:function(id) {
		this.nodeList = {};
		this.identifier = id;
	},

	addTo:function(parentNode) {
		parentNode.addNode(this);
	},

	addNode:function(childNode) {
		this.nodeList[childNode.identifier] = childNode;
		return childNode;
	},

	getNode:function(id) {
		return this.nodeList[id];
	},
	
	removeNode:function(childNode) {
		if (this.nodeList[childNode.identifier]) {
			delete this.nodeList[childNode.identifier];
			return true;
		}
		return false;
	}
});

Class ("paella.DomNode", paella.Node,{
	domElement:null,

	initialize:function(elementType,id,style) {
		this.parent(id);
		this.domElement = document.createElement(elementType);
		this.domElement.id = id;
		if (style) $(this.domElement).css(style);
	},

	addNode:function(childNode) {
		var returnValue = this.parent(childNode);
		this.domElement.appendChild(childNode.domElement);
		return returnValue;
	},

	onresize:function() {
	},
	
	removeNode:function(childNode) {
		if (this.parent(childNode)) {
			this.domElement.removeChild(childNode.domElement);
		}
	}
});

Class ("paella.Button", paella.DomNode,{
	isToggle:false,

	initialize:function(id,className,action,isToggle) {
		this.isToggle = isToggle;
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = className;
		if (isToggle) {
			var thisClass = this;
			$(this.domElement).click(function(event) {
				thisClass.toggleIcon();
			});
		}
		$(this.domElement).click('click',action);
	},

	isToggled:function() {
		if (this.isToggle) {
			var element = this.domElement;
			return /([a-zA-Z0-9_]+)_active/.test(element.className);
		}
		else {
			return false;
		}
	},

	toggle:function() {
		this.toggleIcon();
	},

	toggleIcon:function() {
		var element = this.domElement;
		if (/([a-zA-Z0-9_]+)_active/.test(element.className)) {
			element.className = RegExp.$1;
		}
		else {
			element.className = element.className + '_active';
		}

	},

	show:function() {
		$(this.domElement).show();
	},

	hide:function() {
		$(this.domElement).hide();
	},

	visible:function() {
		return this.domElement.visible();
	}
});
