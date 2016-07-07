var scene,
  camera,
  renderer,
  donut,
  enemyMaterial,
  hud,
  element,
  bigScreen1,
  bigScreen2,
  bigScreen3,
  bigScreen4,
  container,
  effect,
  controls,
  clock;
var enemies = [];
var score = 0;
var health = 5;
var playRadius = 10;
var enemyInterval = 4000;
var enemyDropRate = .1;
var level = 1;
var currentGame;
var donutHeight = 12.5;
var hudHeight = 37.5;
var gameOn = false;

//palette
var sunlight = new THREE.Color('rgb(255, 255, 102)');
var white = new THREE.Color('rgb(100,100,100)');
var orangeText = new THREE.Color('rgb(255, 102, 0)');
var boldYellow = new THREE.Color('rgb(255, 255, 0)');

// win / open screen
function tiltGameOn(e){
  if (!e.alpha) {
    return;
  }
  if(e.beta > 120){
    initPlayer();
    gameOn = true;
    currentGame = setInterval(dropEnemy, enemyInterval);
    window.removeEventListener('deviceorientation', tiltGameOn);
    scene.remove(bigScreen1);
    scene.remove(bigScreen2);
    scene.remove(bigScreen3);
  }
  //new game handler
  if(level > 1){
    score = 0;
    health = 10;
    playRadius = 10;
    enemyInterval = 4000;
    enemyDropRate = .1;
    level = 1;
    scene.remove(bigScreen4);
  }
}

function openScreen(){
  var screenGeometry1 = new THREE.TextGeometry('Virtua Breakfast', {size:1.8, height:0.1});
  var screenGeometry2 = new THREE.TextGeometry('Look around to move donut, catch falling food', {size:0.5, height:0.1});
  var screenGeometry3 = new THREE.TextGeometry('Look up to play', {size:1, height:0.1});
  var screenMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  bigScreen1 = new THREE.Mesh( screenGeometry1, screenMaterial );
  bigScreen2 = new THREE.Mesh( screenGeometry2, screenMaterial );
  bigScreen3 = new THREE.Mesh( screenGeometry3, screenMaterial );
  scene.add(bigScreen1);
  scene.add(bigScreen2);
  scene.add(bigScreen3);
  bigScreen1.position.set(10,17.5,10);
  bigScreen2.position.set(10,15,10);
  bigScreen3.position.set(10,10,10);
  bigScreen1.rotation.y = Math.PI;
  bigScreen2.rotation.y = Math.PI;
  bigScreen3.rotation.y = Math.PI;
  window.addEventListener('deviceorientation', tiltGameOn);
}

function loseGame(){
  window.clearInterval(currentGame);
  enemies.forEach(function(enemy){
    scene.remove(enemy);
  });
  enemies = [];
  scene.remove(hud);
  scene.remove(donut);
  var screenGeometry4 = new THREE.TextGeometry('Look up to play again.', {size:1.8, height:0.1});
  var screenMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  bigScreen4 = new THREE.Mesh( screenGeometry4, screenMaterial );
  scene.add(bigScreen4);
  bigScreen4.position.set(10,10,10);
  bigScreen4.rotation.y = Math.PI;
  window.addEventListener('deviceorientation', tiltGameOn);
}

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

 // reorient donut and hud to camera
  if(gameOn){
    donut.position.set(THREE.Utils.cameraLookDir(camera).x, donutHeight, THREE.Utils.cameraLookDir(camera).z);
    hud.position.set(THREE.Utils.cameraLookDir(camera).x * 10, hudHeight, THREE.Utils.cameraLookDir(camera).z * 10);
    hud.lookAt(donut.position);

    for(var i = 0; i < enemies.length; i++){
      handleEnemies(enemies[i]);
    }
  }

}

function createHudString(){
  return 'score: ' + score + '   hp: ' + health;
}

function hudChange(){
  hud.geometry = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
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

function initPlayer(){
  var donutGeometry = new THREE.TorusGeometry( 2.5, 0.75, 100, 100);
  var donutTexture = THREE.ImageUtils.loadTexture('textures/donut.jpg');
  var donutMaterial = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    wrapT: THREE.RepeatWrapping,
    wrapS:THREE.RepeatWrapping,
    map: donutTexture
  });
  donut = new THREE.Mesh( donutGeometry, donutMaterial );
  donut.position.set(0,12.5,5);
  donut.rotation.x = -1;
  scene.add(donut);

  var textObj = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
  var hudMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  hud = new THREE.Mesh( textObj, hudMaterial );
  scene.add(hud);
  hud.position.set(0,37.5,25);

}

function init() {
  // init scene and cam
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
  camera.position.set(0, 15, 0);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  renderer.setClearColor( sunlight, 0);
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  // init donut torus

  //enemy texture
  var enemyTexture = THREE.ImageUtils.loadTexture('textures/orange.jpg');
  enemyMaterial = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: enemyTexture
  });

  // stereo vision
  effect = new THREE.StereoEffect(renderer);

  // controls fallback
  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(camera.position.x + 0.15, camera.position.y, camera.position.z);
  controls.noPan = true;
  controls.noZoom = true;

  // add orientation controls
  window.addEventListener('deviceorientation', setOrientationControls, true);

  // set lighting
  var light = new THREE.PointLight(boldYellow, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);

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

  //animate by clock
  clock = new THREE.Clock();
  animate();
}

function dropEnemy(){
  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var newEnemy = new THREE.Mesh( geometry, enemyMaterial );
  var radian = randomRadian();
  newEnemy.position.set(playRadius * Math.cos(radian), 37.5, playRadius * Math.sin(radian));
  enemies.push(newEnemy);
  scene.add(newEnemy);
}

function winLevel(){
  var parsed = parseInt(level) + 1;
  var hudText = 'level ' + parsed;
  hud.geometry = new THREE.TextGeometry(hudText, {size:7.5, height:1});
  level += 1;

  window.clearInterval(currentGame);
  enemies.forEach(function(enemy){
    scene.remove(enemy);
  });
  enemies = [];
  setTimeout(nextLevel, 2000);
}

function nextLevel(){
  enemyInterval = enemyInterval / 1.5;
  enemyDropRate += 0.025;
  health = 10;
  hud.geometry = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
  currentGame = setInterval(dropEnemy, enemyInterval);
}

function handleEnemies(enemy){
  if(score >= (5 * level)){
    winLevel();
    return;
  }
  if(health < 0){
    loseGame();
  }
  enemy.position.y -= enemyDropRate;
  if(enemy.position.y < -2.5){
    enemies.splice(enemies[enemy], 1);
    scene.remove(enemy);
    health -= 1;
    hudChange();
  }
  if(donut.position.distanceTo(enemy.position) < 2){
    enemies.splice(enemies[enemy], 1);
    scene.remove(enemy);
    score += 1;
    hudChange();
  }
}

init();
openScreen();
