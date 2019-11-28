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

// Buffers

var cubeVertexPositionBuffer = null;

var cubeVertexIndexBufferFrontFace = null;
var cubeVertexIndexBufferNotFrontFace = null;

var cubeVertexTextureCoordBufferFrontFace = null, cubeVertexTextureCoordBufferNotFrontFace = null;

// The global transformation parameters

// The translation vector
var player_tx = [-9.4];
var player_bottom_pos_x = [-9.4];
var player_bottom_pos_y = [-7];
var dist_between_tiles = 1.1; // 1.7
var totalDist = -9.4;
for(let i = 1; i < 18; i++) {
	player_bottom_pos_x[i] = player_bottom_pos_x[i-1] + dist_between_tiles;
	player_bottom_pos_y[i] = -7;
}
for(let i = 18; i < 21; i++){
	player_bottom_pos_x[i] = player_bottom_pos_x[i-18];
	player_bottom_pos_y[i] = -9;
}
for(let i = 1; i < 7; i++) {
	totalDist = totalDist+dist_between_tiles;
	player_tx[i] = player_tx[i-1] + dist_between_tiles;
}
var player_ty = [-7, -7, -7, -7, -7, -7, -7];
var player_tz = [0, 0, 0, 0, 0, 0, 0];
var player_tz_ortho = [0, 0, 0, 0, 0, 0, 0];
var player_tz_persp = [-25, -25, -25, -25, -25, -25, -25];
var pc_tx = [-9.4];
for(let i = 1; i < 6; i++) {
	pc_tx[i] = pc_tx[i-1] + dist_between_tiles;
}
var pc_ty = [8.8, 8.8, 8.8, 8.8, 8.8, 8.8];
var pc_tz = [-3, -3, -3, -3, -3, -3];
var pc_tz_ortho = [-40, -40, -40, -40, -40, -40];
var pc_tz_persp = [-40, -40, -40, -40, -40, -40];
var pcIndex = null;

var board_tx = [0];
var board_ty = [0];
var board_tz = [0];
var board_tz_ortho = [0];
var board_tz_persp = [-25];

var change_proj = false;

// The rotation angles in degrees

var angleXX = 0.0, angleYY = 0.0, angleZZ = 0.0;
var rotateZ = false;

var player_angX = [0, 0, 0, 0, 0, 0, 0];
var player_angYY = [0, 0, 0, 0, 0, 0, 0];
var player_angZZ = [0, 0, 0, 0, 0, 0, 0];

var tileIndex = null;

var selectedTile = null;

// Textures player
var playerTextures = [null,null,null,null,null,null,null];
var playerTiles = [];

// Textures computer
var pcTextures = [];

// Textures "deck"
var deckTextures = [];
var deckLength = 0;
var deckTiles = [];

// Textures board tiles
var boardTextures = [];
var angleX_board = [0]/*12*/, angleY_board = [0]/*339*/, angleZ_board = [90]/*266*/;

// The scaling factors
var sx = 0.10;
var sy = 0.10;
var sz = 0.10;

var ends = {};
var snapTileIndex;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;
 
// To allow choosing the projection type
var projectionType = 0;
var left_ortho = -1.0, right_ortho = 1.0, bottom_ortho = -1.0, top_ortho = 1.0, near_ortho = -1.0, far_ortho = 1.0;
var fovy_persp = 45;//45; // angle in degrees
var aspect_persp = 1;
var near_persp = 0.05, far_persp = 70;

// From learningwebgl.com

// Storing the vertices defining the cube faces

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

var count = 0, tiles = [];
for(let main_number = 0; main_number < 7; main_number++) {
	for (let sec_number = main_number; sec_number < 7; sec_number++) {
		tiles[count] = main_number + "_" + sec_number + ".png";
		count++;
	}
}

var checker = false;

// GLOBAL Animation controls

var globalRotationYY_ON = 1;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

var globalRotationXX_ON = 1;
var globalRotationXX_DIR = 1;
var globalRotationXX_SPEED = 1;

var globalRotationZZ_ON = 1;
var globalRotationZZ_DIR = 1;
var globalRotationZZ_SPEED = 1;

// The GLOBAL transformation parameters

var globalAngleYY = 0.0;
var globalAngleXX = 0.0;
var globalAngleZZ = 0.0;

var globalTx = 0;
var globalTy = 0;
var localTx = 0;
var localTy = 0;

var rotateDeckX = false;
var rotateDeckY = false;
var rotateDeckZ = false;

var playerOutcomeString = "";
var pc_can_play = true;
var player_can_play = true;

//console.log(tiles.slice(0, tiles.length));

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
	ends["6_6"] = ["e","d"];

	let i = 0;
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

	deckLength = deckTextures.length;

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

