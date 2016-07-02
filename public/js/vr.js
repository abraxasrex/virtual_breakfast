var scene,
  camera,
  renderer,
  material,
  donut,
  hud,
  element,
  container,
  effect,
  controls,
  clock;
var sausages = [];
var score = 0;

  //matt d. lockyers's camera tracked vector
  //http://stackoverflow.com/questions/15696963/three-js-set-and-read-camera-look-vector
THREE.Utils = {
  cameraLookDir: function(camera) {
    var vector = new THREE.Vector3(0, 0, -15);
    vector.applyEuler(camera.rotation, camera.rotation.order);
    return vector;
  }
};

// Our preferred controls via DeviceOrientation
function setOrientationControls(e) {
  if (!e.alpha) {
    return;
  }
  controls = new THREE.DeviceOrientationControls(camera, true);
  controls.connect();
  controls.update();

  element.addEventListener('click', fullscreen, false);
  window.removeEventListener('deviceorientation', setOrientationControls, true);
}

function animate() {
  requestAnimationFrame(animate);
  update(clock.getDelta());
  render(clock.getDelta());
  //move donut along circumference of vision

  // var radians = (camera.rotation.y * Math.PI) / 180;
//   donut.position.x = -10 * (Math.cos(radians));
//   donut.position.z = -10 * (Math.sin(radians));
  hud.geometry = new THREE.TextGeometry(score, {size:2.5, height:2.5});

  donut.position.x = THREE.Utils.cameraLookDir(camera).x;
  donut.position.z = THREE.Utils.cameraLookDir(camera).z;

  hud.position.x = THREE.Utils.cameraLookDir(camera).x;
  hud.position.z = THREE.Utils.cameraLookDir(camera).z;
  hud.lookAt(camera.position);
  moveSausages();
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();
  camera.updateProjectionMatrix();
  controls.update(dt);
}

function render() {
  effect.render(scene, camera);
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

function init() {
  // init scene and cam
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
  camera.position.set(0, 15, 0);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('webglviewer');
  container.appendChild(element);
  // init donut torus
  geometry = new THREE.TorusGeometry( 2.5, 0.25, 100, 100);
  material = new THREE.MeshNormalMaterial({ color: 0x0000ff });
  donut = new THREE.Mesh( geometry, material );
  donut.position.set(0,15,10);
  donut.rotation.x = -1;
  scene.add(donut);

  // stereo vision
  effect = new THREE.StereoEffect(renderer);

  // controls fallback
  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(
    camera.position.x + 0.15,
    camera.position.y,
    camera.position.z
  );
  controls.noPan = true;
  controls.noZoom = true;
  // add orientation controls
  window.addEventListener('deviceorientation', setOrientationControls, true);

  // Lighting
  var light = new THREE.PointLight(0xfca4c5, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);
  var lightScene = new THREE.PointLight(0x7658ef, 2, 100);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  //floor texture
  var floorTexture = THREE.ImageUtils.loadTexture('textures/wood.jpg');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat = new THREE.Vector2(50, 50);
  floorTexture.anisotropy = renderer.getMaxAnisotropy();
  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: floorTexture
  });
  var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
  var floor = new THREE.Mesh(geometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // create HUD
 var hudText = new THREE.TextGeometry(score, {size:2.5, height:2.5});
 var hudMaterial = new THREE.MeshNormalMaterial({ color: 0x0000ff });
 hud =  new THREE.Mesh( hudText, hudMaterial );
 hud.position.set(10, 25, 10);
 hud.rotateY(Math.PI * 1.9);
 scene.add(hud);

  //animate by clock
  clock = new THREE.Clock();
  animate();
}

function dropSausages(){
    var geometry = new THREE.CylinderGeometry(1, 1, 5, 8);
    var material = new THREE.MeshNormalMaterial({ color: 0x0000ff });
    var temp = new THREE.Mesh( geometry, material );
    temp.position.x = Math.random() * 75;
    temp.position.y = 50;
    temp.position.z = Math.random() * 75;
    sausages.push(temp);
    scene.add(temp);
}

function moveSausages(){
  for(var i = 0; i < sausages.length; i++){
    sausages[i].position.y -= .05;
  }
}

init();
setInterval(dropSausages, 2000);
