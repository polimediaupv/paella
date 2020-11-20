
import React, {useRef, useState, useCallback} from 'react';
import { initCanvas } from './webgl';
import styles from './styles.module.css';

export function isVideo360CanvasCompatible() {
    return true;
}

export default function Video360Canvas ({ src }) {
    const canvasRef = useRef();
    const setCanvasRef = useCallback(canvas => {
        if (canvasRef.current) {
            // Asegurarnos de limpiar cualquier evento o referencias
        }

        if (canvas) {
            const gl = canvas.getContext("webgl");
            console.log(gl);


            initCanvas(gl);
        }

        canvasRef.current = canvas;
    }, []);

    return (
        <canvas className={styles.canvas} ref={setCanvasRef}>Video 360 canvas not implemented. Source: {src}</canvas>
    );
}