function drawDominoModel(angx, angy, angz,
						 sx, sy, sz,
						 tx, ty, tz,
						 mvMatrix,
						 primitiveType,
						 front_face_texture,
						 board) {
    // Pay attention to transformation order !!
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	if (board){

		if(rotateDeckX || rotateDeckY || rotateDeckZ) {
			if(projectionType === 1) {
				mvMatrix = mult(mvMatrix, translationMatrix(0, 0, tz));
			}
		}
		if(rotateDeckZ) {
			if(projectionType === 1) {
				mvMatrix = mult(mvMatrix, rotationZZMatrix(globalAngleZZ));
			} else {
				mvMatrix = mult(mvMatrix, translationMatrix(0, 0, tz));
				mvMatrix = mult(mvMatrix, rotationZZMatrix(globalAngleZZ));
			}
		}
		if(rotateDeckY) {
			if(projectionType === 1) {
				mvMatrix = mult(mvMatrix, rotationYYMatrix(globalAngleYY));
			} else {
				mvMatrix = mult(mvMatrix, translationMatrix(0, 0, tz));
				mvMatrix = mult(mvMatrix, rotationYYMatrix(globalAngleYY));
			}
		}
		if(rotateDeckX) {
			if(projectionType === 1) {
				mvMatrix = mult(mvMatrix, rotationXXMatrix(globalAngleXX));
			} else {
				mvMatrix = mult(mvMatrix, translationMatrix(0, 0, tz));
				mvMatrix = mult(mvMatrix, rotationXXMatrix(globalAngleXX));
			}
		}
	}

	if(projectionType === 0) {
		if(board){
			mvMatrix = mult(mvMatrix, translationMatrix(tx + globalTx, ty + globalTy, tz));
		} else {
			mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
		}
	} else {
		if(board){
			if(rotateDeckX || rotateDeckY || rotateDeckZ) {
				mvMatrix = mult(mvMatrix, translationMatrix(tx + globalTx, ty + globalTy, 0));
			} else {
				mvMatrix = mult(mvMatrix, translationMatrix(tx + globalTx, ty  + globalTy, tz));
			}
		} else {
			mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
		}

	}
	if(board) {
		mvMatrix = mult(mvMatrix, rotationZZMatrix(angz /*+ angleZZ*/));
		mvMatrix = mult(mvMatrix, rotationYYMatrix(angy /*+ angleYY*/));
		mvMatrix = mult(mvMatrix, rotationXXMatrix(angx /*+ angleXX*/));
	} else {
		mvMatrix = mult(mvMatrix, rotationZZMatrix(angz));
		mvMatrix = mult(mvMatrix, rotationYYMatrix(angy));
		mvMatrix = mult(mvMatrix, rotationXXMatrix(angx));
	}

	mvMatrix = mult(mvMatrix, scalingMatrix(sx, sy, sz));

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
	// Drawing the triangles
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
	// Drawing the triangles
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

	// handle sliders
	for (let id of ["tx", "ty", "near_ortho", "far_ortho", "fovy_persp", "aspect_persp", "near_persp", "far_persp"]) {
		let elemId = "myRange_" + id;
		let slider = document.getElementById(elemId);
		elemId = "demo_" + id;
		let output = document.getElementById(elemId);
		if (id === "near_ortho" || id === "far_ortho" || id === "near_persp" || id === "aspect_persp") {
			output.innerHTML = parseFloat(slider.value) / 10;
		} else {
			output.innerHTML = slider.value;
		}
		slider.oninput = function () {
			switch (id) {
				case "tx":
					localTx = parseFloat(this.value);
					globalTx =  parseFloat(this.value) *sx;
					break;
				case "ty":
					localTy = parseFloat(this.value);
					globalTy =  parseFloat(this.value) *sy;
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
					near_ortho = parseFloat(this.value) / 10;
					break;
				case "far_ortho":
					far_ortho = parseFloat(this.value) / 10;
					break;
				case "fovy_persp":
					fovy_persp = this.value;
					break;
				case "aspect_persp":
					aspect_persp = parseFloat(this.value) / 10;
					break;
				case "near_persp":
					near_persp = parseFloat(this.value) / 10;
					break;
				case "far_persp":
					far_persp = this.value;
					break;
			}
		};

	}

	// Computing the Projection Matrix
	if (projectionType === 0) {

		// the default orthogonal view volume

		pMatrix = ortho(left_ortho, right_ortho, bottom_ortho, top_ortho, near_ortho, far_ortho);

		if (change_proj) {
			for (let i = 0; i < player_tz.length; i++) {
				player_tz_persp[i] = player_tz[i];
			}
			for (let i = 0; i < pc_tz.length; i++) {
				pc_tz_persp[i] = pc_tz[i];
			}
			for (let i = 0; i < board_tz.length; i++) {
				board_tz_persp[i] = board_tz[i];
			}

			for (let i = 0; i < player_tz.length; i++) {
				player_tz[i] = player_tz_ortho[i];
			}
			for (let i = 0; i < pc_tz.length; i++) {
				pc_tz[i] = pc_tz_ortho[i];
			}
			for (let i = 0; i < board_tz.length; i++) {
				board_tz[i] = board_tz_ortho[i];
			}
		}

		change_proj = false;

	} else {

		// A standard view volume.

		// Viewer is at (0,0,0)

		pMatrix = perspective(fovy_persp, aspect_persp, near_persp, far_persp);

		if (!change_proj) {
			for (let i = 0; i < player_tz.length; i++) {
				player_tz_ortho[i] = player_tz[i];
			}
			for (let i = 0; i < pc_tz.length; i++) {
				pc_tz_ortho[i] = pc_tz[i];
			}
			for (let i = 0; i < board_tz.length; i++) {
				board_tz_ortho[i] = board_tz[i];
			}
			for (let i = 0; i < player_tz.length; i++) {
				player_tz[i] = player_tz_persp[i];
			}

			for (let i = 0; i < pc_tz.length; i++) {
				pc_tz[i] = pc_tz_persp[i];
			}

			for (let i = 0; i < board_tz.length; i++) {
				board_tz[i] = board_tz_persp[i];
			}
		}

		change_proj = true;
	}

	// Passing the Projection Matrix to apply the current projection
	let pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Instantianting the same model more than once !!

	// And with diferent transformation parameters !!

	// Call the drawDominoModel function

	// Player pieces
	// Disable and hide all tile buttons
	for(let i = player_tx.length + 1; i < 22; i++){
		document.getElementById("tile" + i).disabled = true;
		document.getElementById("tile" + i).style.display = "none";
	}

	// Draw all the player tiles and Enable and Display all the player tile buttons
	let id = 0;
	for (let i = 0; i < player_tx.length; i++) {
		drawDominoModel(player_angX[i], player_angYY[i], player_angZZ[i],
			sx, sy, sz,
			player_tx[i] * sx, player_ty[i] * sy, player_tz[i] * sz,
			mvMatrix,
			primitiveType,
			playerTextures[i],
			false
		);
		id = i + 1;
		if(!document.getElementById("lose").innerHTML.includes("You")) {
			document.getElementById("tile" + id).innerHTML = playerTextures[i].image.src.split(
				"imgs/")[1].split(
				".")[0].replace(
				"green_", "").replace(
				"red_", "").replace(
				"blue_", "");
			document.getElementById("tile" + id).style.display = "";
			document.getElementById("tile" + id).disabled = false;
		}
	}

	// Board pieces
	for (let i = 0; i < boardTextures.length; i++) {
		drawDominoModel(angleX_board[i], angleY_board[i], angleZ_board[i],
			sx, sy, sz,
			board_tx[i]*sx, board_ty[i]*sy, board_tz[i]*sz,
			mvMatrix,
			primitiveType,
			boardTextures[i],
			true
		);
	}

	// Computer pieces
	let pc_tile_ang = 180;
	// when the game ends, pc tiles became visible
	if(document.getElementById("lose").innerHTML.includes("You")) {
		pc_tile_ang = 0;
	}
	for(let i = 0; i < pcTextures.length; i++){
		drawDominoModel( 0, pc_tile_ang, 0,
			sx, sy, sz,
			pc_tx[i]*sx, pc_ty[i]*sy, pc_tz[i]*sz,
			mvMatrix,
			primitiveType,
			pcTextures[i],
			false
		);
	}

	// handle R keypress
	if (rotateZ && tileIndex !== null) {
		if (player_angZZ[tileIndex] === 0) {
			player_angZZ[tileIndex] = 270;

		} else {
			player_angZZ[tileIndex] -= 90;
		}
		rotateZ = false;
		//console.log(player_angZZ[tileIndex]);
	}

	checker = false;
	// parallel to board piece
	let angZBoardAux;
	if (tileIndex !== null) {
		for (var i in ends) {
			for (let j = 0; j < boardTextures.length; j++) {
				if (boardTextures[j].image.src.includes(i)) {
					// parallel to board piece
					tile = playerTextures[tileIndex].image.src.split("imgs/")[1];
					tile = tile.replace("red_", "");
					tile = tile.replace("green_", "");
					facesPlayer = tile.replace(".png", "").split("_");
					if (angleZ_board[j] + 180 >= 360) {
						angZBoardAux = angleZ_board[j] + 180 - 360;
					} else {
						angZBoardAux = angleZ_board[j] + 180;
					}
					if (facesPlayer[0] !== facesPlayer[1]) {
						//console.log(board_tx[j] + globalTx);
						if (player_angZZ[tileIndex] === angleZ_board[j] || player_angZZ[tileIndex] === angZBoardAux) {
							// left of the board piec
							if (ends[i].includes("e")) {
								if (player_tx[tileIndex] - (board_tx[j] + localTx) > -2.5 /*-3*/ && player_tx[tileIndex] - (board_tx[j] + localTx) < -1.8/*3*/) {
									if (player_ty[tileIndex] - (board_ty[j] + localTy) > -0.4 && player_ty[tileIndex] - (board_ty[j] + localTy) < 0.4) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							// right of the board piece
							if (ends[i].includes("d")) {
								if (player_tx[tileIndex] - (board_tx[j] + localTx) < 2.5 /*-3*/ && player_tx[tileIndex] - (board_tx[j] + localTx) > 1.8/*3*/) {
									if (player_ty[tileIndex] - (board_ty[j] + localTy) > -0.4 && player_ty[tileIndex] - (board_ty[j] + localTy) < 0.4) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							//down of the board piece
							if (ends[i].includes("b")) {
								if (player_tx[tileIndex] - (board_tx[j] + localTx) > -0.4 /*-3*/ && player_tx[tileIndex] - (board_tx[j] + localTx) < 0.4/*3*/) {
									if (player_ty[tileIndex] - (board_ty[j] + localTy) > -2.5 && player_ty[tileIndex] - (board_ty[j] + localTy) < -1.8) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							// up of the board piece
							if (ends[i].includes("c")) {
								if (player_tx[tileIndex] - (board_tx[j] + localTx) > -0.4 /*-3*/ && player_tx[tileIndex] - (board_tx[j] + localTx) < 0.4/*3*/) {
									if (player_ty[tileIndex] - (board_ty[j] + localTy) < 2.5 && player_ty[tileIndex] - (board_ty[j] + localTy) > 1.8) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}

						}
					}
					// prependicular to board piece
					if (player_angZZ[tileIndex] !== angleZ_board[j] && player_angZZ[tileIndex] !== angZBoardAux) {
						// left of the board piece
						if (ends[i].includes("e")) {
							if (player_tx[tileIndex] - (board_tx[j] + localTx) > -1.9 && player_tx[tileIndex] - (board_tx[j] + localTx) < -1.4) {
								if (player_ty[tileIndex] - (board_ty[j] + localTy) > -0.6 && player_ty[tileIndex] - (board_ty[j] + localTy) < 0.6) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// right of the board piece
						if (ends[i].includes("d")) {
							if (player_tx[tileIndex] - (board_tx[j] + localTx) < 1.9 && player_tx[tileIndex] - (board_tx[j] + localTx) > 1.4) {
								if (player_ty[tileIndex] - (board_ty[j] + localTy) > -0.6 && player_ty[tileIndex] - (board_ty[j] + localTy) < 0.6) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// down of the board piece
						if (ends[i].includes("b")) {
							if (player_tx[tileIndex] - (board_tx[j] + localTx) > -0.6 && player_tx[tileIndex] - (board_tx[j] + localTx) < 0.6) {
								if (player_ty[tileIndex] - (board_ty[j] + localTy) > -1.9 && player_ty[tileIndex] - (board_ty[j] + localTy) < -1.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// up of the board piece
						if (ends[i].includes("c")) {
							if (player_tx[tileIndex] - (board_tx[j] + localTx) > -0.6 && player_tx[tileIndex] - (board_tx[j] + localTx) < 0.6) {
								if (player_ty[tileIndex] - (board_ty[j] + localTy) < 1.9 && player_ty[tileIndex] - (board_ty[j] + localTy) > 1.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}

					}
				}
			}
		}

		if (!playerTextures[tileIndex].image.src.includes("imgs/red")) {
			if (checker === false) {
				tile = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
				playerTextures[tileIndex].image.src = "imgs/red_" + tile;
				document.getElementById("snapTile").disabled = true;
				document.getElementById("snapTile").style.display = "none";

			}
		}

	} else {
		if (document.getElementById("snapTile").disabled === false) {
			document.getElementById("snapTile").disabled = true;
			document.getElementById("snapTile").style.display = "none";
		}
	}

	if(deckLength === 0) {
		var cant_play = true;
		for (let i = 0; i < player_tx.length; i++) {
			let player_ends = playerTextures[i].image.src.split(
				"imgs/")[1].split(
				".")[0].replace(
				"green_", "").replace(
				"red_", "").replace(
				"blue_", "").split("_");
			for (let key in ends) {
				for (let j = 0; j < boardTextures.length; j++) {
					if (boardTextures[j].image.src.includes(key)) {
						let end_num = key.split("_");
						if (angleZ_board[j] === 0) {
							if (ends[key][0].includes("c")) {
								if (end_num[0] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[0] === player_ends[1]) {
									cant_play = false;
									break;
								}
							} else if (ends[key][0].includes("b")) {
								if (end_num[1] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[1] === player_ends[1]) {
									cant_play = false;
									break;
								}
							}
						} else if (angleZ_board[j] === 90) {
							if (ends[key][0].includes("e")) {
								if (end_num[0] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[0] === player_ends[1]) {
									cant_play = false;
									break;
								}
							} else if (ends[key][0].includes("d")) {
								if (end_num[1] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[1] === player_ends[1]) {
									cant_play = false;
									break;
								}
							}
						}
						if (angleZ_board[j] === 180) {
							if (ends[key][0].includes("c")) {
								if (end_num[1] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[1] === player_ends[1]) {
									cant_play = false;
									break;
								}
							} else if (ends[key][0].includes("b")) {
								if (end_num[0] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[0] === player_ends[1]) {
									cant_play = false;
									break;
								}
							}
						} else if (angleZ_board[j] === 270) {
							if (ends[key][0].includes("e")) {
								if (end_num[1] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[1] === player_ends[1]) {
									cant_play = false;
									break;
								}
							} else if (ends[key][0].includes("d")) {
								if (end_num[0] === player_ends[0]) {
									cant_play = false;
									break;
								} else if (end_num[0] === player_ends[1]) {
									cant_play = false;
									break;
								}
							}
						}
					}
				}
				if(!cant_play){
					break;
				}
			}
			if(!cant_play){
				break;
			}
		}
		if (cant_play) {
			player_can_play = false;
			pc_move();
		}
	}
}

function collisionDetection(tx, ty, ang){
	for(let i = 0; i < board_tx.length; i++){
		if(i !== snapTileIndex) {
			if (angleZ_board[i] === 0 || angleZ_board[i] === 180) {
				if (ang === 0 || ang === 180) {
					if ((((board_tx[snapTileIndex] + tx - 0.5) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx - 0.5) < (board_tx[i] + 0.6)) ||
						((board_tx[snapTileIndex] + tx + 0.5) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx + 0.5) < (board_tx[i] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty - 1) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty - 1) < (board_ty[i] + 1.1)) ||
							((board_ty[snapTileIndex] + ty + 1) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty + 1) < (board_ty[i] + 1.1)))) {
						//console.log(i);
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 0.6)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 1.1)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 1.1)))) {
						//console.log(i);
						return true;
					}
				} else {
					if ((((board_tx[snapTileIndex] + tx - 1) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx - 1) < (board_tx[i] + 0.6)) ||
						((board_tx[snapTileIndex] + tx + 1) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx + 1) < (board_tx[i] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty - 0.5) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty - 0.5) < (board_ty[i] + 1.1)) ||
							((board_ty[snapTileIndex] + ty + 0.5) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty + 0.5) < (board_ty[i] + 1.1)))) {
						//console.log(i);
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 0.6)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[i] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 1.1)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[i] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 1.1)))) {
						console.log(i);
						return true;
					}
				}
			} else {
				if (ang === 0 || ang === 180) {
					if ((((board_tx[snapTileIndex] + tx - 0.5) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx - 0.5) < (board_tx[i] + 1.1)) ||
						((board_tx[snapTileIndex] + tx + 0.5) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx + 0.5) < (board_tx[i] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty - 1) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty - 1) < (board_ty[i] + 0.6)) ||
							((board_ty[snapTileIndex] + ty + 1) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty + 1) < (board_ty[i] + 0.6)))) {
						//console.log(i);
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 1.1)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 0.6)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 0.6)))) {
						//console.log(i);
						return true;
					}
				} else {
					if ((((board_tx[snapTileIndex] + tx - 1) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx - 1) < (board_tx[i] + 1.1)) ||
						((board_tx[snapTileIndex] + tx + 1) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx + 1) < (board_tx[i] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty - 0.5) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty - 0.5) < (board_ty[i] + 0.6)) ||
							((board_ty[snapTileIndex] + ty + 0.5) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty + 0.5) < (board_ty[i] + 0.6)))) {
						//console.log(i);
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 1.1)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[i] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[i] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 0.6)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[i] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[i] + 0.6)))) {
						//console.log(i);
						return true;
					}
				}
			}
		}
	}
	return false;
}

