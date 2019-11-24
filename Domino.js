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

var cubeVertexIndexBufferFrontFace = null;
var cubeVertexIndexBufferNotFrontFace = null;

var cubeVertexTextureCoordBufferFrontFace = null, cubeVertexTextureCoordBufferNotFrontFace = null;

// The global transformation parameters

// The translation vector
var tpx = [-9.4];
var dist_btw_tiles = 1.1; // 1.7
for(let i = 1; i < 7; i++) {
	tpx[i] = tpx[i-1] + dist_btw_tiles;
}
var tpy = [-7, -7, -7, -7, -7, -7, -7];
var tpz = [0, 0, 0, 0, 0, 0, 0];

var tcx = [-16.5, -15, -13.5, -12, -10.5, -9];
var tcy = [15, 15, 15, 15, 15, 15];
var tcz = [0, 0, 0, 0, 0, 0];

var tbx = [0];
var tby = [0];
var tbz = [0];

var tx = 0.0;
var ty = 0.0;
var tz = 0.0;

// The rotation angles in degrees

var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;
var rotateZ = false;

var anglepXX = [0, 0, 0, 0, 0, 0, 0];
var anglepYY = [0, 0, 0, 0, 0, 0, 0];
var anglepZZ = [0, 0, 0, 0, 0, 0, 0];

var tileIndex = null;

var tilesSelected = [];
for(let i = 0; i < 7; i++){tilesSelected[i] = false;}

//Textures player
var playerTextures = [];
var playerTiles = [];

//Textures computer
var pcTextures = [];

//Textures "deck"
var deckTextures = [];
var deckTileNumber = 0;
var deckTiles = [];

// board pieces
var boardTextures = [];
var angleX_board = 12, angleY_board = 339, angleZ_board = 266;

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
var left_ortho = -1.0, right_ortho = 1.0, bottom_ortho = -1.0, top_ortho = 1.0, near_ortho = -1.0, far_ortho = 1.0;
var fovy_persp = 45; // angle in degrees
var aspect_persp = 1;
var near_persp = 0.05, far_persp = 10;
//45,1
// From learningwebgl.com

// NEW --- Storing the vertices defining the cube faces

vertices = [
	// Front face
	-0.5, -1,  0.25,
	 0.5, -1,  0.25,
	 0.5,  1,  0.25,
	-0.5,  1,  0.25,

	// Back face
	-0.5, -1, -0.25,
	-0.5,  1, -0.25,
	 0.5,  1, -0.25,
	 0.5, -1, -0.25,

	// Top face
	-0.5,  1, -0.25,
	-0.5,  1,  0.25,
	 0.5,  1,  0.25,
	 0.5,  1, -0.25,

	// Bottom face
	-0.5, -1, -0.25,
	 0.5, -1, -0.25,
	 0.5, -1,  0.25,
	-0.5, -1,  0.25,

	// Right face
	 0.5, -1, -0.25,
	 0.5,  1, -0.25,
	 0.5,  1,  0.25,
	 0.5, -1,  0.25,

	// Left face
	-0.5, -1, -0.25,
	-0.5, -1,  0.25,
	-0.5,  1,  0.25,
	-0.5,  1, -0.25
];

// Texture coordinates for the quadrangular faces

// Notice how they are assigne to the corresponding vertices

var textureCoordsFrontFace = [
	// Front face
	0.0, 0.0,
	0.5, 0.0,
	0.5, 1,
	0.0, 1
];

