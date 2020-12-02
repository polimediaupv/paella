import {mat4} from 'gl-matrix';

const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

const fsSource = `
void main() {
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
}
`;

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error occurred compiling the shader: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Error creating shader program: " + gl.getProgramInfoLog(shaderProgram));
        gl.deleteShader(shaderProgram);
        return null;
    }

    return shaderProgram;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        -1.0, 1.0, 
         1.0, 1.0,
        -1.0,-1.0,
         1.0,-1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer
    };
}

export function reshape(gl) {
    if (gl.canvas.width !== gl.canvas.offsetWidth || gl.canvas.height !== gl.canvas.offsetHeight) {
        let size = [gl.canvas.offsetWidth, gl.canvas.offsetHeight];
        gl.canvas.width = size[0];
        gl.canvas.height = size[1];

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.width / gl.canvas.height;
        const zNear = 0.1;
        const zFar = 100;
        mat4.perspective(gl.sceneData.matrix.projection,
            fieldOfView,
            aspect,
            zNear,
            zFar);
    }
    
}

export function drawFrame(gl, deltaTime) {
    
    
    // Reshape: TODO: do this only once, and when the canvas size changes
    reshape(gl);

    // Update:
    mat4.identity(gl.sceneData.matrix.modelview);
    mat4.translate(gl.sceneData.matrix.modelview, gl.sceneData.matrix.modelview, [-0.0, 0.0, -6.0]);
    gl.sceneData.rotation += 0.1 * deltaTime/100; 
    mat4.rotate(gl.sceneData.matrix.modelview, gl.sceneData.matrix.modelview, gl.sceneData.rotation, [0, 1, 0]);

    // Draw
    const programInfo = gl.sceneData.programInfo;
    const buffers = gl.sceneData.buffers;

    gl.clearColor(0, 0, 1, 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    {
        const numComponents = 2;    // 2 valores por iteracion
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        gl.sceneData.matrix.projection);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        gl.sceneData.matrix.modelview);
    
    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

class SceneData {
    constructor(programInfo, buffers, matrix = null) {

        this.programInfo = programInfo || {
            program: -1,
            attribLocations: {
                vertexPosition: null
            },
            uniformLocations: {
                projectionMatrix: null,
                modelViewMatrix: null
            }
        };
    
        this.buffers = buffers || {
            position: null
        };
    
        this.matrix = matrix || {
            projection: mat4.create(),
            modelview: mat4.create()
        }

        this.rotation = 0;
    }
};

export function initCanvas(gl) {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
        }
    };

    const buffers = initBuffers(gl);

    gl.sceneData = new SceneData(programInfo, buffers)

    let startTime = 0;
    function animate(time) {
        let deltaTime = time - startTime;

        drawFrame(gl, deltaTime);
        startTime = time;

        window.requestAnimationFrame(animate);
    }

    animate(0);
}

