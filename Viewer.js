// Viewer.js
// Rachael Keller
// ME 4563 Project5

// Vertex shader program
var vertex_shader_source =

    'uniform mat4 projectionMatrix;\n' +
    'uniform mat4 modelMatrix;\n' +
    'uniform vec3 lightDirection;\n' +
    'uniform vec3 lightColor;\n' +
    'uniform vec3 objectColor;\n' +
    'attribute vec4 vertexPosition;\n' +
    'attribute vec3 vertexNormal;\n' +
    'varying vec4 p;\n' +
    'varying vec3 n;\n' +
    'varying vec3 v;\n' +
    'varying vec3 h;\n' +
    'float d;\n' +
    'float s;\n' +
    'varying vec3 l;\n' +
    'varying mediump vec3 fragmentColor;\n'+
    'void main() {\n' +
    '    p  = modelMatrix * vertexPosition;\n'+
    '    n  = normalize(mat3(modelMatrix) * vertexNormal);\n'+
    '    l  = normalize(mat3(modelMatrix)*lightDirection);\n'+
    '    v  = normalize(vec3(-1.0*p));\n'+
    '    h  = normalize(v+l);\n'+
    '    d  = max(dot(n,l),0.0);\n'+
    '    s  = pow(max(dot(n,h),0.0),100.0);\n'+
    '    l  = normalize(v+l);\n'+
    '    fragmentColor = lightColor * (objectColor * d+s);\n' +
    '    gl_Position   = projectionMatrix * modelMatrix * vertexPosition;\n' +
    '}\n';

// Fragment shader program
var fragment_shader_source =

    'varying mediump vec3 fragmentColor;\n' +
    'void main() {\n' +
    '    gl_FragColor = vec4(fragmentColor, 1.0);\n' +
    '}\n';

var rotateY;
var rotateX;
var sizes = new Uint32Array(3);
var gl;
var normals = [[]];
var projectionMatrixLocation;
var modelMatrixLocation;
var lightDirectionLocation;
var objectColorLocation;

function main() {

    // Retrive <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if(!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
   if (!initShaders(gl, vertex_shader_source, fragment_shader_source)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Set the positions of vertices and build buffers.
    initVertexBuffers();

    // Check to see if vertex buffer was sucessfully filled.
    if (sizes[0] < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    // Give gl the attribute location from the program.
    var vertexPosition = gl.getAttribLocation(gl.program, 'vertexPosition');
    if (vertexPosition < 0) {
        console.log('Failed to get the storage location of vertexPosition');
        return -1;
    }   
    // Initialize and enable attribute.
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.enable(gl.DEPTH_TEST);
 
    rotateY = 0.0;
    rotateX = 0.0;
    
    draw();
    
    var dragging = false;
    var lastClientX = 0;
    var lastClientY = 0;
    
    canvas.onmousedown = function(event) {
        dragging = true;
    }
    canvas.onmouseup   = function(event) {
        dragging = false;
    }
    
    canvas.onmousemove = function move(event) {
        if(dragging) {
            rotateY  = rotateY + event.movementX;
            rotateX  = rotateX + event.movementY;
            if(rotateX > 90.0){
                rotateX = 90;
            }
            if(rotateX < -90){
                rotateX = -90;
            }
            if(rotateY > 180.0){
                rotateY -= 360;
            }
            if(rotateY < -180){
                rotateY += 360;
            }
        }
        lastClientX = event.clientX;
        lastClientY = event.clientY;
    }


   
   requestAnimationFrame(draw);

}

function initVertexBuffers() {
    
    normal_calculation();
    
    projectionMatrixLocation = gl.getUniformLocation(gl.program, 'projectionMatrix');
    modelLocation            = gl.getUniformLocation(gl.program, 'modelMatrix');
    lightDirectionLocation   = gl.getUniformLocation(gl.program, 'lightDirection');
    lightColorLocation       = gl.getUniformLocation(gl.program, 'lightColor');
    objectColorLocation      = gl.getUniformLocation(gl.program, 'objectColor');
    

    
    vertexPositionLocation = gl.getAttribLocation(gl.program, "vertexPosition");
    vertexNormalLocation   = gl.getAttribLocation(gl.program, "vertexNormal");
    
    gl.enableVertexAttribArray(vertexPositionLocation);
    gl.enableVertexAttribArray(vertexNormalLocation);
    
    positionArray = new Float32Array(flatten(vertices));
    normalArray   = new Float32Array(flatten(normals));
    triangleArray = new Uint16Array(flatten(triangles));
    
    positionBuffer = gl.createBuffer();
    normalBuffer   = gl.createBuffer();
    triangleBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,positionArray, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,normalArray, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
    

    // Store the lengths of the arrays.
    sizes[0] = positionArray.length;
    sizes[1] = normalArray.length;
    sizes[2] = triangleArray.length;
   

}


function add(a,b){
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
            ];
}
function subtract(a,b){
    return [
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
            ];
}
function dot(a,b){
    return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}
function cross(a,b){
    return [
    a[1] * b[2] - a[2] * b[1] ,
    a[2] * b[0] - a[0] * b[2] ,
    a[0] * b[1] - a[1] * b[0] ,
    ];
}
function normalize(a) {
    var len = Math.sqrt(dot(a, a));
    if (len == 0) {
        len = 1;
    }
        return [
            a[0] / len,
            a[1] / len,
            a[2] / len
            ];
      }

function normal_calculation() {
    p = vertices.length;
    q = triangles.length;
    for (var i = 0; i < p; ++i) {
        normals.push([0.0,0.0,0.0]);
    }
    
    for (var i = 0; i < q; ++i) {
        
        a = normalize(subtract(vertices[triangles[i][1]], vertices[triangles[i][0]]));
        b = normalize(subtract(vertices[triangles[i][2]], vertices[triangles[i][0]]));
        
        n = normalize(cross(a,b));
        
        normals[triangles[i][0]] = add(normals[triangles[i][0]], n);
        normals[triangles[i][1]] = add(normals[triangles[i][1]], n);
        normals[triangles[i][2]] = add(normals[triangles[i][2]], n);
    }

    for (var i = 0; i < p; ++i) {
        normals[i] = normalize(normals[i]);
    }


}


function draw() {

    // Clear background and reset depth.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Grab the user input on z and f.
    var z = parseFloat(document.getElementById("zinput").value);
    document.getElementById("zoutput").innerHTML = z;

    var f = parseFloat(document.getElementById("finput").value);
    document.getElementById("foutput").innerHTML = f;

    // Get access to Projection and Model variables.
    var projectionMatrix = new Matrix4();
    var modelMatrix      = new Matrix4();
    
    projectionMatrix.setPerspective(f, 1, 1, 10);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);

    modelMatrix.setTranslate(0, 0, -z);
    modelMatrix.rotate(rotateX, 1, 0, 0);
    modelMatrix.rotate(rotateY, 0, 1, 0);
    gl.uniformMatrix4fv(modelLocation, false, modelMatrix.elements);
    
    gl.uniform3f(lightDirectionLocation,  0.0, 1.0, 1.0);
    gl.uniform3f(lightColorLocation,      1.0, 1.0, 1.0);
    gl.uniform3f(objectColorLocation,     0.8, 0.8, 0.8);
    

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, sizes[2], gl.UNSIGNED_SHORT, 0);

    // Recall draw function.
    requestAnimationFrame(draw);

}


function flatten(a) {
    return a.reduce(function (b, v) { b.push.apply(b, v); return b }, [])
}