function colorGreen(){
	checker = true;
	if(!playerTextures[tileIndex].image.src.includes("imgs/green")) {
		let tile = playerTextures[tileIndex].image.src.split("imgs/red_")[1];
		playerTextures[tileIndex].image.src = "imgs/green_" + tile;
		document.getElementById("snapTile").disabled = false;
		document.getElementById("snapTile").style.display = "";
	}
}

//----------------------------------------------------------------------------
//
//  Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime !== 0 ) {
		
		var elapsed = timeNow - lastTime;

		// Global rotation

		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
		}
		if( globalRotationXX_ON ) {

			globalAngleXX += globalRotationXX_DIR * globalRotationXX_SPEED * (90 * elapsed) / 1000.0;
		}
		if( globalRotationZZ_ON ) {

			globalAngleZZ += globalRotationZZ_DIR * globalRotationZZ_SPEED * (90 * elapsed) / 1000.0;
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

	if (currentlyPressedKeys[33] && !document.getElementById("lose").innerHTML.includes("You")) {
		valuePageUpOrDown = 0.99;  // Page Up
	} else if (currentlyPressedKeys[34] && !document.getElementById("lose").innerHTML.includes("You")) {
		valuePageUpOrDown = 1.01;  // Page Down
	}

	if (currentlyPressedKeys[33] || currentlyPressedKeys[34]) {
		sx *= valuePageUpOrDown;
		sz = sy = sx;
		pc_sx *= valuePageUpOrDown;
		pc_sz = pc_sy = pc_sx;
	} else {
		if (currentlyPressedKeys[37]) {
			// Left cursor key
			if(tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_tx[tileIndex] -= 0.05;
			}
		}
		if (currentlyPressedKeys[39]) {
			// Right cursor key
			if(tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_tx[tileIndex] += 0.05;
			}
		}
		if (currentlyPressedKeys[38]) {
			// Up cursor key
			if(tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_ty[tileIndex] += 0.05;
			}
		}

		if (currentlyPressedKeys[40]) {
			// Down cursor key
			if(tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_ty[tileIndex] -= 0.05;
			}
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
	drawScene();
	if(!document.getElementById("lose").innerHTML.includes("You")) {
	    handleKeys();
	    handlePlayerButtons();
	    handleSliders();
        animate();
    }
}

//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
    document.getElementById("deck_tile_number").innerHTML = deckLength;
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ) {

	// Handling the mouse

	// From learningwebgl.com

	document.getElementById("lose").innerHTML = "";

	canvas.onmousedown = handleMouseDown;

	document.onmouseup = handleMouseUp;

	document.onmousemove = handleMouseMove;

	// Handling the keyboard

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

	projection.addEventListener("click", function () {
		// Getting the selection
		var p = projection.selectedIndex;

		switch (p) {
			case 0 :
				projectionType = 0;
				document.getElementById("near_ortho").hidden = false;
				document.getElementById("far_ortho").hidden = false;
				document.getElementById("fovy_persp").hidden = true;
				document.getElementById("aspect_persp").hidden = true;
				document.getElementById("near_persp").hidden = true;
				document.getElementById("far_persp").hidden = true;
				break;
			case 1 :
				projectionType = 1;
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
	document.getElementById("resetPosition").onclick = function () {
		resetDeckPos();
	};

	document.getElementById("rotateDeckX").onclick = function () {
		rotateDeckX = !rotateDeckX;
		if(rotateDeckX){
			document.getElementById("rotateDeckX").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateDeckX").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("rotateDeckY").onclick = function () {
		rotateDeckY = !rotateDeckY;
		if(rotateDeckY){
			document.getElementById("rotateDeckY").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateDeckY").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("rotateDeckZ").onclick = function () {
		rotateDeckZ = !rotateDeckZ;
		if(rotateDeckZ){
			document.getElementById("rotateDeckZ").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateDeckZ").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("getTile").onclick = function () {
		if(!document.getElementById("lose").innerHTML.includes("You")) {
			if (deckLength !== 0) {
				let index = playerTextures.length;
				let random_tile = Math.floor(Math.random() * deckTextures.length);
				playerTextures[index] = deckTextures[random_tile];
				playerTiles[index] = deckTiles[random_tile];

				deckTextures.splice(random_tile, 1);
				deckTiles.splice(random_tile, 1);

				deckLength = deckTextures.length;
				document.getElementById("deck_tile_number").innerHTML = deckLength;

				//player_tx[player_tx.length] = player_bottom_pos_x[playerTiles.length - 1];
				totalDist += dist_between_tiles;
				player_tx[player_tx.length] = totalDist;
				player_ty[player_ty.length] = player_bottom_pos_y[playerTiles.length - 1];
				if (projectionType === 0) {

					player_tz[player_tz.length] = 0;
				} else {

					player_tz[player_tz.length] = -25;
				}

				player_tz_ortho[player_tz_ortho.length] = 0;
				player_tz_persp[player_tz_persp.length] = -25;
				//console.log("otho: " + player_tz_ortho.length + "persp: " + player_tz_persp.length);

				player_angX[player_angX.length] = 0;
				player_angYY[player_angYY.length] = 0;
				player_angZZ[player_angZZ.length] = 0;
				if (deckLength === 0) {
					document.getElementById("getTile").disabled = true;
					document.getElementById("getTile").style.display = "none";
				}
			}
			pc_move();
		}
	};

	document.getElementById("snapTile").onclick = function () {
		tile = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
		facesPlayer = tile.replace(".png", "").split("_");
		tileBoard = boardTextures[snapTileIndex].image.src.split("imgs/")[1].replace("grey_","");
		facesBoard = tileBoard.replace(".png", "").split("_");
		//Paralelo
		if (player_angZZ[tileIndex] === 0 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-(board_ty[snapTileIndex]+localTy)<0) {
				if (facesPlayer[0] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"], 1, 0);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 90 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (facesPlayer[1] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"], 1, 0);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 180 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (facesPlayer[1] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"],1, 0);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 270 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (facesPlayer[0] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"],1, 0);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (facesPlayer[0] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"],1, 0);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (facesPlayer[1] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"],1, 0);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (facesPlayer[1] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"],1, 0);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"],1, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (facesPlayer[0] === facesBoard[0]) {
					tile_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"],1, 0);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[1]) {
					tile_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"],1, 0);
				}
			}
		}
		//PERPENDICULAR +90
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["b","c"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["b","c"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"],1, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["d","e"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["d","e"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"],1, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["c","b"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["c","b"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"],1, 0);
					}
				}
			}
		}

		//MUDEI AQUI
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["e","d"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["e","d"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"],1, 0);
					}
				}
			}
		}
		//PERPENDICULAR +180
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["b","c"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["b","c"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"],1, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["d","e"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["d","e"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"],1, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["c","b"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["c","b"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"],1, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						tile_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["e","d"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"],1, 0);
					} else if (facesPlayer[1] === facesBoard[0]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"],1, 0);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						tile_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["e","d"],1, 0);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"],1, 0);
					} else if (facesPlayer[1] === facesBoard[1]) {
						tile_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"],1, 0);
					}
				}
			}
		}
	}
}

