var scene,
  camera,
  cloneCam,
  renderer,
  material,
  donut,
  sausageMaterial,
  hud,
  hudText,
  currentGame,
  element,
  container,
  effect,
  controls,
  clock;
var sausages = [];
var score = 0;
var health = 10;
var playRadius = 10;

//palette
var sunlight = new THREE.Color('rgb(255, 255, 102)');
var yellowText = new THREE.Color('rgb(255, 255, 0)');
var white = new THREE.Color('rgb(100,100,100)');
var orangeText = new THREE.Color('rgb(255, 102, 0)');

// math helpers
function randomDegree(){
  return Math.random() * 360;
}
function randomRadian(){
  return (randomDegree() * Math.PI) / 180;
}

  //matt d. lockyers's camera tracked vector
  //http://stackoverflow.com/questions/15696963/three-js-set-and-read-camera-look-vector
THREE.Utils = {
  cameraLookDir: function(camera) {
    var vector = new THREE.Vector3(0, 0, -1 * playRadius);
    vector.applyEuler(camera.rotation, camera.rotation.order);
    return vector;
  }
};

// device orientation controls
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

 // reorient donut and hud
  donut.position.x = THREE.Utils.cameraLookDir(camera).x;
  donut.position.z = THREE.Utils.cameraLookDir(camera).z;
  hud.position.x = THREE.Utils.cameraLookDir(camera).x * 10;
  hud.position.z = THREE.Utils.cameraLookDir(camera).z * 10;
  hud.lookAt(donut.position);

  for(var i = 0; i < sausages.length; i++){
    processSausage(sausages[i]);
  }
}

function hudChange(){
  hudText = 'score: ' + score + '   health: ' + health;
  hud.geometry = new THREE.TextGeometry(hudText, {size:7.5, height:1});
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
  cloneCam = camera.clone();
  cloneCam.position.x = -1;
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  renderer.setClearColor( sunlight, 0);
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  // init donut torus
  geometry = new THREE.TorusGeometry( 2.5, 0.75, 100, 100);
  var donutTexture = THREE.ImageUtils.loadTexture('textures/donut.jpg');
  donutTexture.anisotropy = renderer.getMaxAnisotropy();
  material = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: donutTexture
  });
  donut = new THREE.Mesh( geometry, material );
  donut.position.set(0,12.5,5);
  donut.rotation.x = -1;
  scene.add(donut);

  //sausage texture
  var sausageTexture = THREE.ImageUtils.loadTexture('textures/sausage.jpg');
  sausageTexture.anisotropy = renderer.getMaxAnisotropy();
  sausageMaterial = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: sausageTexture
  });

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

  // set lighting
  var light = new THREE.PointLight(boldYellow, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);
  var boldYellow = new THREE.Color('rgb(255, 255, 0)');
  var lightScene = new THREE.PointLight(white, 2, 100);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  //floor texture
  var floorTexture = THREE.ImageUtils.loadTexture('textures/plate.jpg');
  floorTexture.anisotropy = renderer.getMaxAnisotropy();
  var floorMaterial = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: floorTexture
  });
  var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // create HUD
  hudText = 'score: ' + score + '   health: ' + health;
  var textObj = new THREE.TextGeometry(hudText, {size:7.5, height:1});
  var hudMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  hud = new THREE.Mesh( textObj, hudMaterial );
  scene.add(hud);
  hud.position.set(0,37.5,25);

  //animate by clock
  clock = new THREE.Clock();
  animate();
}

function dropSausages(){
  var geometry = new THREE.CylinderGeometry(1, 1, 5, 24);
  var newSausage = new THREE.Mesh( geometry, sausageMaterial );
  var radian = randomRadian();
  newSausage.position.set(playRadius * Math.cos(radian), 37.5, playRadius * Math.sin(radian));
  sausages.push(newSausage);
  scene.add(newSausage);
}

function processSausage(sausage){
  sausage.position.y -= .1;
  if(sausage.position.y < -2.5){
    sausages.splice(sausages[sausage], 1);
    //scene.children.splice(scene.children.indexOf(sausage), 1);
    scene.remove(sausage);
    health -= 1;
    hudChange();
  }
  if(donut.position.distanceTo(sausage.position) < 4){
    sausages.splice(sausages[sausage], 1);
  //  scene.children.splice(scene.children.indexOf(sausage), 1);
    scene.remove(sausage);
    score += 1;
    hudChange();
  }
}

init();
currentGame = setInterval(dropSausages, 4000);
