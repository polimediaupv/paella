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


Class ("paella.Node", {
	identifier:'',
	nodeList:null,
	parent:null,

	initialize:function(id) {
		this.nodeList = {};
		this.identifier = id;
	},

	addTo:function(parentNode) {
		parentNode.addNode(this);
	},

	addNode:function(childNode) {
		childNode.parent = this;
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
