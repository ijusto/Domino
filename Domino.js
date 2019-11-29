//////////////////////////////////////////////////////////////////////////////
//
//  Adapted from http://sweet.ua.pt/jmadeira/WebGL/WebGL_Aula_09.zip, J. Madeira - November 2015
//
//	Inês Justo, Rafael Maio - November 2019
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
var cubeVertexIndexBufferFrontFace = null, cubeVertexIndexBufferNotFrontFace = null;
var cubeVertexTextureCoordBufferFrontFace = null, cubeVertexTextureCoordBufferNotFrontFace = null;

// The global transformation parameters

var dist_between_tiles = 1.1; // 1.7
var totalDist = -9.4;

// The translation vector
var player_tx = [-9.4];
for(let i = 1; i < 7; i++) {
	totalDist = totalDist + dist_between_tiles;
	player_tx[i] = player_tx[i-1] + dist_between_tiles;
}
var player_ty = [-7, -7, -7, -7, -7, -7, -7];
var player_tz = [0, 0, 0, 0, 0, 0, 0];

var player_bottom_pos_x = [-9.4];
var player_bottom_pos_y = [-7];
for(let i = 1; i < 18; i++) {
	player_bottom_pos_x[i] = player_bottom_pos_x[i-1] + dist_between_tiles;
	player_bottom_pos_y[i] = -7;
}
for(let i = 18; i < 21; i++){
	player_bottom_pos_x[i] = player_bottom_pos_x[i-18];
	player_bottom_pos_y[i] = -9;
}

var player_tz_ortho = [0, 0, 0, 0, 0, 0, 0];
var player_tz_persp = [-25, -25, -25, -25, -25, -25, -25];

var pc_tx = [-9.4];
for(let i = 1; i < 6; i++) {
	pc_tx[i] = pc_tx[i-1] + dist_between_tiles;
}
var pc_ty = [8.8, 8.8, 8.8, 8.8, 8.8, 8.8];
var pc_tz = [-3, -3, -3, -3, -3, -3];

var pc_tz_ortho = [-3, -3, -3, -3, -3, -3];
var pc_tz_persp = [-40, -40, -40, -40, -40, -40];

var pcIndex = null;

let boardTxCenter = 0;
let boardTyCenter = 0;
let boardTzCenterOrtho = 0;
let boardTzCenterPersp = -25;

var board_tx = [0];
var board_ty = [0];
var board_tz = [0];

var board_tz_ortho = [boardTzCenterOrtho];
var board_tz_persp = [boardTzCenterPersp];

var change_proj = false;

// The rotation angles in degrees

var angleXX = 0.0, angleYY = 0.0;
var rotateZ = false;

var player_angX = [0, 0, 0, 0, 0, 0, 0];
var player_angYY = [0, 0, 0, 0, 0, 0, 0];
var player_angZZ = [0, 0, 0, 0, 0, 0, 0];

var angleX_board = [0], angleY_board = [0], angleZ_board = [90];

// Textures player
var playerTextures = [null, null, null, null, null, null, null];

// Textures computer
var pcTextures = [];

// Textures "deck"
var deckTextures = [];

// Textures board tiles
var boardTextures = [];

var deckLength = 0;

var playerTiles = [];
var deckTiles = [];

// The scaling factors
var sx = 0.10;
var sy = 0.10;
var sz = 0.10;

var ends = {};

var snapTileIndex;
var tileIndex = null;
var selectedTile = null;

// To allow choosing the projection type
var projectionType = 0;
var left_ortho = -1.0, right_ortho = 1.0, bottom_ortho = -1.0, top_ortho = 1.0, near_ortho = -1.0, far_ortho = 1.0;
var fovy_persp = 45; // angle in degrees
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
	0, 1, 2, 	0, 2, 3    // Front face
];

var cubeVertexIndicesNotFrontFace = [
	4, 5, 6,      4, 6, 7,    // Back face

	8, 9, 10,     8, 10, 11,  // Top face

	12, 13, 14,   12, 14, 15, // Bottom face

	16, 17, 18,   16, 18, 19, // Right face

	20, 21, 22,   20, 22, 23  // Left face
];

var count = 0, tiles = [];
for(let main_number = 0; main_number < 7; main_number++) {
	for (let sec_number = main_number; sec_number < 7; sec_number++) {
		tiles[count] = main_number + "_" + sec_number + ".png";
		count++;
	}
}

var tileShouldBeGreen = false;

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

var rotateBoardX = false;
var rotateBoardY = false;
var rotateBoardZ = false;

var playerOutcomeString = "";
var pc_can_play = true;
var player_can_play = true;

var webGLTexture_black_faces = null;

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

