var bootstrapUtils = {
	elem:function(type,params,inner) {
		var elem = document.createElement(type);
		for (var attr in params) {
			elem.setAttribute(attr, params[attr]);
		}
		if (inner) {elem.innerHTML = inner;}
		return elem;
	},
	
	append:function(parent,child) {
		parent.appendChild(child);
		return child;
	},

	navbar:function(title,subclass) {
		var nav = this.elem("div",{"class":"navbar tiny " + subclass});
		var navInner = this.append(nav,this.elem("div",{"class":"navbar-inner tiny"}))
		if (title) {
			this.append(navInner,this.elem("div",{"class":"brand","href":"JavaScript:void(0);"},title));
		}
		return nav;
	},
	
	dropdown:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'');
	},
	
	dropup:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'dropup');
	},

	dropButton:function(title,subclass,items,size,icon,alignRight,type) {
		var align = '';
		if (alignRight) align = 'pull-right';
		
		var dropup = this.elem('div',{'class':'btn-group ' + type + ' ' + subclass + ' ' + align});
		if (icon) {
			title = '<i class="' + icon + '"></i>&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		else {
			title = '&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		
		var btn = this.append(dropup,this.elem('a',{'class':'btn dropdown-toggle ' + size,'data-toggle':'dropdown','href':'JavaScript:void(0);'},title + '<span class="caret"></span>'));
		
		
		var ul = this.append(dropup,this.elem('ul',{'class':'dropdown-menu'}));
		for (var key in items) {
			var action = items[key];
			var li = this.append(ul,this.elem('li'));
			this.append(li,this.elem('a',{'href':'JavaScript:void(0);','onclick':action,'class':'listItem'},key));
		}
		return dropup;
	},
	
	buttonGroup:function(buttons,btnSubclass,isPushButton) {
		var group = document.createElement('div');
		group.className = 'btn-group';
		
		
		for (var i=0;i<buttons.length;++i) {
			var button = document.createElement('button');
			button.className = 'btn ' + btnSubclass;
			button.innerHTML = buttons[i].label;
			button.buttonData = buttons[i];
			button.buttonData.disabledClass = button.className;
			button.title = buttons[i].hint;
			if (isPushButton) {
				$(button).click(function(event) {
					this.buttonData.onclick(this.buttonData);
				});				
			}
			else {
				$(button).click(function(event) {
					for (var j=0;j<this.parentNode.childNodes.length;++j) {
						this.parentNode.childNodes[j].className = this.buttonData.disabledClass;
					}
					this.className = this.className + ' active';
					this.buttonData.onclick(this.buttonData);
				});
			}
			group.appendChild(button);
		}
		return group;
	},
	
	button:function(label,className,hint,onclick) {
		var button = document.createElement('button');
		button.className = 'btn ' + className;
		button.innerHTML = label;
		button.title = hint;
		$(button).click(function(event) { onclick(this); });
		return button;
	}
};