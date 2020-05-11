/**
 * @author Slayvin / http://slayvin.net
 */

import {
  Color,
  LinearEncoding,
  LinearFilter,
  MathUtils,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  RGBFormat,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
  Vector4,
  WebGLRenderTarget
} from "three";

import vertexShader from "../shaders/Reflector.vert";
import fragmentShader from "../shaders/Reflector.frag";

function mipmap(size, color) {

  var imageCanvas = document.createElement("canvas"),
    context = imageCanvas.getContext("2d");

  imageCanvas.width = imageCanvas.height = size;

  context.fillStyle = "#444";
  context.fillRect(0, 0, size, size);

  context.fillStyle = color;
  context.fillRect(0, 0, size / 2, size / 2);
  context.fillRect(size / 2, size / 2, size / 2, size / 2);
  return imageCanvas;

}

var Reflector = function (geometry, options) {

  Mesh.call(this, geometry);

  this.type = 'Reflector';

  var scope = this;

  options = options || {};

  var color = (options.color !== undefined) ? new Color(options.color) : new Color(0x7F7F7F);
  var textureWidth = options.textureWidth || 512;
  var textureHeight = options.textureHeight || 512;
  var clipBias = options.clipBias || 0;
  var shader = options.shader || Reflector.ReflectorShader;
  var recursion = options.recursion !== undefined ? options.recursion : 0;
  var encoding = options.encoding !== undefined ? options.encoding : LinearEncoding;

  //

  var reflectorPlane = new Plane();
  var normal = new Vector3();
  var reflectorWorldPosition = new Vector3();
  var cameraWorldPosition = new Vector3();
  var rotationMatrix = new Matrix4();
  var lookAtPosition = new Vector3(0, 0, - 1);
  var clipPlane = new Vector4();

  var view = new Vector3();
  var target = new Vector3();
  var q = new Vector4();

  var textureMatrix = new Matrix4();
  var virtualCamera = new PerspectiveCamera();

  var parameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat,
    stencilBuffer: false,
    encoding: encoding
  };

  var renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, parameters);

  if (!MathUtils.isPowerOfTwo(textureWidth) || !MathUtils.isPowerOfTwo(textureHeight)) {

    renderTarget.texture.generateMipmaps = false;

  }

  var material = new ShaderMaterial({
    uniforms: UniformsUtils.clone(shader.uniforms),
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    transparent: true
  });

  material.uniforms["tDiffuse"].value = renderTarget.texture;
  material.uniforms["color"].value = color;
  material.uniforms["textureMatrix"].value = textureMatrix;
  material.uniforms["map"].value = options.map;

  this.material = material;

  this.renderReflector = function (renderer, scene, camera) {

    if ('recursion' in camera.userData) {

      if (camera.userData.recursion === recursion) return;

      camera.userData.recursion++;

    }

    reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
    cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

    rotationMatrix.extractRotation(scope.matrixWorld);

    normal.set(0, 0, 1);
    normal.applyMatrix4(rotationMatrix);

    view.subVectors(reflectorWorldPosition, cameraWorldPosition);

    // Avoid rendering when reflector is facing away

    if (view.dot(normal) > 0) return;

    view.reflect(normal).negate();
    view.add(reflectorWorldPosition);

    rotationMatrix.extractRotation(camera.matrixWorld);

    lookAtPosition.set(0, 0, - 1);
    lookAtPosition.applyMatrix4(rotationMatrix);
    lookAtPosition.add(cameraWorldPosition);

    target.subVectors(reflectorWorldPosition, lookAtPosition);
    target.reflect(normal).negate();
    target.add(reflectorWorldPosition);

    virtualCamera.position.copy(view);
    virtualCamera.up.set(0, 1, 0);
    virtualCamera.up.applyMatrix4(rotationMatrix);
    virtualCamera.up.reflect(normal);
    virtualCamera.lookAt(target);

    virtualCamera.far = camera.far; // Used in WebGLBackground

    virtualCamera.updateMatrixWorld();
    virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

    virtualCamera.userData.recursion = 0;

    // Update the texture matrix
    textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    textureMatrix.multiply(virtualCamera.projectionMatrix);
    textureMatrix.multiply(virtualCamera.matrixWorldInverse);
    textureMatrix.multiply(scope.matrixWorld);

    // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
    // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
    reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

    clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);

    var projectionMatrix = virtualCamera.projectionMatrix;

    q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
    q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
    q.z = - 1.0;
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    // Calculate the scaled plane vector
    clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = clipPlane.x;
    projectionMatrix.elements[6] = clipPlane.y;
    projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
    projectionMatrix.elements[14] = clipPlane.w;

    // Render

    scope.visible = false;

    var currentRenderTarget = renderer.getRenderTarget();

    var currentXrEnabled = renderer.xr.enabled;
    var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

    renderer.xr.enabled = false; // Avoid camera modification and recursion
    renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

    renderer.setRenderTarget(renderTarget);

    renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

    if (renderer.autoClear === false) renderer.clear();
    renderer.render(scene, virtualCamera);

    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

    renderer.setRenderTarget(currentRenderTarget);

    // Restore viewport

    var viewport = camera.viewport;

    if (viewport !== undefined) {

      renderer.state.viewport(viewport);

    }

    scope.visible = true;

  };

  this.getRenderTarget = function () {

    return renderTarget;

  };

};

Reflector.prototype = Object.create(Mesh.prototype);
Reflector.prototype.constructor = Reflector;

Reflector.ReflectorShader = {

  uniforms: {

    'color': {
      value: null
    },

    'tDiffuse': {
      value: null
    },

    'map': {
      value: null
    },

    'textureMatrix': {
      value: null
    }

  },

  vertexShader,
  fragmentShader
};

export { Reflector };