function initTextures() {
	bindImgToTexture(boardTextures, 0, null);
	boardTextures[0].image.src = "imgs/" + tiles[27];
	tiles.splice(27, 1);
	ends["6_6"] = ["e","d"];

	let i = 0;
	while(i < 6) {
		addTextureToList(pcTextures, i, tiles);
		i++;
	}

	i = 0;
	while(tiles.length > 14 && tiles.length <= 21) {
		addTextureToList(playerTextures, i, tiles);
		i++;
	}

	i = 0;
	while(tiles.length > 0 && tiles.length <= 14) {
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
	cubeVertexTextureCoordBufferFrontFace.numItems = 4;

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

/*
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
*/

//----------------------------------------------------------------------------

//  Drawing the model

function drawDominoModel(angx, angy, angz,
						 sx, sy, sz,
						 tx, ty, tz,
						 mvMatrix,
						 front_face_texture,
						 board) {
    // Pay attention to transformation order !!
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	let boardTzCenter;
	if(projectionType === 0) { boardTzCenter = boardTzCenterOrtho; }
	else { boardTzCenter = boardTzCenterPersp; }
	// Handle board tiles
	if (board){
		// Rotating board
		if(rotateBoardX || rotateBoardY || rotateBoardZ) {
			mvMatrix = mult(mvMatrix, translationMatrix(boardTxCenter*sx,
														boardTyCenter*sy,
														boardTzCenter*sz));

			if (rotateBoardZ) { mvMatrix = mult(mvMatrix, rotationZZMatrix(globalAngleZZ)); }
			if (rotateBoardY) { mvMatrix = mult(mvMatrix, rotationYYMatrix(globalAngleYY)); }
			if (rotateBoardX) { mvMatrix = mult(mvMatrix, rotationXXMatrix(globalAngleXX)); }

			mvMatrix = mult(mvMatrix, translationMatrix(tx + globalTx - boardTxCenter*sx,
														ty + globalTy - boardTyCenter*sy,
														tz - boardTzCenter*sz));
		}
		// Steady board
		else {
			mvMatrix = mult(mvMatrix, translationMatrix(tx + globalTx, ty + globalTy, tz));
		}
	}
	// Handle Player and Pc tiles
	else {
		mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
	}

	mvMatrix = mult(mvMatrix, rotationZZMatrix(angz));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(angy));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(angx));

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

/*
function drawTextures(texture, textureBuffer, vertexBuffer) {
	// Textures
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	// The vertex indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexBuffer);
	// Drawing the triangles DRAWING ELEMENTS
	gl.drawElements(gl.TRIANGLES, vertexBuffer.itemSize, gl.UNSIGNED_SHORT, 0);
}
 */

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
			for(let list = 0; list < [player_tz_persp, pc_tz_persp, board_tz_persp].length; list++){
				for (let i = 0; i < [player_tz, pc_tz, board_tz][list].length; i++) {
					[player_tz_persp, pc_tz_persp, board_tz_persp][list][i] = [player_tz, pc_tz, board_tz][list][i];
				}
			}
			for(let list = 0; list < [player_tz_ortho, pc_tz_ortho, board_tz_ortho].length; list++){
				for (let i = 0; i < [player_tz_ortho, pc_tz_ortho, board_tz_ortho][list].length; i++) {
					[player_tz, pc_tz, board_tz][list][i] = [player_tz_ortho, pc_tz_ortho, board_tz_ortho][list][i];
				}
			}
		}

		change_proj = false;

	} else {

		// A standard view volume.

		// Viewer is at (0,0,0)

		pMatrix = perspective(fovy_persp, aspect_persp, near_persp, far_persp);

		if (!change_proj) {
			for(let list = 0; list < [player_tz_ortho, pc_tz_ortho, board_tz_ortho].length; list++){
				for (let i = 0; i < [player_tz, pc_tz, board_tz][list].length; i++) {
					[player_tz_ortho, pc_tz_ortho, board_tz_ortho][list][i] = [player_tz, pc_tz, board_tz][list][i];
				}
			}
			for(let list = 0; list < [player_tz_persp, pc_tz_persp, board_tz_persp].length; list++){
				for (let i = 0; i < [player_tz_persp, pc_tz_persp, board_tz_persp][list].length; i++) {
					[player_tz, pc_tz, board_tz][list][i] = [player_tz_persp, pc_tz_persp, board_tz_persp][list][i];
				}
			}
		}

		change_proj = true;
	}

	// Passing the Projection Matrix to apply the current projection
	let pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

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
	}

	tileShouldBeGreen = false;

	// a tile is selected
	if (tileIndex !== null) {
		let boardIndex = possibleAttachBoardTileIndex();
		if(boardIndex !== null){
			colorGreen();
			snapTileIndex = boardIndex;
		}

		// colorRed
		if (!playerTextures[tileIndex].image.src.includes("imgs/red") && tileShouldBeGreen === false) {
			let tileName = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
			colorRed(tileName);
		}

	}
	// no tile is selected and snap tile button is enabled
	else if (document.getElementById("snapTile").disabled === false) {
		document.getElementById("snapTile").disabled = true;
		document.getElementById("snapTile").style.display = "none";
	}

	if(deckLength === 0) {
		let cant_play = true;
		for (let i = 0; i < player_tx.length; i++) {
			let player_ends = getSideNumbersOfTile(playerTextures[i].image.src);
			for (let end_tile_name in ends) {
				// check if the property/key is defined in the object itself, not in parent
				if (ends.hasOwnProperty(end_tile_name)) {
					for (let j = 0; j < boardTextures.length; j++) {
						if (boardTextures[j].image.src.includes(end_tile_name)) {
							let end_num = end_tile_name.split("_");
							if (angleZ_board[j] === 0) {
								if (ends[end_tile_name][0].includes("c")) {
									if (end_num[0] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[0] === player_ends[1]) {
										cant_play = false;
										break;
									}
								} else if (ends[end_tile_name][0].includes("b")) {
									if (end_num[1] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[1] === player_ends[1]) {
										cant_play = false;
										break;
									}
								}
							} else if (angleZ_board[j] === 90) {
								if (ends[end_tile_name][0].includes("e")) {
									if (end_num[0] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[0] === player_ends[1]) {
										cant_play = false;
										break;
									}
								} else if (ends[end_tile_name][0].includes("d")) {
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
								if (ends[end_tile_name][0].includes("c")) {
									if (end_num[1] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[1] === player_ends[1]) {
										cant_play = false;
										break;
									}
								} else if (ends[end_tile_name][0].includes("b")) {
									if (end_num[0] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[0] === player_ends[1]) {
										cant_play = false;
										break;
									}
								}
							} else if (angleZ_board[j] === 270) {
								if (ends[end_tile_name][0].includes("e")) {
									if (end_num[1] === player_ends[0]) {
										cant_play = false;
										break;
									} else if (end_num[1] === player_ends[1]) {
										cant_play = false;
										break;
									}
								} else if (ends[end_tile_name][0].includes("d")) {
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
			pcMove();
		}
	}
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
				// add to tz
				changeAllTz(true, player_tz, tileIndex, board_tz[0]);
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
			colorRed(tile);
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

function getSideNumbersOfTile(tile_src_name){
	return tile_src_name.split("imgs/")[1].replace(
		"red_", "").replace(
		"green_", "").replace(
		"blue_", "").replace(
		"grey_", "").replace(
		".png", "").split("_");
}

function boardTilesWithEnds(){
	let boardEndTiles = {};
	for (let end_tile_name in ends) {
		// check if the property/key is defined in the object itself, not in parent
		if (ends.hasOwnProperty(end_tile_name)) {
			for (let boardIndex = 0; boardIndex < boardTextures.length; boardIndex++) {
				if (boardTextures[boardIndex].image.src.includes(end_tile_name)) {
					boardEndTiles[end_tile_name] = boardIndex;
				}
			}
		}
	}
	return boardEndTiles;
}

function possibleAttachBoardTileIndex(){
	let angZBoardAux;
	let boardEndTiles = boardTilesWithEnds();

	for (let end_tile_name in boardEndTiles) {
		// check if the property/key is defined in the object itself, not in parent
		if (boardEndTiles.hasOwnProperty(end_tile_name)) {
			let boardIndex = boardEndTiles[end_tile_name];

			let sideNumbersPlayerTile = getSideNumbersOfTile(playerTextures[tileIndex].image.src);
			if (angleZ_board[boardIndex] + 180 >= 360) {
				angZBoardAux = angleZ_board[boardIndex] + 180 - 360;
			} else {
				angZBoardAux = angleZ_board[boardIndex] + 180;
			}
			// parallel to board piece
			if (sideNumbersPlayerTile[0] !== sideNumbersPlayerTile[1]) {
				if (player_angZZ[tileIndex] === angleZ_board[boardIndex] || player_angZZ[tileIndex] === angZBoardAux) {
					// left of the board piece
					if (ends[end_tile_name].includes("e")) {
						if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -2.5 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < -1.8) {
							if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -0.4 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 0.4) {
								return boardIndex;
							}
						}
					}
					// right of the board piece
					if (ends[end_tile_name].includes("d")) {
						if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 2.5 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > 1.8) {
							if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -0.4 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 0.4) {
								return boardIndex;
							}
						}
					}
					//down of the board piece
					if (ends[end_tile_name].includes("b")) {
						if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -0.4 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 0.4) {
							if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -2.5 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < -1.8) {
								return boardIndex;
							}
						}
					}
					// up of the board piece
					if (ends[end_tile_name].includes("c")) {
						if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -0.4 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 0.4) {
							if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 2.5 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > 1.8) {
								return boardIndex;
							}
						}
					}

				}
			}
			// prependicular to board piece
			if (player_angZZ[tileIndex] !== angleZ_board[boardIndex] && player_angZZ[tileIndex] !== angZBoardAux) {
				// left of the board piece
				if (ends[end_tile_name].includes("e")) {
					if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -1.9 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < -1.4) {
						if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -0.6 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 0.6) {
							return boardIndex;
						}
					}
				}
				// right of the board piece
				if (ends[end_tile_name].includes("d")) {
					if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 1.9 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > 1.4) {
						if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -0.6 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 0.6) {
							return boardIndex;
						}
					}
				}
				// down of the board piece
				if (ends[end_tile_name].includes("b")) {
					if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -0.6 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 0.6) {
						if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > -1.9 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < -1.4) {
							return boardIndex;
						}
					}
				}
				// up of the board piece
				if (ends[end_tile_name].includes("c")) {
					if (player_tx[tileIndex] - (board_tx[boardIndex] + localTx) > -0.6 && player_tx[tileIndex] - (board_tx[boardIndex] + localTx) < 0.6) {
						if (player_ty[tileIndex] - (board_ty[boardIndex] + localTy) < 1.9 && player_ty[tileIndex] - (board_ty[boardIndex] + localTy) > 1.4) {
							return boardIndex;
						}
					}
				}
			}
		}
	}

	return null;
}

function tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, tx, ty, rem, add, isPc, pc_ang){
	// player
	if (!isPc) {
		if (!collisionDetection(tx, ty, player_angZZ[tileIndex])) {
			changeTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, tx, ty, rem, add, isPc, pc_ang);
			for (let j = 1; j < playerTextures.length + 1; j++) {
				let id = "tile" + j;
				document.getElementById(id).style.backgroundColor = "#87877f";
			}
			if (player_tx.length === 0) {
				player_can_play = false;
			}
			pcMove();
		}
	}
	// pc
	else {
		if (!collisionDetection(tx, ty, pc_ang)) {
			changeTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, tx, ty, rem, add, isPc, pc_ang);
			if (pc_tx.length === 0) {
				pc_can_play = false;
			}
		} else {
			// get tile pc
			if (deckLength !== 0) {
				getTileFromDeck(true);
			} else {
				pc_can_play = false;
			}
		}
	}
}

function changeTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, tx, ty, rem, add, isPc, pc_ang) {
	let dicBoardKey, dicPlayerKey, listOfTextures, angx, angy, angz, textureList, index, pos_tx, pos_ty, pos_tz;

	if (!isPc){
		listOfTextures = [playerTextures[tileIndex].image.src.split("imgs/green_")[1]];
		angz = player_angZZ[tileIndex];
		angx = player_angX[tileIndex];
		angy = player_angYY[tileIndex];
		textureList = playerTextures;
		index = tileIndex;
		pos_tx = player_tx;
		pos_ty = player_ty;
		pos_tz = player_tz;
	} else {
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

	dicBoardKey = sideNumbersBoardTile[0] + "_" + sideNumbersBoardTile[1];
	dicPlayerKey = sideNumbersPlayerTile[0] + "_" + sideNumbersPlayerTile[1];
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
	// remove from tz
	changeAllTz(false, pos_tz, null, null);
	// add to tz
	changeAllTz(true, board_tz, board_tz.length, board_tz[0]);

	if(!isPc){
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

function pcMove(){
	let boardEndTiles = boardTilesWithEnds();
	if(pc_can_play){
		let pc_play = false;
		for (let pc_tile_ind = 0; pc_tile_ind < pcTextures.length; pc_tile_ind++) {
			let sideNumbersPcTile = getSideNumbersOfTile(pcTextures[pc_tile_ind].image.src);
			pcIndex = pc_tile_ind;

			for (let end_tile_name in boardEndTiles) {
				// check if the property/key is defined in the object itself, not in parent
				if (boardEndTiles.hasOwnProperty(end_tile_name)) {
					let boardIndex = boardEndTiles[end_tile_name];

					snapTileIndex = boardIndex;
					let end_tile_numbers = end_tile_name.split("_");
					if (angleZ_board[boardIndex] === 0) {
						if (ends[end_tile_name][0] === "c") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 1.5, "c", ["e", "d"], true, 90);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 2, "c", "c", true, 180);
									pc_play = true;
									break;
								} else if (end_tile_numbers[0] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 2, "c", "c", true, 0);
									pc_play = true;
									break;
								}
							}
						} else if (ends[end_tile_name][0] === "b") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -1.5, "b", ["e", "d"], true, 90);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -2, "b", "b", true, 0);
									pc_play = true;
									break;
								} else if (end_tile_numbers[1] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -2, "b", "b", true, 180);
									pc_play = true;
									break;
								}
							}
						}
					} else if (angleZ_board[boardIndex] === 90) {
						if (ends[end_tile_name][0] === "e") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -1.5, 0, "e", ["c", "b"], true, 0);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -2, 0, "e", "e", true, 270);
									pc_play = true;
									break;
								} else if (end_tile_numbers[0] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -2, 0, "e", "e", true, 90);
									pc_play = true;
									break;
								}
							}
						} else if (ends[end_tile_name][0] === "d") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 1.5, 0, "d", ["c", "b"], true, 0);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 2, 0, "d", "d", true, 90);
									pc_play = true;
									break;
								} else if (end_tile_numbers[1] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 2, 0, "d", "d", true, 270);
									pc_play = true;
									break;
								}
							}
						}
					} else if (angleZ_board[boardIndex] === 180) {
						if (ends[end_tile_name][0] === "c") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 1.5, "c", ["e", "d"], true, 90);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 2, "c", "c", true, 180);
									pc_play = true;
									break;
								} else if (end_tile_numbers[1] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, 2, "c", "c", true, 0);
									pc_play = true;
									break;
								}
							}
						} else if (ends[end_tile_name][0] === "b") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -1.5, "b", ["e", "d"], true, 90);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -2, "b", "b", true, 0);
									pc_play = true;
									break;
								} else if (end_tile_numbers[0] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 0, -2, "b", "b", true, 180);
									pc_play = true;
									break;
								}
							}
						}
					} else if (angleZ_board[boardIndex] === 270) {
						if (ends[end_tile_name][0] === "e") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -1.5, 0, "e", ["c", "b"], true, 0);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[1] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -2, 0, "e", "e", true, 270);
									pc_play = true;
									break;
								} else if (end_tile_numbers[1] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, -2, 0, "e", "e", true, 90);
									pc_play = true;
									break;
								}
							}
						} else if (ends[end_tile_name][0] === "d") {
							if (sideNumbersPcTile[0] === sideNumbersPcTile[1]) {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 1.5, 0, "d", ["c", "b"], true, 0);
									pc_play = true;
									break;
								}
							} else {
								if (end_tile_numbers[0] === sideNumbersPcTile[0]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 2, 0, "d", "d", true, 90);
									pc_play = true;
									break;
								} else if (end_tile_numbers[0] === sideNumbersPcTile[1]) {
									tryTileToBoard(sideNumbersPcTile, end_tile_numbers, 2, 0, "d", "d", true, 270);
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

		if (!pc_play) {
			if (deckLength !== 0) {
				getTileFromDeck(true)
			} else {
				pc_can_play = false;
			}
		}
	}
	if(!pc_can_play && !player_can_play){
		score();
		document.getElementById("getTile").disabled = true;
		document.getElementById("getTile").style.display = "none";
		document.getElementById("lose").innerHTML = "You " + playerOutcomeString;
	}
}

