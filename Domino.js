//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_28.js 
//
//  Applying a texture
//
//  Adapted from learningwebgl.com
//
//  J. Madeira - November 2015
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context

var shaderProgram = null; 

// NEW --- Buffers

var cubeVertexPositionBuffer = null;

var cubeVertexIndexBuffer_front = null;
var cubeVertexIndexBuffer_others = null;

var cubeVertexTextureCoordBuffer0, cubeVertexTextureCoordBuffer1;

// The global transformation parameters

// The translation vector

var tpx = [-8.7,-7.0,-5.3,-3.6,-1.9,-0.2,1.5];
var tpy = [-7,-7,-7,-7,-7,-7,-7];
var tpz = [0,0,0,0,0,0,0];

var tcx = [8,-16.5,-15,-13.5,-12,-10.5,-9];
var tcy = [0,15,15,15,15,15,15];
var tcz = [0,0,0,0,0,0,0];

var tx = 0.0;

var ty = 0.0;

var tz = 0.0;

// The rotation angles in degrees

var angleXX = 0.0;

var angleYY = 0.0;

var angleZZ = 0.0;


var anglepXX = [0,0,0,0,0,0,0];

var anglepYY = [0,0,0,0,0,0,0];

var anglepZZ = [0,0,0,0,0,0,0];


var tileIndex = 0;

//Texturas player
var playerTextures = [];

//Texturas computer
var pcTextures = [];

//Texturas "deck"
var deckTextures = [];

// The scaling factors

var sx = 0.10;

var sy = 0.10;

var sz = 0.10;

var scx = 0.05;

var scy = 0.05;

var scz = 0.05;

// NEW - Animation controls

var rotationXX_ON = 1;

var rotationXX_DIR = 1;

var rotationXX_SPEED = 1;
 
var rotationYY_ON = 1;

var rotationYY_DIR = 1;

var rotationYY_SPEED = 1;
 
var rotationZZ_ON = 1;

var rotationZZ_DIR = 1;

var rotationZZ_SPEED = 1;
 
// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 0;
 
// From learningwebgl.com

// NEW --- Storing the vertices defining the cube faces

vertices = [
            // Front face
            -0.5, -2,  0.25,
             0.5, -2,  0.25,
             0.5,  2,  0.25,
            -0.5,  2,  0.25,

            // Back face
            -0.5, -2, -0.25,
            -0.5,  2, -0.25,
             0.5,  2, -0.25,
             0.5, -2, -0.25,

            // Top face
            -0.5,  2, -0.25,
            -0.5,  2,  0.25,
             0.5,  2,  0.25,
             0.5,  2, -0.25,

            // Bottom face
            -0.5, -2, -0.25,
             0.5, -2, -0.25,
             0.5, -2,  0.25,
            -0.5, -2,  0.25,

            // Right face
             0.5, -2, -0.25,
             0.5,  2, -0.25,
             0.5,  2,  0.25,
             0.5, -2,  0.25,

            // Left face
            -0.5, -2, -0.25,
            -0.5, -2,  0.25,
            -0.5,  2,  0.25,
            -0.5,  2, -0.25
];

// Texture coordinates for the quadrangular faces

// Notice how they are assigne to the corresponding vertices

var textureCoords_dots_face = [

          // Front face
          0.0, 0.0,
          0.5, 0.0,
          0.5, 1,
          0.0, 1
];

var textureCoords_other_faces = [
          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0
];

// Vertex indices defining the triangles
        
var cubeVertexIndices_front = [
            0, 1, 2,      0, 3, 2    // Front face
	];

var cubeVertexIndices_others = [
            4, 5, 6,      4, 6, 7,    // Back face

            8, 9, 10,     8, 10, 11,  // Top face

            12, 13, 14,   13, 15, 14, // Bottom face

            16, 17, 18,   17, 19, 18, // Right face

            20, 21, 22,   20, 22, 23  // Left face
];

var main, sec, count=0, tiles=[];
for(main = 0; main < 7; main++) {
	for (sec = main; sec < 7; sec++) {
		tiles[count] = main + "_" + sec + ".png";
		console.log(tiles[count]);
		count++;
	}
}
console.log(tiles.slice(0, tiles.length));

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Textures

// From www.learningwebgl.com

function handleLoadedTexture(texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
}

var webGLTexture_dots_face = null, webGLTexture_black_faces = null;

