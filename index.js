// Use webgl's shader language called GLSL ES 3.00
const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main () {
    
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
}`

const fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    // Just set the output to a constant redish-purple
    outColor = vec4(1, 0, 0.5, 1);
}`

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const gl = canvas.getContext('webgl2')
if (!gl) {
  throw new Error('WebGL2 is not supported on this device.')
}

function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    gl.deleteShader(shader)
    throw new Error(gl.getShaderInfoLog(shader))
  }
  return shader
}

function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    gl.deleteProgram(program)
    throw new Error(gl.getProgramInfoLog(program))
  }
  return program
}

function resize (canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth = canvas.clientWidth
  var displayHeight = canvas.clientHeight

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth ||
      canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

// Create shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

// Link shaders into program
const program = createProgram(gl, vertexShader, fragmentShader)

// Look up the location of the attribute of a_positionl
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const positionBuffer = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// Three 2d points
const positions = [
  0, 0,
  0, 0.5,
  0.7, 0
]

// Copies the data to the positionBuffer on the GPU
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

// Create a collection of attribute state called a Vertex Array Object
const vao = gl.createVertexArray()

// Make that the current vertex array
gl.bindVertexArray(vao)

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation)

// Specify how to pull the data out
const size = 2 // 2 components per iteration
const type = gl.FLOAT // the data is 32bits floats
const normalize = false // don't normalize the data
const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0 // start at the beginning of the buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

resize(gl.canvas)
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

// Clear the canvas
gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT)

// Tell it to use our program (pair of shaders)
gl.useProgram(program)

// Bind the attribute/buffer set we want
gl.bindVertexArray(vao)

// Execute our GLSL program
const primitiveType = gl.TRIANGLES
// const offset = 0
const count = 3
gl.drawArrays(primitiveType, offset, count)