function tile_to_board(facesPlayer, facesBoard, tx, ty, rem, add, type, pc_ang){
	// player
	if (type === 1) {
		if (!collisionDetection(tx, ty, player_angZZ[tileIndex])) {
			changeTileToBoard(1, facesPlayer, facesBoard, tx, ty, rem, add, type, pc_ang);
			for (let j = 1; j < playerTextures.length + 1; j++) {
				let id = "tile" + j;
				document.getElementById(id).style.backgroundColor = "#87877f";
			}
			if (player_tx.length === 0) {
				player_can_play = false;
			}
			pc_move();
		}
	}
	// pc
	else if (type === 0) {
		if (!collisionDetection(tx, ty, pc_ang)) {
			changeTileToBoard(0, facesPlayer, facesBoard, tx, ty, rem, add, type, pc_ang);
			if (pc_tx.length === 0) {
				pc_can_play = false;
			}
		} else {
			// get tile pc
			if (deckLength !== 0) {
				let index = pcTextures.length;
				let random_tile = Math.floor(Math.random() * deckTextures.length);
				pcTextures[index] = deckTextures[random_tile];
				//playerTiles[index] = deckTiles[random_tile];

				deckTextures.splice(random_tile, 1);
				deckTiles.splice(random_tile, 1);

				deckLength = deckTextures.length;
				document.getElementById("deck_tile_number").innerHTML = deckLength;

				pc_tx[pc_tx.length] = pc_tx[pc_tx.length - 1] + dist_between_tiles;
				pc_ty[pc_ty.length] = pc_ty[pc_ty.length - 1];
				if (projectionType === 0) {
					pc_tz[pc_tz.length] = 0;
				} else {
					pc_tz[pc_tz.length] = -40;
				}

				pc_tz_ortho[pc_tz_ortho.length] = 0;
				pc_tz_persp[pc_tz_persp.length] = -40;

				if (deckLength === 0) {
					document.getElementById("getTile").disabled = true;
					document.getElementById("getTile").style.display = "none";
				}
			} else {
				pc_can_play = false;
			}
		}
	}
}