function getTileFromDeck(isPc){
	let index;
	let random_tile = Math.floor(Math.random() * deckTextures.length);
	if(isPc){
		index = pcTextures.length;
		pcTextures[index] = deckTextures[random_tile];
		pc_tx[pc_tx.length] = pc_tx[pc_tx.length - 1] + dist_between_tiles;
		pc_ty[pc_ty.length] = pc_ty[pc_ty.length - 1];
		if (projectionType === 0) {
			pc_tz[pc_tz.length] = 0;
		} else {
			pc_tz[pc_tz.length] = -40;
		}
		pc_tz_ortho[pc_tz_ortho.length] = 0;
		pc_tz_persp[pc_tz_persp.length] = -40;
	} else {
		index = playerTextures.length;
		playerTextures[index] = deckTextures[random_tile];
		playerTiles[index] = deckTiles[random_tile];
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
		player_angX[player_angX.length] = 0;
		player_angYY[player_angYY.length] = 0;
		player_angZZ[player_angZZ.length] = 0;
	}
	deckTextures.splice(random_tile, 1);
	deckTiles.splice(random_tile, 1);
	deckLength = deckTextures.length;
	document.getElementById("deck_tile_number").innerHTML = deckLength;
	if (deckLength === 0) {
		document.getElementById("getTile").disabled = true;
		document.getElementById("getTile").style.display = "none";
	}
}

