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
var player_tx = [-9.4];
var player_bottom_pos_x = [-9.4];
var player_bottom_pos_y = [-7];
var dist_between_tiles = 1.1; // 1.7
for(let i = 1; i < 18; i++) {
	player_bottom_pos_x[i] = player_bottom_pos_x[i-1] + dist_between_tiles;
	player_bottom_pos_y[i] = -7;
}
for(let i = 18; i < 21; i++){
	player_bottom_pos_x[i] = player_bottom_pos_x[i-18];
	player_bottom_pos_y[i] = -9;
}
for(let i = 1; i < 7; i++) {
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

var board_tx = [0];
var board_ty = [0];
var board_tz = [0];
var board_tz_ortho = [0];
var board_tz_persp = [-27];

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
var playerTextures = [];
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

var playerTilesLength = 7;

var ends = {};
var snapTileIndex;

// Animation controls

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

// NEW - GLOBAL Animation controls

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

var rotateDeck = false;


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
	ends["6_6"]=["e","d"];

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

	deckLength = deckTextures.length;
	playerTilesLength = playerTextures.length;

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
						 front_face_texture,
						 board) {
    // Pay attention to transformation order !!
	// NEW --- GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	if(rotateDeck && board) {
		if(projectionType === 1) {
			mvMatrix = mult(translationMatrix(0, 0, tz),
							rotationYYMatrix(globalAngleYY));
			//mvMatrix = mult(mvMatrix, translationMatrix(0, 0, tz));
			//mvMatrix = mult(mvMatrix, rotationYYMatrix( globalAngleYY ));
		} else {
			mvMatrix = mult(translationMatrix(0, 0, tz),
							rotationYYMatrix(globalAngleYY));
		}
	}
	if(projectionType === 0) {
		mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
	} else {
		if(board){
			if(rotateDeck) {
				mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, 0));
			} else {
				mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
			}
		} else {
			mvMatrix = mult(mvMatrix, translationMatrix(tx, ty, tz));
		}

	}
	mvMatrix = mult(mvMatrix, rotationZZMatrix(angleZZ));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(angleYY));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(angleXX));

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


	for (let id of [/*"left_ortho", "right_ortho", "bottom_ortho", "tz", */"rotx", "roty", "rotz", "near_ortho", "far_ortho", "fovy_persp", "aspect_persp", "near_persp", "far_persp"]) {
		let elemId = "myRange_" + id;
		let slider = document.getElementById(elemId);
		elemId = "demo_" + id;
		let output = document.getElementById(elemId);
		if (id === "near_ortho" || id === "far_ortho" || id === "near_persp" || id === "aspect_persp") {
			output.innerHTML = parseFloat(slider.value) / 10;
		} /*else if(id === "tz") {
			output.innerHTML = parseFloat(slider.value)/100;
		} */ else {
			output.innerHTML = slider.value;
		}
		slider.oninput = function () {
			//output.innerHTML = this.value;
			switch (id) {
				case "rotx":
					globalAngleXX = this.value;
					break;
				case "roty":
					globalAngleYY = this.value;
					break;
				case "rotz":
					globalAngleZZ = this.value;
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
				/*
            case "tz":
                tz = parseFloat(this.value)/100;
                break;*/
			}
		};


	}

	// NEW --- Computing the Projection Matrix

	if (projectionType === 0) {

		// For now, the default orthogonal view volume

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

		// TO BE DONE !

		// Allow the user to control the size of the view volume

	} else {

		// A standard view volume.

		// Viewer is at (0,0,0)

		// Ensure that the model is "inside" the view volume

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

	// NEW --- Instantianting the same model more than once !!

	// And with diferent transformation parameters !!

	// Call the drawModel function

	for(let i = 8; i<22; i++) {
		document.getElementById("tile"+i).hidden = true;
	}

	// Player pieces
	let id = 0;

	for(let i = player_tx.length + 1; i < 22; i++){
		document.getElementById("tile" + i).disabled = true;
		document.getElementById("tile" + i).style.display = "none";
	}
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
		document.getElementById("tile" + id).innerHTML = playerTextures[i].image.src.split(
			"imgs/")[1].split(
				".")[0].replace(
					"green_","").replace(
						"red_","").replace(
							"blue_","");
		//console.log(document.getElementById("tile" + id).innerHTML);
		document.getElementById("tile" + id).style.display = "";
		document.getElementById("tile" + id).disabled = false;
		//TODO: Update player tiles
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
	for(let i = 0; i < pcTextures.length; i++){
		drawDominoModel( 0, 180, 0,
			sx, sy, sz,
			pc_tx[i]*sx, pc_ty[i]*sy, pc_tz[i]*sz,
			mvMatrix,
			primitiveType,
			pcTextures[i],
			false
		);
	}
/*
	let j = 1;
	for (j; j <= player_tx.length; j++) {
		document.getElementById("tile" + j.toString()).disabled = false;
	}

 */

	j = player_tx.length + 1;
	for (j; j > player_tx.length && j <= 21; j++) {
		document.getElementById("tile" + j.toString()).disabled = true;
	}

	if (rotateZ && tileIndex !== null) {
		if (player_angZZ[tileIndex] === 0) {
			player_angZZ[tileIndex] = 270;

		} else {
			player_angZZ[tileIndex] -= 90;
		}
		rotateZ = false;
	}
	/*
	console.log("angX: " + player_angZZ[tileIndex]);
	console.log("tx dif: " + String(player_tx[tileIndex] - board_tx[0]));
	console.log("ty dif: " + String(player_ty[tileIndex] - board_ty[0]));
	 */
	checker = false;
	// parallel to board piece
	if(tileIndex !== null) {
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
						if (player_angZZ[tileIndex] === angleZ_board[j] || player_angZZ[tileIndex] === angZBoardAux) {
							// left of the board piece
							if (ends[i].includes("e")) {
								if (player_tx[tileIndex] - board_tx[j] > -2.5 /*-3*/ && player_tx[tileIndex] - board_tx[j] < -1.8/*3*/) {
									if (player_ty[tileIndex] - board_ty[j] > -0.4 && player_ty[tileIndex] - board_ty[j] < 0.4) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							// right of the board piece
							if (ends[i].includes("d")) {
								if (player_tx[tileIndex] - board_tx[j] < 2.5 /*-3*/ && player_tx[tileIndex] - board_tx[j] > 1.8/*3*/) {
									if (player_ty[tileIndex] - board_ty[j] > -0.4 && player_ty[tileIndex] - board_ty[j] < 0.4) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							//down of the board piece
							if (ends[i].includes("b")) {
								if (player_tx[tileIndex] - board_tx[j] > -0.4 /*-3*/ && player_tx[tileIndex] - board_tx[j] < 0.4/*3*/) {
									if (player_ty[tileIndex] - board_ty[j] > -2.5 && player_ty[tileIndex] - board_ty[j] < -1.8) {
										colorGreen();
										snapTileIndex = j;
									}
								}
							}
							// up of the board piece
							if (ends[i].includes("c")) {
								if (player_tx[tileIndex] - board_tx[j] > -0.4 /*-3*/ && player_tx[tileIndex] - board_tx[j] < 0.4/*3*/) {
									if (player_ty[tileIndex] - board_ty[j] < 2.5 && player_ty[tileIndex] - board_ty[j] > 1.8) {
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
							if (player_tx[tileIndex] - board_tx[j] > -1.9 /*-3*/ && player_tx[tileIndex] - board_tx[j] < -1.4 /*3*/) {
								if (player_ty[tileIndex] - board_ty[j] > -0.4 && player_ty[tileIndex] - board_ty[j] < 0.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// right of the board piece
						if (ends[i].includes("d")) {
							if (player_tx[tileIndex] - board_tx[j] < 1.9 /*-3*/ && player_tx[tileIndex] - board_tx[j] > 1.4/*3*/) {
								if (player_ty[tileIndex] - board_ty[j] > -0.4 && player_ty[tileIndex] - board_ty[j] < 0.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// down of the board piece
						if (ends[i].includes("b")) {
							if (player_tx[tileIndex] - board_tx[j] > -0.4 /*-3*/ && player_tx[tileIndex] - board_tx[j] < 0.4 /*3*/) {
								if (player_ty[tileIndex] - board_ty[j] > -1.9 && player_ty[tileIndex] - board_ty[j] < -1.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}
						// up of the board piece
						if (ends[i].includes("c")) {
							if (player_tx[tileIndex] - board_tx[j] > -0.4 /*-3*/ && player_tx[tileIndex] - board_tx[j] < 0.4/*3*/) {
								if (player_ty[tileIndex] - board_ty[j] < 1.9 && player_ty[tileIndex] - board_ty[j] > 1.4) {
									colorGreen();
									snapTileIndex = j;
								}
							}
						}

					}
				}
			}
		}
		// prependicular to board piece
        if (!playerTextures[tileIndex].image.src.includes("imgs/red")) {
            if (checker === false) {
                tile = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
                playerTextures[tileIndex].image.src = "imgs/red_" + tile;
				document.getElementById("snapTile").disabled = true;
				document.getElementById("snapTile").style.display = "none";

            }
        }
    } else {
    	if(document.getElementById("snapTile").disabled === false) {
			document.getElementById("snapTile").disabled = true;
			document.getElementById("snapTile").style.display = "none";
		}
	}

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
//  NEW --- Animation
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

		// Local rotations

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
		pc_sx *= valuePageUpOrDown;
		pc_sz = pc_sy = pc_sx;
	} else {
		if (currentlyPressedKeys[37]) {
			// Left cursor key
			if(tileIndex !== null) {
				player_tx[tileIndex] -= 0.05;
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
				player_tx[tileIndex] += 0.05;
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
				player_ty[tileIndex] += 0.05;
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

	// NEW --- Processing keyboard events

	handleKeys();

	drawScene();
	handlePlayerButtons();
	animate();
}

//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
    document.getElementById("deck_tile_number").innerHTML = deckLength;
    //console.log(playerTilesLength);
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ) {

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
				//document.getElementById("tz").hidden = true;
				break;
			case 1 :
				projectionType = 1;
				document.getElementById("near_ortho").hidden = true;
				document.getElementById("far_ortho").hidden = true;
				document.getElementById("fovy_persp").hidden = false;
				document.getElementById("aspect_persp").hidden = false;
				document.getElementById("near_persp").hidden = false;
				document.getElementById("far_persp").hidden = false;
				//document.getElementById("tz").hidden = false;
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

	document.getElementById("rotateDeck").onclick = function () {
		rotateDeck = !rotateDeck;
	};

	document.getElementById("tile1").onmousedown = function () {
		tileIndex = 0;
		selectPlayerTile();
		document.getElementById("tile1").style.backgroundColor = "#81F41B";
	};

	document.getElementById("tile1").onmouseup = function () {
		document.getElementById("tile1").style.backgroundColor = "#f4511e";
	};

	/*
	if(player_tx.length<7){
		document.getElementById("tile7").disabled = true;
	}
	 */

	document.getElementById("getTile").onclick = function () {
		if (deckLength !== 0) {
			let index = playerTextures.length;
			let random_tile = Math.floor(Math.random() * deckTextures.length);
			playerTextures[index] = deckTextures[random_tile];
			playerTiles[index] = deckTiles[random_tile];

			deckTextures.splice(random_tile, 1);
			deckTiles.splice(random_tile, 1);

			deckLength = deckTextures.length;
			playerTilesLength = playerTextures.length;
			document.getElementById("deck_tile_number").innerHTML = deckLength;

			player_tx[player_tx.length] = player_bottom_pos_x[playerTiles.length - 1];
			player_ty[player_ty.length] = player_bottom_pos_y[playerTiles.length - 1];
			if(projectionType === 0){

				player_tz[player_tz.length] = 0;
			} else {

				player_tz[player_tz.length] = -25;
			}

			player_tz_ortho[player_tz_ortho.length] = 0;
			player_tz_persp[player_tz_persp.length] = -25;
			console.log("otho: " + player_tz_ortho.length + "persp: "+ player_tz_persp.length);

			player_angX[player_angX.length] = 0;
			player_angYY[player_angYY.length] = 0;
			player_angZZ[player_angZZ.length] = 0;
			if (deckLength === 0) {
				document.getElementById("getTile").disabled = true;
				document.getElementById("getTile").style.display = "none";
			}
		}

	};


	document.getElementById("snapTile").onclick = function () {
		tile = playerTextures[tileIndex].image.src.split("imgs/green_")[1];
		facesPlayer = tile.replace(".png", "").split("_");
		tileBoard = boardTextures[snapTileIndex].image.src.split("imgs/")[1];
		facesBoard = tileBoard.replace(".png", "").split("_");
		//Paralelo
		if (player_angZZ[tileIndex] === 0 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if (facesPlayer[0] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"]);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"]);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 90 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if (facesPlayer[1] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"]);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"]);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 180 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if (facesPlayer[1] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"]);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"]);
				}
			}
		}
		else if (player_angZZ[tileIndex] === 270 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if (facesPlayer[0] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"]);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"]);
				}
			}
		}
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if (facesPlayer[0] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"]);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"]);
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if (facesPlayer[1] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"]);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"]);
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if (facesPlayer[1] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, 0, -2, "b", ["b"]);
				}
			}
			else{
				if (facesPlayer[0] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, 0, +2, "c", ["c"]);
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if (facesPlayer[0] === facesBoard[0]) {
					player_to_board(facesPlayer, facesBoard, -2, 0, "e", ["e"]);
				}
			}
			else{
				if (facesPlayer[1] === facesBoard[1]) {
					player_to_board(facesPlayer, facesBoard, +2, 0, "d", ["d"]);
				}
			}
		}
		//PERPENDICULAR +90
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["b","c"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["b","c"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["d","e"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["d","e"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["c","b"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["c","b"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["e","d"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["e","d"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"]);
					}
				}
			}
		}
		//PERPENDICULAR +180
		else if (player_angZZ[tileIndex]===0 && angleZ_board[snapTileIndex] === 270) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["b","c"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["b","c"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===90 && angleZ_board[snapTileIndex] === 0) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["d","e"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["d","e"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===180 && angleZ_board[snapTileIndex] === 90) {
			if(player_tx[tileIndex]-board_tx[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, -1.5, 0, "e", ["c","b"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -1.5, +0.5, "e", ["c"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -1.5, -0.5, "e", ["b"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, +1.5, 0, "d", ["c","b"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +1.5, +0.5, "d", ["c"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +1.5, -0.5, "d", ["b"]);
					}
				}
			}
		}
		else if (player_angZZ[tileIndex]===270 && angleZ_board[snapTileIndex] === 180) {
			if(player_ty[tileIndex]-board_ty[snapTileIndex]<0) {
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[0] || facesPlayer[1] === facesBoard[0]){
						player_to_board(facesPlayer, facesBoard, 0, -1.5, "b", ["e","d"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, -0.5, -1.5, "b", ["e"]);
					} else if (facesPlayer[1] === facesBoard[0]) {
						player_to_board(facesPlayer, facesBoard, +0.5, -1.5, "b", ["d"]);
					}
				}
			}
			else{
				if(facesPlayer[0]===facesPlayer[1]){
					if (facesPlayer[0] === facesBoard[1] || facesPlayer[1] === facesBoard[1]){
						player_to_board(facesPlayer, facesBoard, 0, +1.5, "c", ["e","d"]);
					}
				}
				else {
					if (facesPlayer[0] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, -0.5, +1.5, "c", ["e"]);
					} else if (facesPlayer[1] === facesBoard[1]) {
						player_to_board(facesPlayer, facesBoard, +0.5, +1.5, "c", ["d"]);
					}
				}
			}
		}
	}
}

function updateTileButtons(playerTilesLength) {
	for (let i = 2; i < playerTilesLength + 1; i++) {
		let elemId = "tile" + i;
		//console.log(elemId);
		document.getElementById(elemId).disabled = false;
		document.getElementById(elemId).onclick = function () {
			tileIndex = i - 1;
			selectPlayerTile();
		};
	}
}

function player_to_board(facesPlayer,facesBoard,tx,ty,rem,add){
	//deleteTileButton();
	addTextureToList(boardTextures,boardTextures.length,[playerTextures[tileIndex].image.src.split("imgs/green_")[1]]);
	board_tx[board_tx.length] = board_tx[snapTileIndex]+tx;
	board_ty[board_ty.length] = board_ty[snapTileIndex]+ty;
	board_tz[board_tz.length] = board_tz[snapTileIndex];
	changeTileToBoard("player");
	dicBoardKey = facesBoard[0] + "_" + facesBoard[1];
	dicPlayerKey = facesPlayer[0] + "_" + facesPlayer[1];
	if (ends[dicBoardKey].length === 1) {
		delete ends[dicBoardKey];
	} else {
		for(let k=0;k<ends[dicBoardKey].length;k++){
			if(ends[dicBoardKey][k]===rem) {
				ends[dicBoardKey].splice(k, 1);
			}
		}
	}
	ends[dicPlayerKey] = add;
	board_tz_ortho[board_tz_ortho.length] = board_tz_ortho[0];
	board_tz_persp[board_tz_persp.length] = board_tz_persp[0];
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
function changeTileToBoard(type) {
    if (type === "player"){
        angleX_board[angleX_board.length] = player_angX[tileIndex];
        angleY_board[angleY_board.length] = player_angYY[tileIndex];
        angleZ_board[angleZ_board.length] = player_angZZ[tileIndex];
        playerTextures.splice(tileIndex, 1);
        player_tx.splice(tileIndex, 1);
        player_ty.splice(tileIndex, 1);
        player_tz.splice(tileIndex, 1);
        deletefromTz(player_tz);
        addToTz(board_tz, board_tz.length, board_tz[0]);
        player_angX.splice(tileIndex,1);
        player_angYY.splice(tileIndex,1);
        player_angZZ.splice(tileIndex,1);
    } else if(type === "pc"){
        pcTextures.splice(tileIndex, 1);
        pc_tx.splice(tileIndex, 1);
        pc_ty.splice(tileIndex, 1);
        pc_tz.splice(tileIndex, 1);
        deletefromTz(player_tz);
        addToTz(board_tz, board_tz.length, board_tz[0]);
    }
    selectedTile = null;
    tileIndex = null;
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

function deleteTileButton() {
	let tile_name = playerTextures[tileIndex].image.src.split("imgs/green_")[1].split(".png")[0];
	//console.log(tile_name);
	let tile = tileIndex + 1;
	let elemId = "tile" +  tile;
	//console.log(elemId);
	if (document.getElementById(elemId).innerHTML === tile_name) {
		//console.log("yaaaaaayy");
		document.getElementById(elemId).disabled = true;
		//console.log(document.getElementById(elemId).disabled);
		document.getElementById(elemId).style.display = "none";
	}
}

function selectPlayerTile() {
	if(selectedTile !== tileIndex) {
		let tile = null;
		if (!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("red_")) {
			if(!playerTextures[tileIndex].image.src.split("imgs/")[1].includes("blue_")){
				tile = playerTextures[tileIndex].image.src.split("imgs/")[1];
				player_angX[tileIndex] = angleX_board[0];
				player_angYY[tileIndex] = angleY_board[0];
				player_angZZ[tileIndex] = angleZ_board[0];
				player_ty[tileIndex] = -3;
				player_tx[tileIndex] = 0;
				player_tz[tileIndex] = board_tz[0];
				addToTz(player_tz, tileIndex, board_tz[0]);
			} else {
				tile = playerTextures[tileIndex].image.src.split("imgs/blue_")[1];
			}
			bindImgToTexture(playerTextures, tileIndex, null);
			//console.log("imgs/red_" + tile);
			playerTextures[tileIndex].image.src = "imgs/red_" + tile;
		}

		if ( selectedTile !== null && playerTextures[selectedTile].image.src.split("imgs/")[1].includes("red_")) {
			tile = playerTextures[selectedTile].image.src.split("imgs/")[1].split("red_")[1];
			bindImgToTexture(playerTextures, selectedTile, null);
			//console.log("imgs/red_" + tile);
			playerTextures[selectedTile].image.src = "imgs/blue_" + tile;
		}

		selectedTile = tileIndex;
	}
    //console.log("tpx:"+player_tx[tileIndex],", tpy:"+player_ty[tileIndex],", angpz:"+player_angZZ[tileIndex]);
    //console.log("tbx:"+board_tx[0], ", tby:"+board_ty[tileIndex]);
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

function handlePlayerButtons() {
	for (let i = 2; i < playerTilesLength + 1; i++) {
		let elemId = "tile" + i;
		//console.log(elemId);
		document.getElementById(elemId).disabled = false;
		document.getElementById(elemId).onclick = function () {
			tileIndex = i - 1;
			selectPlayerTile();
		};
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