function pc_move(){
	if(pc_can_play){
		var pc_play = false;
		for (let pc_tile_ind = 0; pc_tile_ind < pcTextures.length; pc_tile_ind++) {
			let pc_tile_numbers = pcTextures[pc_tile_ind].image.src.split(
				"imgs/")[1].split(
				".")[0].replace(
				"green_", "").replace(
				"red_", "").replace(
				"blue_", "").split("_");
			pcIndex = pc_tile_ind;
			for (let end_tile_name in ends) {
				for (let boardIndex = 0; boardIndex < boardTextures.length; boardIndex++) {
					if (boardTextures[boardIndex].image.src.includes(end_tile_name)) {
						snapTileIndex = boardIndex;
						let end_tile_numbers = end_tile_name.split("_");
						if (angleZ_board[boardIndex] === 0) {
							if (ends[end_tile_name][0] === "c") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 1.5, "c", ["e", "d"], 0, 90);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 2, "c", "c", 0, 180);
										pc_play = true;
										break;
									} else if (end_tile_numbers[0] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 2, "c", "c", 0, 0);
										pc_play = true;
										break;
									}
								}
							} else if (ends[end_tile_name][0] === "b") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -1.5, "b", ["e", "d"], 0, 90);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -2, "b", "b", 0, 0);
										pc_play = true;
										break;
									} else if (end_tile_numbers[1] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -2, "b", "b", 0, 180);
										pc_play = true;
										break;
									}
								}
							}
						} else if (angleZ_board[boardIndex] === 90) {
							if (ends[end_tile_name][0] === "e") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -1.5, 0, "e", ["c", "b"], 0, 0);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -2, 0, "e", "e", 0, 270);
										pc_play = true;
										break;
									} else if (end_tile_numbers[0] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -2, 0, "e", "e", 0, 90);
										pc_play = true;
										break;
									}
								}
							} else if (ends[end_tile_name][0] === "d") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 1.5, 0, "d", ["c", "b"], 0, 0);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 2, 0, "d", "d", 0, 90);
										pc_play = true;
										break;
									} else if (end_tile_numbers[1] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 2, 0, "d", "d", 0, 270);
										pc_play = true;
										break;
									}
								}
							}
						} else if (angleZ_board[boardIndex] === 180) {
							if (ends[end_tile_name][0] === "c") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 1.5, "c", ["e", "d"], 0, 90);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 2, "c", "c", 0, 180);
										pc_play = true;
										break;
									} else if (end_tile_numbers[1] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, 2, "c", "c", 0, 0);
										pc_play = true;
										break;
									}
								}
							} else if (ends[end_tile_name][0] === "b") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -1.5, "b", ["e", "d"], 0, 90);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -2, "b", "b", 0, 0);
										pc_play = true;
										break;
									} else if (end_tile_numbers[0] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 0, -2, "b", "b", 0, 180);
										pc_play = true;
										break;
									}
								}
							}
						} else if (angleZ_board[boardIndex] === 270) {
							if (ends[end_tile_name][0] === "e") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -1.5, 0, "e", ["c", "b"], 0, 0);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[1] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -2, 0, "e", "e", 0, 270);
										pc_play = true;
										break;
									} else if (end_tile_numbers[1] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, -2, 0, "e", "e", 0, 90);
										pc_play = true;
										break;
									}
								}
							} else if (ends[end_tile_name][0] === "d") {
								if (pc_tile_numbers[0] === pc_tile_numbers[1]) {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 1.5, 0, "d", ["c", "b"], 0, 0);
										pc_play = true;
										break;
									}
								} else {
									if (end_tile_numbers[0] === pc_tile_numbers[0]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 2, 0, "d", "d", 0, 90);
										pc_play = true;
										break;
									} else if (end_tile_numbers[0] === pc_tile_numbers[1]) {
										tile_to_board(pc_tile_numbers, end_tile_numbers, 2, 0, "d", "d", 0, 270);
										pc_play = true;
										break;
									}
								}
							}
						}
					}
				}
				if (pc_play) {
					break;
				}
			}
			if (pc_play) {
				break;
			}
		}

		if (!pc_play) {
			if (deckLength !== 0) {
				let index = pcTextures.length;
				let random_tile = Math.floor(Math.random() * deckTextures.length);
				pcTextures[index] = deckTextures[random_tile];

				deckTextures.splice(random_tile, 1);
				deckTiles.splice(random_tile, 1);

				deckLength = deckTextures.length;
				document.getElementById("deck_tile_number").innerHTML = deckLength;

				pc_tx[pc_tx.length] = pc_tx[pc_tx.length - 1] + dist_between_tiles;
				pc_ty[pc_ty.length] = pc_ty[pc_ty.length - 1];
				if (projectionType === 0) {
					pc_tz[pc_tz.length] = 0;
				} else {
					pc_tz[pc_tz.length] = -40;
				}

				pc_tz_ortho[pc_tz_ortho.length] = 0;
				pc_tz_persp[pc_tz_persp.length] = -40;

				if (deckLength === 0) {
					document.getElementById("getTile").disabled = true;
					document.getElementById("getTile").style.display = "none";
				}
			} else {
				pc_can_play = false;
			}
		}
	}
	if(!pc_can_play && !player_can_play){
		pontuation();
		document.getElementById("lose").innerHTML = "You " + playerOutcomeString;
	}
}