function colorRed(tileName){
	playerTextures[tileIndex].image.src = "imgs/red_" + tileName;
	document.getElementById("snapTile").disabled = true;
	document.getElementById("snapTile").style.display = "none";
}

function colorGreen(){
	tileShouldBeGreen = true;
	if(!playerTextures[tileIndex].image.src.includes("imgs/green")) {
		let tile = playerTextures[tileIndex].image.src.split("imgs/red_")[1];
		playerTextures[tileIndex].image.src = "imgs/green_" + tile;
		document.getElementById("snapTile").disabled = false;
		document.getElementById("snapTile").style.display = "";
	}
}

function collisionDetection(tx, ty, ang){
	for(let boardIndex = 0; boardIndex < board_tx.length; boardIndex++){
		if(boardIndex !== snapTileIndex) {
			if (angleZ_board[boardIndex] === 0 || angleZ_board[boardIndex] === 180) {
				if (ang === 0 || ang === 180) {
					if ((((board_tx[snapTileIndex] + tx - 0.5) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx - 0.5) < (board_tx[boardIndex] + 0.6)) ||
						((board_tx[snapTileIndex] + tx + 0.5) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx + 0.5) < (board_tx[boardIndex] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty - 1) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty - 1) < (board_ty[boardIndex] + 1.1)) ||
							((board_ty[snapTileIndex] + ty + 1) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty + 1) < (board_ty[boardIndex] + 1.1)))) {
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 0.6)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 1.1)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 1.1)))) {
						return true;
					}
				} else {
					if ((((board_tx[snapTileIndex] + tx - 1) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx - 1) < (board_tx[boardIndex] + 0.6)) ||
						((board_tx[snapTileIndex] + tx + 1) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx + 1) < (board_tx[boardIndex] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty - 0.5) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty - 0.5) < (board_ty[boardIndex] + 1.1)) ||
							((board_ty[snapTileIndex] + ty + 0.5) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty + 0.5) < (board_ty[boardIndex] + 1.1)))) {
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 0.6)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 0.6) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 0.6))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 1.1)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 1.1) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 1.1)))) {
						return true;
					}
				}
			} else {
				if (ang === 0 || ang === 180) {
					if ((((board_tx[snapTileIndex] + tx - 0.5) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx - 0.5) < (board_tx[boardIndex] + 1.1)) ||
						((board_tx[snapTileIndex] + tx + 0.5) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx + 0.5) < (board_tx[boardIndex] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty - 1) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty - 1) < (board_ty[boardIndex] + 0.6)) ||
							((board_ty[snapTileIndex] + ty + 1) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty + 1) < (board_ty[boardIndex] + 0.6)))) {
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 1.1)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 0.6)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 0.6)))) {
						return true;
					}
				} else {
					if ((((board_tx[snapTileIndex] + tx - 1) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx - 1) < (board_tx[boardIndex] + 1.1)) ||
						((board_tx[snapTileIndex] + tx + 1) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx + 1) < (board_tx[boardIndex] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty - 0.5) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty - 0.5) < (board_ty[boardIndex] + 0.6)) ||
							((board_ty[snapTileIndex] + ty + 0.5) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty + 0.5) < (board_ty[boardIndex] + 0.6)))) {
						return true;
					}
					else if ((((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 1.1)) ||
						((board_tx[snapTileIndex] + tx) > (board_tx[boardIndex] - 1.1) && (board_tx[snapTileIndex] + tx) < (board_tx[boardIndex] + 1.1))) &&
						(((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 0.6)) ||
							((board_ty[snapTileIndex] + ty) > (board_ty[boardIndex] - 0.6) && (board_ty[snapTileIndex] + ty) < (board_ty[boardIndex] + 0.6)))) {
						return true;
					}
				}
			}
		}
	}
	return false;
}

