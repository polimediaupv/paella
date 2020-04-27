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

(function() {

	class LoaderContainer extends paella.DomNode {
	
		constructor(id) {
			super('div',id,{position:'fixed',backgroundColor:'white',opacity:'0.7',top:'0px',left:'0px',right:'0px',bottom:'0px',zIndex:10000});
			this.timer = null;
			this.loader = null;
			this.loaderPosition = 0;

			this.loader = this.addNode(new paella.DomNode('i','',{
				width: "100px",
				height: "100px",
				color: "black",
				display: "block",
				marginLeft: "auto",
				marginRight: "auto",
				marginTop: "32%",
				fontSize: "100px",
			}));
			this.loader.domElement.className = "icon-spinner";
	
			paella.events.bind(paella.events.loadComplete,(event,params) => { this.loadComplete(params); });
			this.timer = new paella.utils.Timer((timer) => {
				//thisClass.loaderPosition -= 128;
				
				//thisClass.loader.domElement.style.backgroundPosition = thisClass.loaderPosition + 'px';
				this.loader.domElement.style.transform = `rotate(${ this.loaderPosition }deg`;
				this.loaderPosition+=45;
			},250);
			this.timer.repeat = true;
		}
	
		loadComplete(params) {
			$(this.domElement).hide();
			this.timer.repeat = false;
		}
	}

	paella.LoaderContainer = LoaderContainer;
	
	paella.Keys = {
		Space:32,
		Left:37,
		Up:38,
		Right:39,
		Down:40,
		A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90
	};

	class KeyPlugin extends paella.FastLoadPlugin {
		get type() { return 'keyboard'; }

		onKeyPress(key) {
			console.log(key);
			return false;
		}
	}

	paella.KeyPlugin = KeyPlugin;

	let g_keyboardEventSet = false;
	class KeyManager {
		get isPlaying() { return this._isPlaying; }
		set isPlaying(p) { this._isPlaying = p; }
		
		get enabled() { return this._enabled!==undefined ? this._enabled : true; }
		set enabled(e) { this._enabled = e; }
	
		constructor() {
			this._isPlaying = false;
			var thisClass = this;
			paella.events.bind(paella.events.loadComplete,function(event,params) { thisClass.loadComplete(event,params); });
			paella.events.bind(paella.events.play,function(event) { thisClass.onPlay(); });
			paella.events.bind(paella.events.pause,function(event) { thisClass.onPause(); });

			paella.pluginManager.setTarget('keyboard',this);

			this._pluginList = []; 
			
		}

		addPlugin(plugin) {
			if (plugin.checkEnabled((e) => {
				this._pluginList.push(plugin);
				plugin.setup();
			}));
		}
	
		loadComplete(event,params) {
			if (g_keyboardEventSet) {
				return;
			}
			paella.events.bind("keyup",(event) => {
				this.keyUp(event);
			});
			g_keyboardEventSet = true;
		}
	
		onPlay() {
			this.isPlaying = true;
		}
	
		onPause() {
			this.isPlaying = false;
		}
	
		keyUp(event) {
			if (!this.enabled) return;

			this._pluginList.some((plugin) => {
				return plugin.onKeyPress(event);
			});
		}
	}

	paella.keyManager = new KeyManager();

})();