function addToTz(list, index, value){
    let lst_ortho = [], lst_persp = [];
    switch (list) {
        case player_tz:
            lst_ortho = player_tz_ortho;
            lst_persp = player_tz_persp;
            break;
        case board_tz:
            lst_ortho = board_tz_ortho;
            lst_persp = board_tz_persp;
            break;
        case pc_tz:
            lst_ortho = pc_tz_ortho;
            lst_persp = pc_tz_persp;
            break;
    }
	if(projectionType === 1){
        lst_persp[index] = value;
	} else {
        lst_ortho[index] = value;
	}
}

function changeTileToBoard(type, facesPlayer, facesBoard, tx, ty, rem, add, type, pc_ang) {
	let dicBoardKey, dicPlayerKey, listOfTextures, angx, angy, angz, textureList, index, pos_tx, pos_ty, pos_tz;
	if(type === 1 || type === 0){
		if (type === 1){
			listOfTextures = [playerTextures[tileIndex].image.src.split("imgs/green_")[1]];
			angz = player_angZZ[tileIndex];
			angx = player_angX[tileIndex];
			angy = player_angYY[tileIndex];
			textureList = playerTextures;
			index = tileIndex;
			pos_tx = player_tx;
			pos_ty = player_ty;
			pos_tz = player_tz;
		} else if(type === 0){
			listOfTextures = ["grey_" + pcTextures[pcIndex].image.src.split("imgs/")[1]];
			angz = pc_ang;
			angx = 0;
			angy = 0;
			textureList = pcTextures;
			index = pcIndex;
			pos_tx = pc_tx;
			pos_ty = pc_ty;
			pos_tz = pc_tz;

		}

		dicBoardKey = facesBoard[0] + "_" + facesBoard[1];
		dicPlayerKey = facesPlayer[0] + "_" + facesPlayer[1];
		addTextureToList(boardTextures, boardTextures.length, listOfTextures);
		board_tx[board_tx.length] = board_tx[snapTileIndex] + tx;
		board_ty[board_ty.length] = board_ty[snapTileIndex] + ty;
		board_tz[board_tz.length] = board_tz[snapTileIndex];
		angleZ_board[angleZ_board.length] = angz;
		angleX_board[angleX_board.length] = angx;
		angleY_board[angleY_board.length] = angy;
		textureList.splice(index, 1);
		pos_tx.splice(index, 1);
		pos_ty.splice(index, 1);
		pos_tz.splice(index, 1);
		deletefromTz(pos_tz);
		addToTz(board_tz, board_tz.length, board_tz[0]);

		if(type === 1){
			player_angX.splice(tileIndex,1);
			player_angYY.splice(tileIndex,1);
			player_angZZ.splice(tileIndex,1);
			selectedTile = null;
			tileIndex = null;
		}

		if (ends[dicBoardKey].length === 1) {
			delete ends[dicBoardKey];
		} else {
			for (let k = 0; k < ends[dicBoardKey].length; k++) {
				if (ends[dicBoardKey][k] === rem) {
					ends[dicBoardKey].splice(k, 1);
				}
			}
		}

		ends[dicPlayerKey] = add;
		board_tz_ortho[board_tz_ortho.length] = board_tz_ortho[0];
		board_tz_persp[board_tz_persp.length] = board_tz_persp[0];

	}
}