function changeAllTz(add, list, index, value) {
	let lst_ortho, lst_persp;
	lst_ortho = [];
	lst_persp = [];
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
	if(add){
		if(projectionType === 1){
			lst_persp[index] = value;
		} else {
			lst_ortho[index] = value;
		}
	} else {
		if(projectionType === 1){
			lst_persp.splice(tileIndex,1);
		} else {
			lst_ortho.splice(tileIndex,1);
		}
	}
}

function points(list) {
	let points = 0;
	for(let tile of list){
		let tile_name = getSideNumbersOfTile(tile.image.src);
		points += parseInt(tile_name.split("_")[0]) + parseInt(tile_name.split("_")[1]);
	}
	return points;
}

function score(){
	let pcPoints = points(playerTextures);
	let playerPoints = points(pcTextures);
	if(playerPoints === pcPoints){
		playerOutcomeString = "draw";
		document.getElementById("player_points").innerHTML = "Player: " + String(playerPoints);
		document.getElementById("pc_points").innerHTML = "Pc: " + String(pcPoints);
	} else if(playerPoints > pcPoints){
		playerOutcomeString = "win!!";
		document.getElementById("player_points").innerHTML = "Player: " + String(playerPoints);
		document.getElementById("pc_points").innerHTML = "Pc: " + String(pcPoints);
	} else {
		playerOutcomeString = "lose";
		document.getElementById("player_points").innerHTML = "Player: " + String(playerPoints);
		document.getElementById("pc_points").innerHTML = "Pc: " + String(pcPoints);
	}
}

