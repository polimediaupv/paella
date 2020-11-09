
import Html5VideoCanvas, { isHtml5VideoCompatible } from './Html5VideoCanvas';
import Video360Canvas, { isVideo360CanvasCompatible } from './Video360Canvas';

export function selectCanvas(canvasArray) {
    let selectedCanvas = null;
    
    canvasArray.some(c => {
        if (c==='html5' && isHtml5VideoCompatible()) {
            selectedCanvas = 'html5';
        }
        else if (c==='video360' && isVideo360CanvasCompatible()) {
            selectedCanvas = 'video360';
        }
        return selectedCanvas !== null;
    });

    return selectedCanvas;
}

export default function VideoCanvas({ src, canvas }) {
    switch (selectCanvas(canvas)) {
    case 'html5':
        return <Html5VideoCanvas src={src}></Html5VideoCanvas>
    case 'video360':
        return <Video360Canvas src={src}></Video360Canvas>
    default:
        return <h1>Incompatible video canvas</h1>;
    }
}