function deletefromTz(list){
    let lst_ortho = [], lst_persp = [];
    switch (list) {
        case player_tz:
            lst_ortho = player_tz_ortho;
            lst_persp = player_tz_persp;
            break;
        case board_tz:
            lst_ortho = board_tz_ortho;
            lst_persp = board_tz_persp;
            break;
        case pc_tz:
            lst_ortho = pc_tz_ortho;
            lst_persp = pc_tz_persp;
            break;
    }
    if(projectionType === 1){
        lst_persp.splice(tileIndex,1);
    } else {
        lst_ortho.splice(tileIndex,1);
    }
}

function pontuation(){
	let pcPoints = points(playerTextures);
	let playerPoints = points(pcTextures);
	document.getElementById("player_points").innerHTML = String(playerPoints);
	document.getElementById("pc_points").innerHTML = String(pcPoints);
	if(playerPoints === pcPoints){
		playerOutcomeString = "draw";
	} else if(playerPoints > pcPoints){
		playerOutcomeString = "win!!";
	} else {
		playerOutcomeString = "lose";
	}
}

function points(list) {
	let points = 0;
	for(let tile of list){
		let tile_name =tile.image.src.split(
			"imgs/")[1].split(
			".")[0].replace(
			"green_", "").replace(
			"red_", "").replace(
			"blue_", "").replace(
			"grey_", "");
		points += parseInt(tile_name.split("_")[0]);
		points += parseInt(tile_name.split("_")[1]);
	}
	return points;
}