function initTextures() {
	bindImgToTexture(pcTextures, 0, null);
	pcTextures[0].image.src = tiles[27]; // 6_6.png
	tiles.splice(27, 1);

	var i = 1;
	while(i < 7) {
		addTextureToList(pcTextures, i);
		i++;
	}
	i=0;
	while(tiles.length>14 && tiles.length <=21) {
		addTextureToList(playerTextures, i);
		i++;
	}
	i=0;
	while(tiles.length>0 && tiles.length<=14) {
		addTextureToList(deckTextures, i);
		i++;
	}

	bindImgToTexture(webGLTexture_black_faces, null, "blacksquare.png");
}

function addTextureToList(textureList, index) {
	bindImgToTexture(textureList, index, null);
	let random_tile = Math.floor(Math.random() * tiles.length);
	textureList[index].image.src=tiles[random_tile];
	tiles.splice(random_tile, 1);
}

function bindImgToTexture(textureList, index, img){
	if(textureList === null && index == null){
		textureList = gl.createTexture();
		textureList.image = new Image();
		textureList.image.onload = function () {
			handleLoadedTexture(textureList)
		};
		textureList.image.src = img;
	} else {
		textureList[index] = gl.createTexture();
		textureList[index].image = new Image();
		let texture = textureList[index];
		textureList[index].image.onload = function () {
			handleLoadedTexture(texture)
		};
	}
}
/*
function changeTexture(){
	var random_tile = Math.floor(Math.random() * tiles.length);
	webGLTexture_dots_face.image.src = tiles[random_tile];
	tiles.splice(random_tile, 1);
}
 */

//----------------------------------------------------------------------------

// Handling the Buffers

function initBuffers() {	
	
	// Coordinates
		
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = vertices.length / 3;			

	// Textures

	//other faces
	cubeVertexTextureCoordBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords_other_faces), gl.STATIC_DRAW);
	cubeVertexTextureCoordBuffer1.itemSize = 2;
	cubeVertexTextureCoordBuffer1.numItems = 20;

	// front face
    cubeVertexTextureCoordBuffer0 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer0);
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords_dots_face), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer0.itemSize = 2;
    cubeVertexTextureCoordBuffer0.numItems = 4;//24;


	// Vertex indices

	cubeVertexIndexBuffer_front = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer_front);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices_front), gl.STATIC_DRAW);
	cubeVertexIndexBuffer_front.itemSize = 1;
	cubeVertexIndexBuffer_front.numItems = 6;

	cubeVertexIndexBuffer_others = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer_others);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices_others), gl.STATIC_DRAW);
	cubeVertexIndexBuffer_others.itemSize = 1;
	cubeVertexIndexBuffer_others.numItems = 30;


}

//----------------------------------------------------------------------------

//  Drawing the model

function drawDominoModel(angleXX, angleYY, angleZZ,
						 sx, sy, sz,
						 tx, ty, tz,
						 mvMatrix,
						 primitiveType,
						 front_face_texture) {
    // Pay attention to transformation order !!

	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );

	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );

	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );

	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );

	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Passing the buffers
    	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// NEW --- Textures
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer0);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer0.itemSize, gl.FLOAT, false, 0, 0);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, front_face_texture);
        
    gl.uniform1i(shaderProgram.samplerUniform, 0);

	// The vertex indices

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer_front);

	// Drawing the triangles --- NEW --- DRAWING ELEMENTS

	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer_front.numItems, gl.UNSIGNED_SHORT, 0);

	// NEW --- Textures

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer1);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer1.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, webGLTexture_black_faces);

	gl.uniform1i(shaderProgram.samplerUniform, 0);

    // The vertex indices
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer_others);

	// Drawing the triangles --- NEW --- DRAWING ELEMENTS 
	
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer_others.numItems, gl.UNSIGNED_SHORT, 0);
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing with the background color
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// NEW --- Computing the Projection Matrix
	
	if( projectionType === 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		tz = 0;
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective( 45, 1, 0.05, 10 );
		
		tz = -2.25;

	}
	
	// Passing the Projection Matrix to apply the current projection

	let pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Instantianting the same model more than once !!
	
	// And with diferent transformation parameters !!
	
	// Call the drawModel function

	// Instance 8 --- middle board
	drawDominoModel(-angleXX, angleYY, angleZZ,
		sx, sy, sz,
		tx*sx, ty*sy, tz*sz,
		mvMatrix,
		primitiveType, deckTextures[0] );


	let i = 0;
	for(i; i < tpx.length; i++){
		drawDominoModel(anglepXX[i],anglepYY[i],anglepZZ[i],
			sx, sy, sz,
			tpx[i]*sx, tpy[i]*sz, tpz[i]*sz,
			mvMatrix,
			primitiveType, playerTextures[i]
		);
	}

	//Computer pieces
	i = 0;
	let angleY = 0, sxtmp = sx, sytmp = sy, sztmp = sz;
	for(i; i < pcTextures.length; i++){
		if(i === 1){
			angleY = 180;
			sxtmp = scx;
			sytmp = scy;
			sztmp = scz;
		}
		drawDominoModel( 0, angleY,0, //-angleXX, angleYY, angleZZ,
			sxtmp, sytmp, sztmp,
			tcx[i]*sxtmp, tcy[i]*sytmp, tcz[i]*sztmp,
			mvMatrix,
			primitiveType, pcTextures[i]
		);
	}

	let j = 1;
	for(j; j <= tpx.length; j++){
		document.getElementById("tile" + j.toString()).disabled = false;
	}

	j = tpx.length + 1;
	for(j; j > tpx.length && j <= 9; j++){
		document.getElementById("tile" + j.toString()).disabled = true;
	}

}


