(() => {

    paella.utils = paella.utils || {};

    function parseOperatingSystem(userAgentString) {
		this.system.MacOS = /Macintosh/.test(userAgentString);
		this.system.Windows = /Windows/.test(userAgentString);
		this.system.iPhone = /iPhone/.test(userAgentString);
		this.system.iPodTouch = /iPod/.test(userAgentString);
		this.system.iPad = /iPad/.test(userAgentString) || /FxiOS/.test(userAgentString);
		this.system.iOS = this.system.iPhone || this.system.iPad || this.system.iPodTouch;
		this.system.Android = /Android/.test(userAgentString);
		this.system.Linux = (this.system.Android) ? false:/Linux/.test(userAgentString);

		if (this.system.MacOS) {
			this.system.OSName = "Mac OS X";
			parseMacOSVersion.apply(this, [userAgentString]);
		}
		else if (this.system.Windows) {
			this.system.OSName = "Windows";
			parseWindowsVersion.apply(this, [userAgentString]);
		}
		else if (this.system.Linux) {
			this.system.OSName = "Linux";
			parseLinuxVersion.apply(this, [userAgentString]);
		}
		else if (this.system.iOS) {
			this.system.OSName = "iOS";
			parseIOSVersion.apply(this, [userAgentString]);
		}
		else if (this.system.Android) {
			this.system.OSName = "Android";
			parseAndroidVersion.apply(this, [userAgentString]);
		}
	}

	function parseBrowser(userAgentString) {
		// Safari: Version/X.X.X Safari/XXX
		// Chrome: Chrome/XX.X.XX.XX Safari/XXX
		// Opera: Opera/X.XX
		// Firefox: Gecko/XXXXXX Firefox/XX.XX.XX
		// Explorer: MSIE X.X
		this.browser.Version = {};
		this.browser.Safari = /Version\/([\d\.]+) Safari\//.test(userAgentString);
		if (this.browser.Safari) {
			this.browser.Name = "Safari";
			this.browser.Vendor = "Apple";
			this.browser.Version.versionString = RegExp.$1;
		}

		this.browser.Chrome = /Chrome\/([\d\.]+) Safari\//.test(userAgentString) ||
							  /Chrome\/([\d\.]+) Electron\//.test(userAgentString);
		if (this.browser.Chrome) {
			this.browser.Name = "Chrome";
			this.browser.Vendor = "Google";
			this.browser.Version.versionString = RegExp.$1;
        }
        
        // The attribute this.browser.Chrome will still be true, because it is the same browser after all
        this.browser.EdgeChromium = /Chrome.*Edg\/([0-9\.]+)/.test(userAgentString);
        if (this.browser.EdgeChromium) {
            this.browser.Name = "Edge Chromium";
            this.browser.Vendor = "Microsoft";
            this.browser.Version.versionString = RegExp.$1;
        }

		this.browser.Opera = /Opera\/[\d\.]+/.test(userAgentString);
		if (this.browser.Opera) {
			this.browser.Name = "Opera";
			this.browser.Vendor = "Opera Software";
			var versionString = /Version\/([\d\.]+)/.test(userAgentString);
			this.browser.Version.versionString = RegExp.$1;
		}

		this.browser.Firefox = /Gecko\/[\d\.]+ Firefox\/([\d\.]+)/.test(userAgentString);
		if (this.browser.Firefox) {
			this.browser.Name = "Firefox";
			this.browser.Vendor = "Mozilla Foundation";
			this.browser.Version.versionString = RegExp.$1;
		}

		let firefoxIOS = this.browser.Firefox || /FxiOS\/(\d+\.\d+)/.test(userAgentString);
		if (firefoxIOS) {
			this.browser.Firefox = true;
			this.browser.Name = "Firefox";
			this.browser.Vendor = "Mozilla Foundation";
			this.browser.Version.versionString = RegExp.$1;
		}

		this.browser.Edge = /Edge\/(.*)/.test(userAgentString);
		if (this.browser.Edge) {
			var result = /Edge\/(.*)/.exec(userAgentString);
			this.browser.Name = "Edge";
			this.browser.Chrome = false;
			this.browser.Vendor = "Microsoft";
			this.browser.Version.versionString = result[1];
		} 

		this.browser.Explorer = /MSIE ([\d\.]+)/.test(userAgentString);
		if (!this.browser.Explorer) {
			var re = /\Mozilla\/5.0 \(([^)]+)\) like Gecko/
			var matches = re.exec(userAgentString);
			if (matches) {
				re = /rv:(.*)/
				var version = re.exec(matches[1]);
				this.browser.Explorer = true;
				this.browser.Name = "Internet Explorer";
				this.browser.Vendor = "Microsoft";
				if (version) {
					this.browser.Version.versionString = version[1];
				}
				else {
					this.browser.Version.versionString = "unknown";
				}
			}
		}
		else {
			this.browser.Name = "Internet Explorer";
			this.browser.Vendor = "Microsoft";
			this.browser.Version.versionString = RegExp.$1;
		}

		if (this.system.iOS) {
			this.browser.IsMobileVersion = true;
			this.browser.MobileSafari = /Version\/([\d\.]+) Mobile/.test(userAgentString);
			if (this.browser.MobileSafari) {
				this.browser.Name = "Mobile Safari";
				this.browser.Vendor = "Apple";
				this.browser.Version.versionString = RegExp.$1;
			}
			this.browser.Android = false;
		}
		else if (this.system.Android) {
			this.browser.IsMobileVersion = true;
			this.browser.Android = /Version\/([\d\.]+) Mobile/.test(userAgentString);
			if (this.browser.MobileSafari) {
				this.browser.Name = "Android Browser";
				this.browser.Vendor = "Google";
				this.browser.Version.versionString = RegExp.$1;
			}
			else {
				this.browser.Chrome = /Chrome\/([\d\.]+)/.test(userAgentString);
				this.browser.Name = "Chrome";
				this.browser.Vendor = "Google";
				this.browser.Version.versionString = RegExp.$1;
			}

			this.browser.Safari = false;
		}
		else {
			this.browser.IsMobileVersion = false;
		}

		parseBrowserVersion.apply(this, [userAgentString]);
	}

	function parseBrowserVersion(userAgentString) {
		if (/([\d]+)\.([\d]+)\.*([\d]*)/.test(this.browser.Version.versionString)) {
			this.browser.Version.major = Number(RegExp.$1);
			this.browser.Version.minor = Number(RegExp.$2);
			this.browser.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
		}
	}

	function parseMacOSVersion(userAgentString) {
		var versionString = (/Mac OS X (\d+_\d+_*\d*)/.test(userAgentString)) ? RegExp.$1:'';
		this.system.Version = {};
		// Safari/Chrome
		if (versionString!='') {
			if (/(\d+)_(\d+)_*(\d*)/.test(versionString)) {
				this.system.Version.major = Number(RegExp.$1);
				this.system.Version.minor = Number(RegExp.$2);
				this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
			}
		}
		// Firefox/Opera
		else {
			versionString = (/Mac OS X (\d+\.\d+\.*\d*)/.test(userAgentString)) ? RegExp.$1:'Unknown';
			if (/(\d+)\.(\d+)\.*(\d*)/.test(versionString)) {
				this.system.Version.major = Number(RegExp.$1);
				this.system.Version.minor = Number(RegExp.$2);
				this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
			}
		}
		if (!this.system.Version.major) {
			this.system.Version.major = 0;
			this.system.Version.minor = 0;
			this.system.Version.revision = 0;
		}
		this.system.Version.stringValue = this.system.Version.major + '.' + this.system.Version.minor + '.' + this.system.Version.revision;
		switch (this.system.Version.minor) {
			case 0:
				this.system.Version.name = "Cheetah";
				break;
			case 1:
				this.system.Version.name = "Puma";
				break;
			case 2:
				this.system.Version.name = "Jaguar";
				break;
			case 3:
				this.system.Version.name = "Panther";
				break;
			case 4:
				this.system.Version.name = "Tiger";
				break;
			case 5:
				this.system.Version.name = "Leopard";
				break;
			case 6:
				this.system.Version.name = "Snow Leopard";
				break;
			case 7:
				this.system.Version.name = "Lion";
				break;
			case 8:
				this.system.Version.name = "Mountain Lion";
                break;
            case 9:
                this.system.Version.name = "Mavericks";
                break;
            case 10:
                this.system.Version.name = "Yosemite";
                break;
            case 11:
                this.system.Version.name = "El Capitan";
                break;
            case 12:
                this.system.Version.name = "Sierra";
                break;
            case 13:
                this.system.Version.name = "High Sierra";
                break;
            case 14:
                this.system.Version.name = "Mojave";
                break;
            case 15:
                this.system.Version.name = "Catalina";
                break;
		}
	}

	function parseWindowsVersion(userAgentString) {
		this.system.Version = {};
		if (/NT (\d+)\.(\d*)/.test(userAgentString)) {
			this.system.Version.major = Number(RegExp.$1);
			this.system.Version.minor = Number(RegExp.$2);
			this.system.Version.revision = 0;	// Solo por compatibilidad
			this.system.Version.stringValue = "NT " + this.system.Version.major + "." + this.system.Version.minor;
			var major = this.system.Version.major;
			var minor = this.system.Version.minor;
			var name = 'undefined';
			if (major==5) {
				if (minor==0) this.system.Version.name = '2000';
				else this.system.Version.name = 'XP';
			}
			else if (major==6) {
				if (minor==0) this.system.Version.name = 'Vista';
				else if (minor==1) this.system.Version.name = '7';
                else if (minor==2) this.system.Version.name = '8';
            }
            else if (major==10) {
                this.system.Version.name = "10";
            }
		}
		else {
			this.system.Version.major = 0;
			this.system.Version.minor = 0;
			this.system.Version.name = "Unknown";
			this.system.Version.stringValue = "Unknown";
		}
	}

	function parseLinuxVersion(userAgentString) {
		// Muchos navegadores no proporcionan información sobre la distribución de linux... no se puede hacer mucho más que esto
		this.system.Version = {};
		this.system.Version.major = 0;
		this.system.Version.minor = 0;
		this.system.Version.revision = 0;
		this.system.Version.name = "";
		this.system.Version.stringValue = "Unknown distribution";
	}

	function parseIOSVersion(userAgentString) {
		this.system.Version = {};

		if (/iPhone OS (\d+)_(\d+)_*(\d*)/i.test(userAgentString) || /iPad; CPU OS (\d+)_(\d+)_*(\d*)/i.test(userAgentString)) {
			this.system.Version.major = Number(RegExp.$1);
			this.system.Version.minor = Number(RegExp.$2);
			this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
			this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
			this.system.Version.name = "iOS";
		}
		else {
			this.system.Version.major = 0;
			this.system.Version.minor = 0;
			this.system.Version.name = "Unknown";
			this.system.Version.stringValue = "Unknown";
		}
	}

	function parseAndroidVersion(userAgentString) {
		this.system.Version = {};
		if (/Android (\d+)\.(\d+)\.*(\d*)/.test(userAgentString)) {
			this.system.Version.major = Number(RegExp.$1);
			this.system.Version.minor = Number(RegExp.$2);
			this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
			this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
		}
		else {
			this.system.Version.major = 0;
			this.system.Version.minor = 0;
			this.system.Version.revision = 0;
		}
		if (/Build\/([a-zA-Z]+)/.test(userAgentString)) {
			this.system.Version.name = RegExp.$1;
		}
		else {
			this.system.Version.name = "Unknown version";
		}
		this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
	}

	function getInfoString() {
		return navigator.userAgent;
    }
    
    class UserAgent {
		constructor(userAgentString = null) {
            if (!userAgentString) {
                userAgentString = navigator.userAgent;
            }
			this._system = {};
			this._browser = {};

            parseOperatingSystem.apply(this,[userAgentString]);
            parseBrowser.apply(this, [userAgentString]);
		}

		get system() { return this._system; }

		get browser() { return this._browser; }

        getInfoString() {
            return navigator.userAgent;
        }

        get infoString() { navigator.userAgent; }
	}

    paella.UserAgent = UserAgent;

    paella.utils.userAgent = new paella.UserAgent();
    
})();
