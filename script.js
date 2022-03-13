let and, gateColors, mouse, onColor, checkButton, bx, by, popSound, zaps, clickSound, prevGate;

let mouseUp = false;
let mouseDown = false;
let rightMouseDown = false;

let gates = [];
let wires = [];
let gateButtons = [];
let keys = [];
let keyUp = [];

let currentWire = null;
let showTitle = true;
let titleAlpha = 0;


function preload() {
  soundFormats("mp3", "ogg");
  popSound = loadSound("sounds/pop.mp3");
  zaps = [loadSound("sounds/zap.mp3")];
  clickSound = loadSound("sounds/click.mp3");
}

function setup() {
  textAlign(CENTER, CENTER);
  createCanvas(windowWidth, windowHeight);
  bx = width*0.15;
  by = width*0.05;

  gateButtons = [
    new Button(50, height-width*0.05-40, "AND"),
    new Button(50, height-width*0.05-40, "NOT"),
    new Button(50, height-width*0.05-40, "NAND"),
    new Button(50, height-width*0.05-40, "OR"),
    new Button(50, height-width*0.05-40, "XOR"),
    new Button(50, height-width*0.05-40, "ADDER"),
  ];
  
  checkButton = new Button(width-bx, height-width*0.05-40, "check");
  checkButton.on = checkAnswer;
  checkButton.pos.x -= checkButton.width;

  demoButton = new Button(width-bx, height-width*0.05-81, "demo");
  demoButton.on = () => {showDemo = !showDemo;}
  demoButton.pos.x -= demoButton.width;

  mouse = createVector(mouseX, mouseY);
  prevGate = new Gate(mouse.x, mouse.y, "in");

  gateColors = {
    'in': color(100, 100, 100),
    'out': color(100, 100, 100),
    'and': color(102, 78, 167),
    'not': color(204, 2, 2),
    'nand': color(230, 146, 56),
    'or': color(105, 168, 79),
    'xor': color(241, 194, 49),
    'adder': color(69, 130, 141),
    '4bit adder': color(62, 132, 198),
  }

  onColor = color(255, 23, 62);
  levelSetup();

  document.oncontextmenu = () => {
    rightMouseDown = true;
    return false;
  }
  
}

function draw() {
  mouse.set(mouseX, mouseY);
  background(43);
  strokeWeight(2);
  stroke(100);
  fill(40);
  rect(bx-3, by-3, width-bx*2+6, height-by*2+6);
  wires.forEach( (wire, i) => {
    if(!showDemo) wire.display(i);
  });
  gates.forEach( (gate, i) => {
    if((gate.type == "in" || gate.type == "out") || !showDemo) gate.display(i);
  });
  let x = bx;
  let buttonsShown = 2+currentLevel;
  if(currentLevel >= 4) buttonsShown --;
  for(let i = 0; i < buttonsShown && !showDemo; i ++) {
    let button = gateButtons[i];
    button.off = button.resetOff;
    button.pos.x = x;
    x += button.width+1;
    button.display();
  }
  

  demoButton.display();
  if(currentLevel < 5) checkButton.display();


  confetti.forEach( (c, i) => {
    c.display();
    if(c.pos.y > height+5) confetti.splice(i, 1);
  });

  if(level == "Addition") showDecimal();
  if(showDemo && frameCount % 120 == 0 && currentLevel < 5) demo(demoRow);

  if(keyUp[keyCode] && !isNaN(key)) {
    const types = Object.keys(gateColors).slice(2, 2+buttonsShown);
    prevGate.type = types[parseInt(key)-1];
  }
  if(prevGate.type && prevGate.type != "in") {
    cursor("none");
    prevGate.preview();
  } else cursor(ARROW);


  if(showTitle) titleAlpha = lerp(titleAlpha, 255, 0.05);
  else titleAlpha = lerp(titleAlpha, 0, 0.3);
  fill(255, titleAlpha);
  textSize(50);
  noStroke();
  text(level, width/2, by+textDescent()+textAscent());


  if(mouse.x < bx || mouse.x > width-bx) showTitle = true;

  mouseUp = false;
  mouseDown = false;
  rightMouseDown = false;
  keyUp = [];
}

function mouseClicked() {
  if(mouseButton == LEFT) mouseUp = true;
}

function mousePressed() {
  if(mouseButton == LEFT) mouseDown = true;
  showTitle = false;
}

function keyPressed() {
  keys[keyCode] = true;
  if(keyCode == 190) {
    currentLevel ++;
    levelSetup();
  } if(keyCode == 188) {
    currentLevel --;
    levelSetup();
  }
}

function keyReleased() {
  keys[keyCode] = false;
  keyUp[keyCode] = true;
}

function empty(len) {
  return new Array(len).fill(false);
}

function dragCheck(that) {
  let dragging = false;
  for(let gate of gates) {
    if(gate == that) continue;
    if(gate.drag) dragging = true;
  }
  return dragging;
}