/*
// add points to each player after a play (every dot on every end of the board tiles is consider)
function other_method_score(type, rem, add, pc_ang, dicBoardKey){
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
			// check if the property/key is defined in the object itself, not in parent
			if (ends.hasOwnProperty(end_tile_name)) {
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
							if (ends[end_tile_name][k] === "c") {
								points += parseInt(board_tile_name.split("_")[0]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[0]);
								}
							}
							if (ends[end_tile_name][k] === "b") {
								points += parseInt(board_tile_name.split("_")[1]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[1]);
								}
							}
						} else if (player_angZZ[tileIndex] === 270) {
							if (ends[end_tile_name][k] === "e") {
								points += parseInt(board_tile_name.split("_")[1]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[1]);
								}
							}
							if (ends[end_tile_name][k] === "d") {
								points += parseInt(board_tile_name.split("_")[0]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[0]);
								}
							}
						} else if (player_angZZ[tileIndex] === 90) {
							if (ends[end_tile_name][k] === "e") {
								points += parseInt(board_tile_name.split("_")[0]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[0]);
								}
							}
							if (ends[end_tile_name][k] === "d") {
								points += parseInt(board_tile_name.split("_")[1]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[1]);
								}
							}
						}
						// 180
						else {
							if (ends[end_tile_name][k] === "c") {
								points += parseInt(board_tile_name.split("_")[1]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[1]);
								}
							}
							if (ends[end_tile_name][k] === "b") {
								points += parseInt(board_tile_name.split("_")[0]);
								if (end_tile_name === dicBoardKey && ends[dicBoardKey][k] === rem) {
									points -= parseInt(board_tile_name.split("_")[0]);
								}
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
 */

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
	} else {
		if (currentlyPressedKeys[37]) {
			// Left cursor key
			if (tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_tx[tileIndex] -= 0.05;
			}
		}
		if (currentlyPressedKeys[39]) {
			// Right cursor key
			if (tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_tx[tileIndex] += 0.05;
			}
		}
		if (currentlyPressedKeys[38]) {
			// Up cursor key
			if (tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_ty[tileIndex] += 0.05;
			}
		}

		if (currentlyPressedKeys[40]) {
			// Down cursor key
			if (tileIndex !== null && !document.getElementById("lose").innerHTML.includes("You")) {
				player_ty[tileIndex] -= 0.05;
			}
		}
	}

	document.addEventListener("keypress", function(event){

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
	    handleChangesHtml();
        animate();
    }
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
				document.getElementById("zoom_ortho").hidden = false;
				document.getElementById("near_ortho").hidden = true;
				document.getElementById("far_ortho").hidden = true;
				document.getElementById("fovy_persp").hidden = true;
				document.getElementById("aspect_persp").hidden = true;
				document.getElementById("near_persp").hidden = true;
				document.getElementById("far_persp").hidden = true;
				break;
			case 1 :
				projectionType = 1;
				document.getElementById("zoom_ortho").hidden = true;
				document.getElementById("near_ortho").hidden = true;
				document.getElementById("far_ortho").hidden = true;
				document.getElementById("fovy_persp").hidden = false;
				document.getElementById("aspect_persp").hidden = true;
				document.getElementById("near_persp").hidden = true;
				document.getElementById("far_persp").hidden = true;
				break;
		}
	});


	// Button events
	document.getElementById("resetPosition").onclick = function () {
		resetBoardPos();
	};

	document.getElementById("rotateBoardX").onclick = function () {
		rotateBoardX = !rotateBoardX;
		if(rotateBoardX){
			document.getElementById("rotateBoardX").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateBoardX").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("rotateBoardY").onclick = function () {
		rotateBoardY = !rotateBoardY;
		if(rotateBoardY){
			document.getElementById("rotateBoardY").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateBoardY").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("rotateBoardZ").onclick = function () {
		rotateBoardZ = !rotateBoardZ;
		if(rotateBoardZ){
			document.getElementById("rotateBoardZ").style.backgroundColor = "#317bf4";
		} else {
			document.getElementById("rotateBoardZ").style.backgroundColor = "#87877f";
		}
		hideOrShowTransSliders();
	};

	document.getElementById("getTile").onclick = function () {
		if(!document.getElementById("lose").innerHTML.includes("You")) {
			if (deckLength !== 0) {
				getTileFromDeck(false);
			}
			pcMove();
		}
	};

	document.getElementById("snapTile").onclick = function () {
		let sideNumbersPlayerTile = getSideNumbersOfTile(playerTextures[tileIndex].image.src);
		let sideNumbersBoardTile = getSideNumbersOfTile(boardTextures[snapTileIndex].image.src);
		//Paralelo
		if (player_angZZ[tileIndex] === 0 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-(board_ty[snapTileIndex]+localTy)<0) {
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -2, "b", ["b"], false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +2, "c", ["c"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 90 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -2, 0, "e", ["e"], false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +2, 0, "d", ["d"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 180 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -2, "b", ["b"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +2, "c", ["c"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 270 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -2, 0, "e", ["e"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +2, 0, "d", ["d"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -2, "b", ["b"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +2, "c", ["c"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -2, 0, "e", ["e"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +2, 0, "d", ["d"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -2, "b", ["b"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +2, "c", ["c"],false, 0);
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -2, 0, "e", ["e"],false, 0);
				}
			}
			else{
				if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
					tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +2, 0, "d", ["d"],false, 0);
				}
			}
		}
		//PERPENDICULAR +90
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, 0, "e", ["b","c"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, -0.5, "e", ["b"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, +0.5, "e", ["c"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, 0, "d", ["b","c"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, -0.5, "d", ["b"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, +0.5, "d", ["c"],false, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -1.5, "b", ["d","e"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, -1.5, "b", ["d"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, -1.5, "b", ["e"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +1.5, "c", ["d","e"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, +1.5, "c", ["d"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, +1.5, "c", ["e"],false, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, 0, "e", ["c","b"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, +0.5, "e", ["c"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, -0.5, "e", ["b"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, 0, "d", ["c","b"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, +0.5, "d", ["c"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, -0.5, "d", ["b"],false, 0);
					}
				}
			}
		}

		//MUDEI AQUI
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -1.5, "b", ["e","d"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, -1.5, "b", ["e"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, -1.5, "b", ["d"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +1.5, "c", ["e","d"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, +1.5, "c", ["e"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, +1.5, "c", ["d"],false, 0);
					}
				}
			}
		}
		//PERPENDICULAR +180
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, 0, "e", ["b","c"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, -0.5, "e", ["b"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, +0.5, "e", ["c"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, 0, "d", ["b","c"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, -0.5, "d", ["b"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, +0.5, "d", ["c"],false, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -1.5, "b", ["d","e"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, -1.5, "b", ["d"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, -1.5, "b", ["e"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +1.5, "c", ["d","e"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, +1.5, "c", ["d"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, +1.5, "c", ["e"],false, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]-localTx<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, 0, "e", ["c","b"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, +0.5, "e", ["c"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -1.5, -0.5, "e", ["b"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, 0, "d", ["c","b"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, +0.5, "d", ["c"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +1.5, -0.5, "d", ["b"],false, 0);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]-localTy<0) {
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, -1.5, "b", ["e","d"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, -1.5, "b", ["e"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[0]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, -1.5, "b", ["d"],false, 0);
					}
				}
			}
			else{
				if(sideNumbersPlayerTile[0]===sideNumbersPlayerTile[1]){
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1] || sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]){
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, 0, +1.5, "c", ["e","d"],false, 0);
					}
				}
				else {
					if (sideNumbersPlayerTile[0] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, -0.5, +1.5, "c", ["e"],false, 0);
					} else if (sideNumbersPlayerTile[1] === sideNumbersBoardTile[1]) {
						tryTileToBoard(sideNumbersPlayerTile, sideNumbersBoardTile, +0.5, +1.5, "c", ["d"],false, 0);
					}
				}
			}
		}
	}
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL(canvas) {
	try {
		// Create the WebGL context

		// Some browsers still need "experimental-webgl"

		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		// DEFAULT: The viewport occupies the whole canvas

		// DEFAULT: The viewport background color is WHITE

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

function handleChangesHtml() {
	document.getElementById("tx").value = globalTx;
	document.getElementById("ty").value = globalTy;
	document.getElementById("deck_tile_number").innerHTML = deckLength;
}

function resetBoardPos(){
	globalTx = 0.0;
	globalTy = 0.0;
	localTx = 0.0;
	localTy = 0.0;
	document.getElementById("myRange_tx").value = globalTx;
	document.getElementById("myRange_ty").value = globalTy;
}

function hideOrShowTransSliders(){
	if(rotateBoardX || rotateBoardY || rotateBoardZ){
		document.getElementById("tx").style.display = "none";
		document.getElementById("ty").style.display = "none";
		document.getElementById("resetPosition").style.display = "none";
		resetBoardPos();
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

	resetBoardPos();

	tick();		// A timer controls the rendering / animation

}



