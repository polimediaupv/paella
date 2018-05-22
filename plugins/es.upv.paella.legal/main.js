
paella.addPlugin(() => {
    return class LegalPlugin extends paella.VideoOverlayButtonPlugin {
        getIndex() { return 0; }
        getSubclass() { return "legal"; }
        getAlignment() { return "right"; }
        getDefaultToolTip() { return ""; }
        checkEnabled(onSuccess) { onSuccess(true); }
        setup() {
            let title = document.createElement('a');
            title.innerHTML = "Legal";
            title.className = "";
            this.button.appendChild(title);
        }

        action(button) {
            alert("Hello");
        }

        getName() { return "es.upv.paella.legalPlugin"; }
    }
});
