var donut = document.getElementById('donut');

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

for(var i = 0; i < 10; i++){
  var green = document.createElement('div');
  green.classList.add('sprinkle');
  green.style.top = getRandomIntInclusive(-75, 25) + '%';
  green.style.left = getRandomIntInclusive(0, 75) + '%';
  donut.appendChild(green);

  var purple = document.createElement('div');
  purple.classList.add('sprinkle');
  purple.style.top = getRandomIntInclusive(-75, 25) + '%';
  purple.style.left = getRandomIntInclusive(0, 75) + '%';
  purple.style.backgroundColor = '#640963';
  donut.appendChild(purple);

}
