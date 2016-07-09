var element, container;
var scene, renderer, light, lightScene, effect, controls, clock;
var camera, floor, donut, hud;
var sunlight, white, orangeText, boldYellow;
var enemyTexture, donutTexture, floorTexture;
var enemyMaterial, floorMaterial, screenMaterial, donutMaterial;
var gameTracker = {
  score: 0,
  health: 5,
  playRadius: 10,
  enemies: [],
  enemyInterval: 4000,
  enemyDropRate: 0.1,
  level: 1,
  currentGame: null,
  donutHeight: 12.5,
  hudHeight: 37.5,
  gameInProgress: false
};

var menus = {
  title: {},
  play_instructions:{},
  start_instructions:{},
  replay:{}
};

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
    var vector = new THREE.Vector3(0, 0, -1 * gameTracker.playRadius);
    vector.applyEuler(camera.rotation, camera.rotation.order);
    return vector;
  }
};

function loadTexture(loader, texture, global_texture){
  loader.load(texture,
      function (texture, global_texture){
        global_texture = texture;
      });
}

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

  if(gameTracker.gameInProgress){
    donut.position.set(THREE.Utils.cameraLookDir(camera).x, gameTracker.donutHeight, THREE.Utils.cameraLookDir(camera).z);
    hud.position.set(THREE.Utils.cameraLookDir(camera).x * 10, gameTracker.hudHeight, THREE.Utils.cameraLookDir(camera).z * 10);
    hud.lookAt(donut.position);
    for(var i = 0; i < gameTracker.enemies.length; i++){
      handleEnemies(gameTracker.enemies[i]);
    }
  }
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

function initWorld() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
  camera.position.set(0, 15, 0);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  renderer.setClearColor( sunlight, 0);
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  // controls fallback
  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(camera.position.x + 0.15, camera.position.y, camera.position.z);
  controls.noPan = true;
  controls.noZoom = true;

  window.addEventListener('deviceorientation', setOrientationControls, true);

  sunlight = new THREE.Color('rgb(255, 255, 102)');
  white = new THREE.Color('rgb(100,100,100)');
  orangeText = new THREE.Color('rgb(255, 102, 0)');
  boldYellow = new THREE.Color('rgb(255, 255, 0)');

  // var loader = new THREE.TextureLoader();
  // loader.crossOrigin = '';
  // loadTexture(loader,'../textures/orange.jpg', enemyTexture);
  // loadTexture(loader,'../textures/donut.jpg', donutTexture);
  // loadTexture(loader, '../textures/plate.jpg', floorTexture);
  //THREE.ImageUtils.crossOrigin = '';
  enemyTexture = THREE.ImageUtils.loadTexture('./textures/orange.jpg');
  donutTexture = THREE.ImageUtils.loadTexture('./textures/donut.jpg');
  floorTexture = THREE.ImageUtils.loadTexture('./textures/plate.jpg');

  screenMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  enemyMaterial = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: enemyTexture
  });
  floorMaterial = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    map: floorTexture
  });
  donutMaterial = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    wrapT: THREE.RepeatWrapping,
    wrapS:THREE.RepeatWrapping,
    map: donutTexture
  });

  light = new THREE.PointLight(boldYellow, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);

  lightScene = new THREE.PointLight(white, 2, 100);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  floorTexture.anisotropy = renderer.getMaxAnisotropy();
  floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  clock = new THREE.Clock();
  animate();
  openScreen();
}

function initPlayer(){
  var donutGeometry = new THREE.TorusGeometry( 2.5, 0.75, 100, 100);
  donut = new THREE.Mesh( donutGeometry, donutMaterial );
  donut.position.set(0,12.5,5);
  donut.rotation.x = -1;
  scene.add(donut);

  var newHudText = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
  hud = new THREE.Mesh( newHudText, screenMaterial );
  scene.add(hud);
  hud.position.set(0,37.5,25);
  gameTracker.gameInProgress = true;
}

function tiltGameOn(e){
  if (!e.alpha) {
    return;
  }
  if(e.beta > 160){
    if(gameTracker.health < 5){
      resetStats();
    }
    initPlayer();
    gameTracker.currentGame = setInterval(dropEnemy, gameTracker.enemyInterval);
    scene.remove(menus.title);
    scene.remove(menus.play_instructions);
    scene.remove(menus.start_instructions);
    window.removeEventListener('deviceorientation', tiltGameOn);
  }
}

