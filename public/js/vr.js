// the boilerplate for this project is based on Patrick Catanzariti's
// VR tutorial: https://www.sitepoint.com/bringing-vr-to-web-google-cardboard-three-js/
//which is likely based upon the three.js boilerplate specified in the WebVR API protocols

var element, container;
var scene, renderer, light, lightScene, effect, controls, clock;
var camera, floor, donut, hud;
var sunlight, white, orangeText;
var enemyTexture, donutTexture, floorTexture;
var enemyMaterial, floorMaterial, screenMaterial, donutMaterial;
var gameTracker = {
  score: 0,
  health: 10,
  playRadius: 10,
  enemies: [],
  boards:[],
  enemyInterval: 4000,
  enemyDropRate: 0.1,
  level: 1,
  currentGame: null,
  donutHeight: 12.5,
  hudHeight: 37.5,
  gameInProgress: false,
  gameStatus:'unplayed',
  stereo:true
};

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
    updateEnemies();
    updateGameStatus();
  }
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if(!!gameTracker.stereo){
    effect.setSize(width, height);
  }
}

function update(dt) {
  resize();
  camera.updateProjectionMatrix();
  controls.update(dt);
}

function render() {
  if(!!gameTracker.stereo){
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

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

  //check if cardboard
  if(!!gameTracker.stereo){
    effect = new THREE.StereoEffect(renderer);
  }

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

  enemyTexture = THREE.ImageUtils.loadTexture('./textures/orange.jpg');
  donutTexture = THREE.ImageUtils.loadTexture('./textures/donut2.jpg');
  // donut texture from doki-edits
  //http://doki-edits.deviantart.com/art/Kawaii-Donut-Texture-526017845
  floorTexture = THREE.ImageUtils.loadTexture('./textures/table2.jpg');

  screenMaterial = new THREE.MeshBasicMaterial({ color: orangeText });
  enemyMaterial = new THREE.MeshLambertMaterial({
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

  light = new THREE.PointLight(sunlight, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);

  lightScene = new THREE.AmbientLight(white, 200);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  floorTexture.anisotropy = renderer.getMaxAnisotropy();
  floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  clock = new THREE.Clock();
  animate();
  openScreen(20, 'Virtua Breakfast', 3, true);
  openScreen(17.5, 'Rotate to catch falling oranges', 1.5, true);
  openScreen(15, 'Moving the donut in a circle aroud you', 1.5, true);
  openScreen(12.5, 'Look up to Begin', 1, true);
  window.addEventListener('deviceorientation', tiltGameOn);
}

function initPlayer(){
  var donutGeometry = new THREE.TorusGeometry( 2.5, 0.75, 100, 100);
  donut = new THREE.Mesh( donutGeometry, donutMaterial );
  donut.position.set(0,12.5,5);
  donut.rotation.x = 1;
  scene.add(donut);
  var newHudText = new THREE.TextGeometry(createHudString(), {size:7.5, height:1});
  hud = new THREE.Mesh( newHudText, screenMaterial );
  scene.add(hud);
  hud.position.set(0,37.5,25);
  gameTracker.gameInProgress = true;
}
function tiltGameOn(e){
  if (!e.alpha){
    return;
  }
// uncomment the line below for desktop browser testing, then pass an e object with high beta to begin
//if(e.beta > 160){
  if(THREE.Utils.cameraLookDir(camera).y > 8){
    if(gameTracker.score > 1 && gameTracker.health > 0) {
      levelUpStats();
    } else {
      resetStats();
    }
    gameTracker.boards.forEach(function(screen){
      scene.remove(screen);
    });
    gameTracker.boards = [];
    initPlayer();
    gameTracker.gameInProgress = true;
    gameTracker.currentGame = setInterval(dropEnemy, gameTracker.enemyInterval);
    window.removeEventListener('deviceorientation', tiltGameOn);
  }
}

function openScreen(yPos, text, size, init){
  var screenGeometry = new THREE.TextGeometry(text, {size: size, height:0.1});
  var newScreen = new THREE.Mesh( screenGeometry, screenMaterial );

  if(!!init){
    var pos_set = new THREE.Vector3(7.5,0,15);
    camera.lookAt(pos_set);
    newScreen.position.set(pos_set.x, yPos, pos_set.z);
    newScreen.lookAt(new THREE.Vector3(camera.position.x + 7.5, camera.position.y, camera.position.z));
  } else {
    newScreen.position.set(THREE.Utils.cameraLookDir(camera).x, yPos, THREE.Utils.cameraLookDir(camera).z);
    newScreen.lookAt(camera.position);
  }
  scene.add(newScreen);
  gameTracker.boards.push(newScreen);
}

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
  gameTracker.enemyInterval = 4000;
  gameTracker.enemyDropRate = .1;
  gameTracker.level = 1;
}

function levelUpStats(){
  gameTracker.enemyInterval = gameTracker.enemyInterval / 1.25;
  gameTracker.enemyDropRate += 0.01;
  gameTracker.health = 10;
  gameTracker.level += 1;
}

function clearField(){
  gameTracker.gameInProgress = false;
  window.clearInterval(gameTracker.currentGame);
  gameTracker.enemies.forEach(function(enemy){
    removeEnemy(enemy);
  });
  gameTracker.enemies = [];
  scene.remove(hud);
  scene.remove(donut);
}

function winLevel(){
  clearField();
  var parsed = parseInt(gameTracker.level) + 1;
  var levelText = 'level ' + parsed;
  openScreen(15, levelText, 1);
  openScreen(10, 'Look up to play', 1);
  setTimeout(function(){
    window.addEventListener('deviceorientation', tiltGameOn);
  }, 1500);
}

function loseGame(){
  clearField();
  openScreen(10, 'Look up to play again.', 1);
  openScreen(15, 'You lost! Final score: ' + gameTracker.score, 1);
  setTimeout(function(){
    window.addEventListener('deviceorientation', tiltGameOn);
  }, 1500);
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

function updateEnemies(){
  gameTracker.enemies.forEach(function(enemy){
    enemy.position.y -= gameTracker.enemyDropRate;
    if(enemy.position.y < 0){
      gameTracker.health -= 1;
      removeEnemy(enemy);
    }
    if(donut.position.distanceTo(enemy.position) < 2.5){
      gameTracker.score += 1;
      removeEnemy(enemy);
    }
  });
}

function updateGameStatus(){
  if(gameTracker.score >= (5 * gameTracker.level)){
    winLevel();
    return;
  }
  if(gameTracker.health < 0){
    loseGame();
    return;
  }
}

function cleanRogueSpheres(){
  scene.children.forEach(function(child){
    if((child.geometry && child.geometry.type === 'SphereGeometry') && gameTracker.enemies.indexOf(child) === -1){
      scene.remove(child);
    }
  });
}

(function checkStereo(){
  if(window.location.search === "?no_stereo"){
    gameTracker.stereo = false;
  }
})();

initWorld();
setInterval(cleanRogueSpheres, 2000);

// Ioulian Alexeev's screen sleep prevention:
//http://stackoverflow.com/questions/18905413/how-can-i-prevent-iphone-including-ios-7-from-going-to-sleep-in-html-or-js
setInterval(function () {
  window.location.href = "/new/page";
  window.setTimeout(function () {
    window.stop();
  }, 0);
}, 30000);