var textureCoordsNotFrontFace = [
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
        
var cubeVertexIndicesFrontFace = [
	0, 1, 2, 	0, 3, 2    // Front face
];

var cubeVertexIndicesNotFrontFace = [
	4, 5, 6,      4, 6, 7,    // Back face

	8, 9, 10,     8, 10, 11,  // Top face

	12, 13, 14,   13, 15, 14, // Bottom face

	16, 17, 18,   17, 19, 18, // Right face

	20, 21, 22,   20, 22, 23  // Left face
];

var main_number, sec_number, count = 0, tiles = [];
for(main_number = 0; main_number < 7; main_number++) {
	for (sec_number = main_number; sec_number < 7; sec_number++) {
		tiles[count] = main_number + "_" + sec_number + ".png";
		count++;
	}
}
//console.log(tiles.slice(0, tiles.length));

var selectedTile = null;

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

var webGLTexture_black_faces = null;

function initTextures() {
	// 6_6.png
	bindImgToTexture(boardTextures, 0, null);
	boardTextures[0].image.src = "imgs/" + tiles[27];
	tiles.splice(27, 1);

	var i = 0;
	while(i < 6) {
		addTextureToList(pcTextures, i, tiles);
		i++;
	}
	i=0;
	while(tiles.length>14 && tiles.length <=21) {
		addTextureToList(playerTextures, i, tiles);
		i++;
	}
	i=0;
	while(tiles.length>0 && tiles.length<=14) {
		addTextureToList(deckTextures, i, tiles);
		i++;
	}

	deckTileNumber = deckTextures.length;

	bindImgToTexture(webGLTexture_black_faces, null, "blacksquare.png");
}

function addTextureToList(textureList, index, fromList) {
	bindImgToTexture(textureList, index, null);
	let random_tile = Math.floor(Math.random() * fromList.length);
	if(textureList === playerTextures){
		playerTiles[index] = fromList[random_tile];
	} else if(textureList === deckTextures){
		deckTiles[index] = fromList[random_tile];
	}
	textureList[index].image.src = "imgs/" + fromList[random_tile];
	fromList.splice(random_tile, 1);
}

function bindImgToTexture(textureList, index, img){
	if(index === null){
		textureList = gl.createTexture();
		textureList.image = new Image();
		textureList.image.onload = function () {
			handleLoadedTexture(textureList)
		};
		textureList.image.src = "imgs/" + img;
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
	cubeVertexTextureCoordBufferNotFrontFace = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferNotFrontFace);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordsNotFrontFace), gl.STATIC_DRAW);
	cubeVertexTextureCoordBufferNotFrontFace.itemSize = 2;
	cubeVertexTextureCoordBufferNotFrontFace.numItems = 20;
	// front face
	cubeVertexTextureCoordBufferFrontFace = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferFrontFace);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordsFrontFace), gl.STATIC_DRAW);
	cubeVertexTextureCoordBufferFrontFace.itemSize = 2;
	cubeVertexTextureCoordBufferFrontFace.numItems = 4;//24;

	// Vertex indices
	// front face
	cubeVertexIndexBufferFrontFace = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBufferFrontFace);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndicesFrontFace), gl.STATIC_DRAW);
	cubeVertexIndexBufferFrontFace.itemSize = 1;
	cubeVertexIndexBufferFrontFace.numItems = 6;
	//other faces
	cubeVertexIndexBufferNotFrontFace = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBufferNotFrontFace);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndicesNotFrontFace), gl.STATIC_DRAW);
	cubeVertexIndexBufferNotFrontFace.itemSize = 1;
	cubeVertexIndexBufferNotFrontFace.numItems = 30;

	/*
	// Coordinates
	initBuffer(false, cubeVertexPositionBuffer, vertices, 3, vertices.length / 3);

	// Textures
	//other faces
	initBuffer(false, cubeVertexTextureCoordBufferNotFrontFace, textureCoordsNotFrontFace, 2, 20);
	// front face
	initBuffer(false, cubeVertexTextureCoordBufferFrontFace, textureCoordsFrontFace, 2, 4);

	// Vertex indices
	// front face
	initBuffer(true, cubeVertexIndexBufferFrontFace, cubeVertexIndicesFrontFace, 1, 6);
	//other faces
	initBuffer(true, cubeVertexIndexBufferNotFrontFace, cubeVertexIndicesNotFrontFace, 1, 30);

	 */

}

function initBuffer(isVertexIndices, buffer, coords, itemSize, numItems) {
	buffer = gl.createBuffer();
	if(isVertexIndices === true){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(coords), gl.STATIC_DRAW);
	} else {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	}
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;
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

	// Textures
	// Front Face
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferFrontFace);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBufferFrontFace.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, front_face_texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	// The vertex indices
	// Front Face
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBufferFrontFace);
	// Drawing the triangles --- NEW --- DRAWING ELEMENTS
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBufferFrontFace.numItems, gl.UNSIGNED_SHORT, 0);

	// Textures
	// Other Faces
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferNotFrontFace);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBufferNotFrontFace.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, webGLTexture_black_faces);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	// The vertex indices
	// Other Faces
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBufferNotFrontFace);
	// Drawing the triangles --- NEW --- DRAWING ELEMENTS
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBufferNotFrontFace.numItems, gl.UNSIGNED_SHORT, 0);

	/*
    // Passing the buffers

	// Coordinates
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Front Face
	drawTextures(front_face_texture, cubeVertexTextureCoordBufferFrontFace, cubeVertexIndexBufferFrontFace);

	// Other Faces
	drawTextures(webGLTexture_black_faces, cubeVertexTextureCoordBufferNotFrontFace, cubeVertexIndexBufferNotFrontFace);
	 */

}

