
paella.addPlugin(() => {
    return class LegalPlugin extends paella.VideoOverlayButtonPlugin {
        getIndex() { return 0; }
        getSubclass() { return "legal"; }
        getAlignment() { return paella.player.config.plugins.list[this.getName()].position; }
        getDefaultToolTip() { return ""; }

        checkEnabled(onSuccess) {
            onSuccess(true);
        }

        setup() {
            let plugin = paella.player.config.plugins.list[this.getName()];
            let title = document.createElement('a');
            title.innerText = plugin.label;
            this._url = plugin.legalUrl;
            title.className = "";
            this.button.appendChild(title);
        }

        action(button) {
            window.open(this._url);
        }

        getName() { return "es.upv.paella.legalPlugin"; }
    }
});
