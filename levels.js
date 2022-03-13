const levelConfig = {
  "NAND": [2, 1],
  "OR": [2, 1],
  "XOR": [2, 1],
  "Sum and Carry": [2, 2],
  "Sum and Carry 2": [3, 2],
  "Addition": [8, 5]
};  // [inputNum, outputNum] for each level

const levelNames = ["NAND", "OR", "XOR", "Sum and Carry", "Sum and Carry 2", "Addition"];
let currentLevel = 0;
let level = levelNames[currentLevel];

function levelSetup(lvl) {
  gates = [];
  wires = [];
  level = levelNames[currentLevel];
  titleAlpha = 0;
  showTitle = true;
  demoButton.pos.y = height-width*0.05-81;
  const config = levelConfig[lvl || level];
  let space = config[0] < 6 ? 80 : 480/config[0];
  let start = height/2-(space*config[0]/2)-25;
  for(let i = 0; i < config[0]; i ++) {
    gates.push(new Gate(width*0.15-30, i*space+start, "in"));
  }

  space = config[0] < 6 ? 80 : 480/config[1];
  start = height/2-(space*config[1]/2)-25;
  for(let i = 0; i < config[1]; i ++) {
    gates.push(new Gate(width*0.85-30, i*space+start, "out"));
  }
}

let showDemo = false;
let demoRow = 0;
function demo(index) {
  const config = levelConfig[level];
  const inputs = gates.slice(0, config[0]);
  const outputs = gates.slice(config[0], config[0]+config[1]);
  const table = truthTables[level];

  const i = index % table.length;

  if(table[0].length != outputs.length+inputs.length) {
    console.error("table does not match input/output");
    return false
  }
  
  for(let j = 0; j < inputs.length; j ++) {
    if(inputs[j].on != table[i][j] == 1) clickSound.play();
    inputs[j].on = table[i][j] == 1;
  }
  const tableInputs = table[i].map( (t, index) => {
    if(index < inputs.length) return t; 
  });
  for(let j = 0; j < outputs.length; j ++) {
    outputs[j].on = table[i][config[0]+j];
  }
  demoRow ++;
}

function checkAnswer(button) {
  const config = levelConfig[level];
  const inputs = gates.slice(0, config[0]);
  const outputs = gates.slice(config[0], config[0]+config[1]);
  const table = truthTables[level];
  if(table[0].length != outputs.length+inputs.length) {
    console.error("table does not match input/output");
    return false
  }
  let correct = true;
  if(!outputs[0].f) return false;

  for(let i = 0; i < table.length; i ++) {
    if(!correct) break;
    const tableInputs = table[i].map( (t, index) => {
      if(index < inputs.length) return t; 
    });
    for(let j = 0; j < outputs.length; j ++) {
      if(!correct) break;
      if(!outputs[j].f) {correct = false; break;}
      if(outputs[j].f(tableInputs) != table[i][inputs.length+j]) correct = false;
    }
  }

  print(correct);
  if(correct) {
    popSound.play();
    for(let i = 0; i < 30; i ++) {
      confetti.push(new Confetti(mouse));
    }
    currentLevel ++;
    levelSetup();
  }
  return correct;
}


function showDecimal() {
  let sum = 0;
  for(let t = 0; t < 2; t ++) {
    let numPosY = height/2-160 + 240*t;
    const numPosX = width*0.15-80;
    let bits = [];
    for(let i = t*4; i < t*4+4; i ++) {
      bits.push(gates[i].on ? 1 : 0);
    }
    let decimal = 8*bits[3] + 4*bits[2] + 2*bits[1] + bits[0];
    sum += decimal;
    fill(255);
    noStroke();
    textSize(30);
    text(decimal, numPosX, numPosY);
  }


  let numPosY = height/2-55;
  const numPosX = width*0.85+80;
  let bits = [];
  let bin = sum.toString(2);
  while(bin.length < 5) {bin = "0" + bin;}

  for(let i = 8; i < 13; i ++) {
    let j = 4-(i-8);
    if(showDemo) gates[i].on = bin[j] == 1;
    bits.push(gates[i].on ? 1 : 0);
  }
  let decimal = 16*bits[4] + 8*bits[3] + 4*bits[2] + 2*bits[1] + bits[0];
  fill(255);
  noStroke();
  textSize(30);
  text(decimal, numPosX, numPosY);
  demoButton.pos.y = height-by-demoButton.height;
}



let truthTables = {
  "NAND": [
    [0, 0, 1], 
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0]
  ],
  "OR": [
    [0, 0, 0], 
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1]
  ],
  "XOR": [
    [0, 0, 0], 
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0]
  ],
  "Sum and Carry": [
    [0, 0, 0, 0],
    [1, 0, 1, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 1],
  ],
  "Sum and Carry 2": [
    [0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1],
  ]
};