function drawTextures(texture, textureBuffer, vertexBuffer) {
	// Textures
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	// The vertex indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
	// Drawing the triangles --- NEW --- DRAWING ELEMENTS
	gl.drawElements(gl.TRIANGLES, vertexBuffer.itemSize, gl.UNSIGNED_SHORT, 0);
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing with the background color
	
	gl.clear(gl.COLOR_BUFFER_BIT);




	for(let id of [/*"left_ortho", "right_ortho", "bottom_ortho",*/ "rotx", "roty", "rotz", "near_ortho", "far_ortho", "fovy_persp", "aspect_persp", "near_persp", "far_persp"]){
		let elemId = "myRange_" + id;
		let slider = document.getElementById(elemId);
		elemId = "demo_" + id;
		let output = document.getElementById(elemId);
		if(id === "near_ortho" || id === "far_ortho" || id === "near_persp" || id === "aspect_persp"){
			output.innerHTML = parseFloat(slider.value)/10;
		}else{
			output.innerHTML = slider.value;
		}
		slider.oninput = function() {
			output.innerHTML = this.value;
			switch(id){
				case "rotx":
					angleX_board = this.value;
					break;
				case "roty":
					angleY_board = this.value;
					break;
				case "rotz":
					angleZ_board = this.value;
					break;
				case "left_ortho":
					left_ortho = this.value;
					break;
				case "right_ortho":
					right_ortho = this.value;
					break;
				case "bottom_ortho":
					bottom_ortho = this.value;
					break;
				case "near_ortho":
					near_ortho = parseFloat(this.value)/10;
					break;
				case "far_ortho":
					far_ortho = parseFloat(this.value)/10;
					break;
				case "fovy_persp":
					fovy_persp = this.value;
					break;
				case "aspect_persp":
					aspect_persp = parseFloat(this.value)/10;
					break;
				case "near_persp":
					near_persp = parseFloat(this.value)/10;
					break;
				case "far_persp":
					far_persp = this.value;
					break;
			}
		};


	}

	// NEW --- Computing the Projection Matrix
	
	if( projectionType === 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho(left_ortho, right_ortho, bottom_ortho, top_ortho, near_ortho, far_ortho);
		
		tz = 0;
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective(fovy_persp, aspect_persp, near_persp, far_persp);
		
		tz = - (7 * 0.25);

	}
	
	// Passing the Projection Matrix to apply the current projection

	let pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Instantianting the same model more than once !!
	
	// And with diferent transformation parameters !!
	
	// Call the drawModel function

	/*
	// Instance middle board
	drawDominoModel(0, 0, angleZZ,
		sx, sy, sz,
		tx*sx, ty*sy, tz*sz,
		mvMatrix,
		primitiveType, deckTextures[0] );
	 */

	for(let i = 8; i<22; i++) {
		document.getElementById("tile"+i).hidden = true;
	}

	// Player pieces
	for(let i = 0; i < tpx.length; i++){
		drawDominoModel(anglepXX[i],anglepYY[i],anglepZZ[i],
			sx, sy, sz,
			tpx[i]*sx, tpy[i]*sy, tpz[i]*sz,
			mvMatrix,
			primitiveType, playerTextures[i]
		);
		let id = i + 1;
		console.log(id);
		document.getElementById("tile"+ id).innerHTML = playerTiles[i].split(".")[0];
		document.getElementById("tile"+ id).style.display= "";
		// TODO: Update player tiles
	}

	// Board pieces
	for(let i = 0; i < boardTextures.length; i++){
		drawDominoModel( angleX_board, angleY_board, angleZ_board,
			sx, sy, sz,
			tbx[i]*sx, tby[i]*sy, tbz[i]*sz,
			mvMatrix,
			primitiveType, boardTextures[i]
		);
	}

	// Computer pieces
	for(let i = 0; i < pcTextures.length; i++){
		drawDominoModel( 0, 180, 0,
			scx, scy, scz,
			tcx[i]*scx, tcy[i]*scy, tcz[i]*scz,
			mvMatrix,
			primitiveType, pcTextures[i]
		);
	}

	let j = 1;
	for(j; j <= tpx.length; j++){
		document.getElementById("tile" + j.toString()).disabled = false;
	}

	j = tpx.length + 1;
	for(j; j > tpx.length && j <= 21; j++){
		document.getElementById("tile" + j.toString()).disabled = true;
	}

	if(rotateZ && tileIndex !== null) {
		anglepZZ[tileIndex] -= 90;
		if (angleZZ[tileIndex] === -4) {
			angleZZ[tileIndex] = 356;
		}
		rotateZ = false;
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
	} else {
		if (currentlyPressedKeys[37]) {
			// Left cursor key
			if(tileIndex !== null) {
				tpx[tileIndex] -= 0.05;
			}
			/*
			console.log("angXB: "+angleX_board+", angXP: "+anglepXX[tileIndex]);
			console.log("angYB: "+angleY_board+", angYP: "+anglepYY[tileIndex]);
			console.log("angZB: "+angleZ_board+", angZP: "+anglepZZ[tileIndex]);
			console.log("tbx: "+tbx[0]+", tpx: "+tpx[tileIndex]);
			console.log("tby: "+tby[0]+", tpy: "+tpy[tileIndex]);
			console.log("tbz: "+tbz[0]+", tpz: "+tpz[tileIndex]);

			 */
		}
		if (currentlyPressedKeys[39]) {
			// Right cursor key
			if(tileIndex !== null) {
				tpx[tileIndex] += 0.05;
			}
			/*
			console.log("angXB: "+angleX_board+", angXP: "+anglepXX[tileIndex]);
			console.log("angYB: "+angleY_board+", angYP: "+anglepYY[tileIndex]);
			console.log("angZB: "+angleZ_board+", angZP: "+anglepZZ[tileIndex]);
			console.log("tbx: "+tbx[0]+", tpx: "+tpx[tileIndex]);
			console.log("tby: "+tby[0]+", tpy: "+tpy[tileIndex]);
			console.log("tbz: "+tbz[0]+", tpz: "+tpz[tileIndex]);

			 */
		}
		if (currentlyPressedKeys[38]) {
			// Up cursor key
			if(tileIndex !== null) {
				tpy[tileIndex] += 0.05;
			}
			/*
			console.log("angXB: "+angleX_board+", angXP: "+anglepXX[tileIndex]);
			console.log("angYB: "+angleY_board+", angYP: "+anglepYY[tileIndex]);
			console.log("angZB: "+angleZ_board+", angZP: "+anglepZZ[tileIndex]);
			console.log("tbx: "+tbx[0]+", tpx: "+tpx[tileIndex]);
			console.log("tby: "+tby[0]+", tpy: "+tpy[tileIndex]);
			console.log("tbz: "+tbz[0]+", tpz: "+tpz[tileIndex]);

			 */
		}

		if (currentlyPressedKeys[40]) {
			// Down cursor key
			if(tileIndex !== null) {
				tpy[tileIndex] -= 0.05;
			}
			/*
			console.log("angXB: "+angleX_board+", angXP: "+anglepXX[tileIndex]);
			console.log("angYB: "+angleY_board+", angYP: "+anglepYY[tileIndex]);
			console.log("angZB: "+angleZ_board+", angZP: "+anglepZZ[tileIndex]);
			console.log("tbx: "+tbx[0]+", tpx: "+tpx[tileIndex]);
			console.log("tby: "+tby[0]+", tpy: "+tpy[tileIndex]);
			console.log("tbz: "+tbz[0]+", tpz: "+tpz[tileIndex]);

			 */
		}
	}

	document.addEventListener("keypress", function(event){

		var bgColor = document.getElementById("bg-color");

		// Getting the pressed key and setting the bg color

		var key = event.keyCode; // ASCII

		switch(key){
			case 114:
				if(tileIndex !== null) {
					rotateZ = true;
				}
				/*
				console.log("angXB: "+angleX_board+", angXP: "+anglepXX[tileIndex]);
				console.log("angYB: "+angleY_board+", angYP: "+anglepYY[tileIndex]);
				console.log("angZB: "+angleZ_board+", angZP: "+anglepZZ[tileIndex]);
				console.log("tbx: "+tbx[0]+", tpx: "+tpx[tileIndex]);
				console.log("tby: "+tby[0]+", tpy: "+tpy[tileIndex]);
				console.log("tbz: "+tbz[0]+", tpz: "+tpz[tileIndex]);
				 */
				break;
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
	document.getElementById("deck_tile_number").innerHTML = deckTileNumber;
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
					document.getElementById("near_ortho").hidden = false;
					document.getElementById("far_ortho").hidden = false;
					document.getElementById("fovy_persp").hidden = true;
					document.getElementById("aspect_persp").hidden = true;
					document.getElementById("near_persp").hidden = true;
					document.getElementById("far_persp").hidden = true;
					break;
			case 1 : projectionType = 1;
					document.getElementById("near_ortho").hidden = true;
					document.getElementById("far_ortho").hidden = true;
					document.getElementById("fovy_persp").hidden = false;
					document.getElementById("aspect_persp").hidden = false;
					document.getElementById("near_persp").hidden = false;
					document.getElementById("far_persp").hidden = false;
					break;
		}
	});


	// Button events

	/*
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

	*/

	document.getElementById("tile1").onmousedown = function(){
		tileIndex = 0;
		selectPlayerTile();
		document.getElementById("tile1").style.backgroundColor ="#81F41B";
	};document.getElementById("tile1").onmouseup = function() {
		document.getElementById("tile1").style.backgroundColor = "#f4511e";
	};
	document.getElementById("tile2").onclick = function(){
		tileIndex = 1;
		selectPlayerTile();
	};

	document.getElementById("tile3").onclick = function(){
		tileIndex = 2;
		selectPlayerTile();
	};

	document.getElementById("tile4").onclick = function(){
		tileIndex = 3;
		selectPlayerTile();
	};

	document.getElementById("tile5").onclick = function(){
		tileIndex = 4;
		selectPlayerTile();
	};

	document.getElementById("tile6").onclick = function(){
		tileIndex = 5;
		selectPlayerTile();
	};

	if(tpx.length<7){
		document.getElementById("tile7").disabled = true;
	}

	document.getElementById("tile7").onclick = function(){
		tileIndex = 6;
		selectPlayerTile();
	};

	document.getElementById("tile8").onclick = function(){
		tileIndex = 7;
		selectPlayerTile();
	};

	document.getElementById("tile9").onclick = function(){
		tileIndex = 8;
		selectPlayerTile();
	};

	document.getElementById("tile10").onclick = function(){
		tileIndex = 9;
		selectPlayerTile();
	};

	document.getElementById("tile11").onclick = function(){
		tileIndex = 10;
		selectPlayerTile();
	};

	document.getElementById("tile12").onclick = function(){
		tileIndex = 11;
		selectPlayerTile();
	};

	document.getElementById("tile13").onclick = function(){
		tileIndex = 12;
		selectPlayerTile();
	};

	document.getElementById("tile14").onclick = function(){
		tileIndex = 13;
		selectPlayerTile();
	};

	document.getElementById("tile15").onclick = function(){
		tileIndex = 14;
		selectPlayerTile();
	};

	document.getElementById("tile16").onclick = function(){
		tileIndex = 15;
		selectPlayerTile();
	};

	document.getElementById("tile17").onclick = function(){
		tileIndex = 16;
		selectPlayerTile();
	};

	document.getElementById("tile18").onclick = function(){
		tileIndex = 17;
		selectPlayerTile();
	};

	document.getElementById("tile19").onclick = function(){
		tileIndex = 18;
		selectPlayerTile();
	};

	document.getElementById("tile20").onclick = function(){
		tileIndex = 19;
		selectPlayerTile();
	};

	document.getElementById("tile21").onclick = function(){
		tileIndex = 20;
		selectPlayerTile();
	};

	document.getElementById("getTile").onclick = function(){
		if(deckTileNumber !== 0) {
			let index = playerTextures.length;
			let random_tile = Math.floor(Math.random() * deckTextures.length);
			playerTextures[index] = deckTextures[random_tile];
			playerTiles[index] = deckTiles[random_tile];
			deckTextures.splice(random_tile, 1);
			deckTiles.splice(random_tile, 1);
			deckTileNumber = deckTextures.length;
			document.getElementById("deck_tile_number").innerHTML = deckTileNumber;


			if(deckTileNumber <= 2) {
				console.log(21-deckTileNumber-(18 + 1));
				tpx[tpx.length] = tpx[2 - deckTileNumber];
				tpy[tpy.length] = -9;
			} else {
				tpx[tpx.length] = tpx[tpx.length - 1] + dist_btw_tiles;
				tpy[tpy.length] = -7;
			}
			tpz[tpz.length] = 0;
			anglepXX[anglepXX.length] = 0;
			anglepYY[anglepYY.length] = 0;
			anglepZZ[anglepZZ.length] = 0;
			if(deckTileNumber === 0){
				document.getElementById("getTile").disabled = true;
				document.getElementById("getTile").style.display = "none";
			}
		}

	};

}

function selectPlayerTile() {
	if(!tilesSelected[tileIndex]) {
		anglepXX[tileIndex] = angleX_board;
		anglepYY[tileIndex] = angleY_board;
		anglepZZ[tileIndex] = angleZ_board;
		tpy[tileIndex] = -3;
		tpx[tileIndex] = 0;
		tpz[tileIndex] = tbz[0];
		let tile = playerTextures[tileIndex].image.src.split("imgs/")[1];
		if (!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("red_")) {
			bindImgToTexture(playerTextures, tileIndex, null);
			console.log("imgs/red_" + tile);
			playerTextures[tileIndex].image.src = "imgs/red_" + tile;
		}
	}
	tilesSelected[tileIndex] = true;
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


