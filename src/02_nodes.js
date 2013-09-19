
paella.Node = Class.create({
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
	}
});

paella.DomNode = Class.create(paella.Node,{
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
	}
});

paella.Button = Class.create(paella.DomNode,{
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
			var element = $('#' + this.identifier)[0];
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
		var element = $('#' + this.identifier)[0];
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