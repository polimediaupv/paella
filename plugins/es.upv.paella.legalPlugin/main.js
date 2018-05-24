(function() {
    class LegalPlugin extends paella.VideoOverlayButtonPlugin {
        getIndex() { return 0; }
        getSubclass() { return "legal"; }
        getAlignment() { return paella.player.config.plugins.list[this.getName()].position; }
        getDefaultToolTip() { return ""; }
        
        checkEnabled(onSuccess) {
            let plugin = paella.player.config.plugins.list[this.getName()];
            this._label = plugin.label;
            this._url = plugin.legalUrl;
            onSuccess(true);
        }

        setup() {
            let title = document.createElement('a');
            title.innerHTML = this._label;
            title.className = "";
            this.button.appendChild(title);
        }

        action(button) {
            window.open(this._url);
        }

        getName() { return "es.upv.paella.legalPlugin"; }
    }

    paella.plugins.legalPlugin = new LegalPlugin();
})();