function openScreen(){
  var screenGeometry1 = new THREE.TextGeometry('Virtua Breakfast', {size:1.8, height:0.1});
  var screenGeometry2 = new THREE.TextGeometry('Look around to move donut, catch falling food', {size:0.5, height:0.1});
  var screenGeometry3 = new THREE.TextGeometry('Look up to play', {size:1, height:0.1});
  menus.title = new THREE.Mesh( screenGeometry1, screenMaterial );
  menus.play_instructions = new THREE.Mesh( screenGeometry2, screenMaterial );
  menus.start_instructions = new THREE.Mesh( screenGeometry3, screenMaterial );
  scene.add(menus.title);
  scene.add(menus.play_instructions);
  scene.add(menus.start_instructions);
  menus.title.position.set(10,17.5,10);
  menus.play_instructions.position.set(10,15,10);
  menus.start_instructions.position.set(10,10,10);
  menus.title.rotation.y = Math.PI;
  menus.play_instructions.rotation.y = Math.PI;
  menus.start_instructions.rotation.y = Math.PI;
  window.addEventListener('deviceorientation', tiltGameOn);
}

// gameplay
function dropEnemy(){
  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var newEnemy = new THREE.Mesh( geometry, enemyMaterial );
  var radian = randomRadian();
  newEnemy.position.set(gameTracker.playRadius * Math.cos(radian), 37.5, gameTracker.playRadius * Math.sin(radian));
  gameTracker.enemies.push(newEnemy);
  scene.add(newEnemy);
}

function resetStats(){
  gameTracker.score = 0;
  gameTracker.health = 10;
  gameTracker.playRadius = 10;
  gameTracker.enemyInterval = 4000;
  gameTracker.enemyDropRate = .1;
  gameTracker.level = 1;
  scene.remove(menus.replay);
}

function winLevel(){
  window.clearInterval(gameTracker.currentGame);
  var parsed = parseInt(gameTracker.level) + 1;
  var newHudText = 'level ' + parsed;
  hud.geometry = new THREE.TextGeometry(newHudText, {size:7.5, height:1});
  gameTracker.level += 1;
  gameTracker.enemies.forEach(function(enemy){
    scene.remove(enemy);
  });
  gameTracker.enemies = [];
  setTimeout(nextLevel, 2000);
}

function loseGame(){
  window.clearInterval(gameTracker.currentGame);
  gameTracker.enemies.forEach(function(enemy){
    scene.remove(enemy);
  });
  gameTracker.enemies = [];
  scene.remove(hud);
  scene.remove(donut);
  var replay_geometry = new THREE.TextGeometry('Look up to play again.', {size:1.8, height:0.1});
  menus.replay = new THREE.Mesh( replay_geometry, screenMaterial );
  scene.add(menus.replay);
  menus.replay.position.set(10,10,10);
  menus.replay.rotation.y = Math.PI;
  window.addEventListener('deviceorientation', tiltGameOn);
}

function nextLevel(){
  gameTracker.enemyInterval = gameTracker.enemyInterval / 1.5;
  gameTracker.enemyDropRate += 0.025;
  gameTracker.health = 10;
  updateHud();
  gameTracker.currentGame = setInterval(dropEnemy, gameTracker.enemyInterval);
}

function createHudString(){
  return 'score: ' + gameTracker.score + '   hp: ' + gameTracker.health;
}

function updateHud(){
  hud.geometry = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
}

function removeEnemy(enemy){
  gameTracker.enemies.splice(gameTracker.enemies[enemy], 1);
  scene.remove(enemy);
  updateHud();
}

function handleEnemies(enemy){
  if(gameTracker.score >= (5 * gameTracker.level)){
    winLevel();
    return;
  }
  if(gameTracker.health < 0){
    loseGame();
    return;
  }
  enemy.position.y -= gameTracker.enemyDropRate;
  if(enemy.position.y < -2.5){
    gameTracker.health -= 1;
    removeEnemy(enemy);
  }
  if(donut.position.distanceTo(enemy.position) < 2.5){
    gameTracker.score += 1;
    removeEnemy(enemy);
  }
}

initWorld();