//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime !== 0 ) {
		
		var elapsed = timeNow - lastTime;
		
		if( rotationXX_ON ) {
			angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationYY_ON ) {
			angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationZZ_ON ) {
			angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }
	}
	
	lastTime = timeNow;
}

//----------------------------------------------------------------------------

// Handling keyboard events

// Adapted from www.learningwebgl.com

var currentlyPressedKeys = {};

function handleKeys() {
	let valuePageUpOrDown;

	if (currentlyPressedKeys[33]) {
		valuePageUpOrDown = 0.99;  // Page Up
	} else if (currentlyPressedKeys[34]) {
		valuePageUpOrDown = 1.01;  // Page Down
	}

	if (currentlyPressedKeys[33] || currentlyPressedKeys[34]) {
		sx *= valuePageUpOrDown;
		sz = sy = sx;
		scx *= valuePageUpOrDown;
		scz = scy = scx;
	}


	if (currentlyPressedKeys[37]) {
		// Left cursor key
		tpx[tileIndex]-=0.05;
	}

	if (currentlyPressedKeys[39]) {
		// Right cursor key
		tpx[tileIndex]+=0.05;
	}

	if (currentlyPressedKeys[38]) {
		// Up cursor key
		tpy[tileIndex]+=0.05;
	}

	if (currentlyPressedKeys[40]) {
		// Down cursor key
		tpy[tileIndex]-=0.05;
	}

	document.addEventListener("keypress", function(event){

		var bgColor = document.getElementById("bg-color");

		// Getting the pressed key and setting the bg color

		var key = event.keyCode; // ASCII

		switch(key){
			case 114:
				anglepZZ[tileIndex]+=90;
		}

		// Render the viewport
	});
}

//----------------------------------------------------------------------------

// Handling mouse events

// Adapted from www.learningwebgl.com


var mouseDown = false;

var lastMouseX = null;

var lastMouseY = null;

function handleMouseDown(event) {
    mouseDown = true;
  
    lastMouseX = event.clientX;
  
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {
	  
      return;
    } 
  
    // Rotation angles proportional to cursor displacement
    
    var newX = event.clientX;
  
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    
    angleYY += radians( 10 * deltaX  );

    var deltaY = newY - lastMouseY;
    
    angleXX += radians( 10 * deltaY  );
    
    lastMouseX = newX;
    
    lastMouseY = newY;
  }
//----------------------------------------------------------------------------

// Timer

function tick() {
	
	requestAnimFrame(tick);
	
	// NEW --- Processing keyboard events 
	
	handleKeys();
	
	drawScene();
	
	animate();
}