// add points to each player after a play (every dot on every end of the board tiles is consider)
function other_method_pontuation(type, rem, add, pc_ang, dicBoardKey){
	// player
	let points = 0;
	if(type === 1) {

		// points of new tile
		let player_tile_name = playerTextures[tileIndex].image.src.split(
			"imgs/")[1].split(
			".")[0].replace(
			"green_", "").replace(
			"red_", "").replace(
			"blue_", "").replace(
			"grey_", "");
		for(let side of add){
			if(player_angZZ[tileIndex] === 0){
				if(side === "c"){
					points += parseInt(player_tile_name.split("_")[0]);
				} else if(side === "b"){
					points += parseInt(player_tile_name.split("_")[1]);
				}
			} else if(player_angZZ[tileIndex] === 270){
				if(side === "e"){
					points += parseInt(player_tile_name.split("_")[1]);
				} else if(side === "d"){
					points += parseInt(player_tile_name.split("_")[0]);
				}
			} else if(player_angZZ[tileIndex] === 90){
				if(side === "e"){
					points += parseInt(player_tile_name.split("_")[0]);
				} else if(side === "d"){
					points += parseInt(player_tile_name.split("_")[1]);
				}
			} else {
				if(side === "c"){
					points += parseInt(player_tile_name.split("_")[1]);
				} else if(side === "b"){
					points += parseInt(player_tile_name.split("_")[0]);
				}
			}
		}
		let num_of_ends = 0;
		// points of other tiles
		for (let end_tile_name in ends) {
			// points to consider
			for (let k = 0; k < ends[end_tile_name].length; k++) {
				for (let board_ind = 0; board_ind < boardTextures.length; board_ind++) {
					let board_tile_name = boardTextures[num_of_ends].image.src.split(
						"imgs/")[1].split(
						".")[0].replace(
						"green_", "").replace(
						"red_", "").replace(
						"blue_", "").replace(
						"grey_", "");
					if (angleZ_board[board_ind] === 0) {
						if(ends[end_tile_name][k] ==="c"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
						if(ends[end_tile_name][k] === "b"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
					} else if(player_angZZ[tileIndex] === 270){
						if(ends[end_tile_name][k] === "e"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
						if(ends[end_tile_name][k] === "d"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
					} else if(player_angZZ[tileIndex] === 90){
						if(ends[end_tile_name][k] === "e"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
						if(ends[end_tile_name][k] === "d"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
					}
					// 180
					else {
						if(ends[end_tile_name][k] === "c"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
						if(ends[end_tile_name][k] === "b"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
					}
				}
			}
			num_of_ends += 1;
		}
	}
	// pc
	else {
		let pc_tile_name = pcTextures[pcIndex].image.src.split(
			"imgs/")[1].split(
			".")[0].replace(
			"green_", "").replace(
			"red_", "").replace(
			"blue_", "").replace(
			"grey_", "");
		for(let side of add){
			if(pc_ang === 0){
				if(side === "c"){
					points += parseInt(pc_tile_name.split("_")[0]);
				} else if(side === "b"){
					points += parseInt(pc_tile_name.split("_")[1]);
				}
			} else if(pc_ang === 270){
				if(side === "e"){
					points += parseInt(pc_tile_name.split("_")[1]);
				} else if(side === "d"){
					points += parseInt(pc_tile_name.split("_")[0]);
				}
			} else if(pc_ang === 90){
				if(side === "e"){
					points += parseInt(pc_tile_name.split("_")[0]);
				} else if(side === "d"){
					points += parseInt(pc_tile_name.split("_")[1]);
				}
			} else {
				if(side === "c"){
					points += parseInt(pc_tile_name.split("_")[1]);
				} else if(side === "b"){
					points += parseInt(pc_tile_name.split("_")[0]);
				}
			}
		}

		for (let end_tile_name in ends) {
			// points to consider
			for (let k = 0; k < ends[end_tile_name].length; k++) {
				for (let board_ind = 0; board_ind < boardTextures.length; board_ind++) {
					let board_tile_name = boardTextures[board_ind].image.src.split(
						"imgs/")[1].split(
						".")[0].replace(
						"green_", "").replace(
						"red_", "").replace(
						"blue_", "").replace(
						"grey_", "");
					if (angleZ_board[board_ind] === 0) {
						if(ends[end_tile_name][k] ==="c"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
						if(ends[end_tile_name][k] === "b"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
					} else if(player_angZZ[tileIndex] === 270){
						if(ends[end_tile_name][k] === "e"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
						if(ends[end_tile_name][k] === "d"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
					} else if(player_angZZ[tileIndex] === 90){
						if(ends[end_tile_name][k] === "e"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
						if(ends[end_tile_name][k] === "d"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
					}
					// 180
					else {
						if(ends[end_tile_name][k] === "c"){
							points += parseInt(board_tile_name.split("_")[1]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[1]);
							}
						}
						if(ends[end_tile_name][k] === "b"){
							points += parseInt(board_tile_name.split("_")[0]);
							if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
								points -= parseInt(board_tile_name.split("_")[0]);
							}
						}
					}
				}
			}
		}

	}

	return points;
}

function selectPlayerTile() {
	// only change when the selected tile is different from the previous selected tile
	if(selectedTile !== tileIndex) {
		let tile = null;

		// Tile Selected now
		if (!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("red_")) {
			// if the tile is in the first position
			if(!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("blue_")){
				tile = playerTextures[tileIndex].image.src.split("imgs/")[1];
				player_angX[tileIndex] = angleX_board[0];
				player_angYY[tileIndex] = angleY_board[0];
				player_angZZ[tileIndex] = angleZ_board[0];
				player_ty[tileIndex] = -3;
				player_tx[tileIndex] = 0;
				player_tz[tileIndex] = board_tz[0];
				addToTz(player_tz, tileIndex, board_tz[0]);
			}
			// if the tile isn't on a "snapable" position
			else if(!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("green_")){
				tile = playerTextures[tileIndex].image.src.split("imgs/blue_")[1];
			}
			// if the tile is on a "snapable" position
			else {
				tile = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
			}
			// change the texture to red
			bindImgToTexture(playerTextures, tileIndex, null);
			playerTextures[tileIndex].image.src = "imgs/red_" + tile;
		}

		// Tile previously selected
		if (selectedTile !== null){
			if(playerTextures[selectedTile].image.src.split("imgs/")[1].includes("red_")){
				// change the texture to blue
				tile = playerTextures[selectedTile].image.src.split("imgs/")[1].split("red_")[1];
				bindImgToTexture(playerTextures, selectedTile, null);
				playerTextures[selectedTile].image.src = "imgs/blue_" + tile;
			} else if (playerTextures[selectedTile].image.src.split("imgs/")[1].includes("green_")){
				// change the texture to blue
				tile = playerTextures[selectedTile].image.src.split("imgs/")[1].split("green_")[1];
				bindImgToTexture(playerTextures, selectedTile, null);
				playerTextures[selectedTile].image.src = "imgs/blue_" + tile;
			}
		}

		// update selected tile
		selectedTile = tileIndex;
	}
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

		// Drawing the triangles defining the model

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

function handlePlayerButtons() {
	for (let i = 1; i < playerTextures.length + 1; i++) {
		let elemId = "tile" + i;
		//console.log(elemId);
		document.getElementById(elemId).disabled = false;
		document.getElementById(elemId).onclick = function () {
			tileIndex = i - 1;
			if(!document.getElementById("lose").innerHTML.includes("You")) {
				selectPlayerTile();
				document.getElementById(elemId).style.backgroundColor = "#f43941";
			}
			for(let j = 1;  j < playerTextures.length + 1; j++) {
				let id = "tile" + j;
				if(j !== i){
					document.getElementById(id).style.backgroundColor = "#87877f";
				}
			}
		};
	}
}

function handleSliders() {
	document.getElementById("tx").value = globalTx;
	document.getElementById("ty").value = globalTy;
}

function resetDeckPos(){
	globalTx = 0.0;
	globalTy = 0.0;
	localTx = 0.0;
	localTy = 0.0;
	document.getElementById("myRange_tx").value = globalTx;
	document.getElementById("myRange_ty").value = globalTy;
}

function hideOrShowTransSliders(){
	if(rotateDeckX || rotateDeckY || rotateDeckZ){
		document.getElementById("tx").style.display = "none";
		document.getElementById("ty").style.display = "none";
		document.getElementById("resetPosition").style.display = "none";
		resetDeckPos();
	} else {
		document.getElementById("tx").style.display = "";
		document.getElementById("ty").style.display = "";
		document.getElementById("resetPosition").style.display = "";
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

	resetDeckPos();

	tick();		// A timer controls the rendering / animation

	outputInfos();
}



