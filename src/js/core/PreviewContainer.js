
import { DomClass } from './dom';

const g_style = `
    background-image: url("[BACKGROUND_IMAGE]");
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100%;
`
export default class PreviewContainer extends DomClass {
    constructor(player, parentElement,backgroundImage) {
        const attributes = {
            "class": "preview-container",
            "style": g_style.replace('[BACKGROUND_IMAGE]', backgroundImage)
        };
        super(player, {attributes, parent: parentElement});

        this.element.addEventListener("click", (evt) => {
            player.play();
        });
    }

    loadBackgroundImage(src) {
        this.setAttribute("style",g_style.replace('[BACKGROUND_IMAGE]',src));
    }
}