//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
		
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ){
	
	// NEW ---Handling the mouse
	
	// From learningwebgl.com

    canvas.onmousedown = handleMouseDown;
    
    document.onmouseup = handleMouseUp;
    
    document.onmousemove = handleMouseMove;
    
    // NEW ---Handling the keyboard
	
	// From learningwebgl.com

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

	document.onkeydown = handleKeyDown;
    
    document.onkeyup = handleKeyUp;
	
	// Dropdown list
	
	var projection = document.getElementById("projection-selection");
	
	projection.addEventListener("click", function(){
		// Getting the selection
		var p = projection.selectedIndex;
				
		switch(p){
			case 0 : projectionType = 0;
				break;
			case 1 : projectionType = 1;
				break;
		}  	
	});      


	// Button events
	
	document.getElementById("XX-on-off-button").onclick = function(){
		// Switching on / off
		if( rotationXX_ON ) {
			rotationXX_ON = 0;
		}
		else {
			rotationXX_ON = 1;
		}  
	};

	document.getElementById("XX-direction-button").onclick = function(){
		// Switching the direction
		if( rotationXX_DIR === 1 ) {
			rotationXX_DIR = -1;
		}
		else {
			rotationXX_DIR = 1;
		}  
	};      

	document.getElementById("XX-slower-button").onclick = function(){
		rotationXX_SPEED *= 0.75;  
	};      

	document.getElementById("XX-faster-button").onclick = function(){
		rotationXX_SPEED *= 1.25;  
	};      

	document.getElementById("YY-on-off-button").onclick = function(){
		// Switching on / off
		if( rotationYY_ON ) {
			rotationYY_ON = 0;
		}
		else {
			rotationYY_ON = 1;
		}  
	};

	document.getElementById("YY-direction-button").onclick = function(){
		// Switching the direction
		if( rotationYY_DIR === 1 ) {
			rotationYY_DIR = -1;
		}
		else {
			rotationYY_DIR = 1;
		}  
	};      

	document.getElementById("YY-slower-button").onclick = function(){
		rotationYY_SPEED *= 0.75;  
	};      

	document.getElementById("YY-faster-button").onclick = function(){
		rotationYY_SPEED *= 1.25;  
	};      

	document.getElementById("ZZ-on-off-button").onclick = function(){
		// Switching on / off
		if( rotationZZ_ON ) {
			rotationZZ_ON = 0;
		}
		else {
			rotationZZ_ON = 1;
		}  
	};

	document.getElementById("ZZ-direction-button").onclick = function(){
		// Switching the direction
		if( rotationZZ_DIR === 1 ) {
			rotationZZ_DIR = -1;
		}
		else {
			rotationZZ_DIR = 1;
		}  
	};      

	document.getElementById("ZZ-slower-button").onclick = function(){
		rotationZZ_SPEED *= 0.75;  
	};      

	document.getElementById("ZZ-faster-button").onclick = function(){
		rotationZZ_SPEED *= 1.25;  
	};      

	document.getElementById("reset-button").onclick = function(){
		// The initial values
		tx = 0.0;
		ty = 0.0;
		tz = 0.0;

		angleXX = 0.0;
		angleYY = 0.0;
		angleZZ = 0.0;

		sx = 0.1;
		sy = 0.1;
		sz = 0.1;

		scx = 0.05;
		scy = 0.05;
		scz = 0.05;
		
		rotationXX_ON = 0;
		rotationXX_DIR = 1;
		rotationXX_SPEED = 1;

		rotationYY_ON = 0;
		rotationYY_DIR = 1;
		rotationYY_SPEED = 1;

		rotationZZ_ON = 0;
		rotationZZ_DIR = 1;
		rotationZZ_SPEED = 1;
	};

	document.getElementById("tile1").onclick = function(){
		tileIndex = 0;
	};

	document.getElementById("tile2").onclick = function(){
		tileIndex = 1;
	};

	document.getElementById("tile3").onclick = function(){
		tileIndex = 2;
	};

	document.getElementById("tile4").onclick = function(){
		tileIndex = 3;
	};

	document.getElementById("tile5").onclick = function(){
		tileIndex = 4;
	};

	document.getElementById("tile6").onclick = function(){
		tileIndex = 5;
	};

	if(tpx.length<7){
		document.getElementById("tile7").disabled = true;
	}

	document.getElementById("tile7").onclick = function(){
		tileIndex = 6;
	};

	document.getElementById("tile8").onclick = function(){
		tileIndex = 7;
	};

	document.getElementById("getTile").onclick = function(){
		tpx[tpx.length] = tpx[tpx.length-1] + 1.7;
		tpy[tpy.length] = -7;
		tpz[tpz.length] = 0;
		anglepXX[anglepXX.length] = 0;
		anglepYY[anglepYY.length] = 0;
		anglepZZ[anglepZZ.length] = 0;
	};

}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		// Some browsers still need "experimental-webgl"
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas 
		
		// DEFAULT: The viewport background color is WHITE
		
		// NEW - Drawing the triangles defining the model
		
		primitiveType = gl.TRIANGLES;
		
		// DEFAULT: The Depth-Buffer is DISABLED
		
		// Enable it !
		
		gl.enable( gl.DEPTH_TEST );
		
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------


function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
	
	initWebGL( canvas );

	shaderProgram = initShaders( gl );
	
	setEventListeners( canvas );
	
	initBuffers();
	
	initTextures();
	
	tick();		// A timer controls the rendering / animation    

	outputInfos();
}


