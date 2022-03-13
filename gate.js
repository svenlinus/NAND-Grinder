let gateFunctions = [];

class Gate {
  constructor(x, y, type, i) {
    this.pos = createVector(x, y);
    this.type = type;
    this.txt = type.toUpperCase();

    this.input = empty(gateConfig[type][0]);
    this.output = empty(gateConfig[type][1]);
    this.inputStates = empty(gateConfig[type][0]);
    this.outputStates = empty(gateConfig[type][1]);
    if(this.type == "in") this.f = "inputs[0]";
    if(gateOutputs[this.type]) this.outF = gateOutputs[this.type];
    this.inpF = [];

    this.width = textWidth(this.txt)+30;
    this.height = max(this.input.length, this.output.length)*30+4;
    this.side = this.type == "in" || this.type == "out";
    this.initNodes();
    this.on = false;
  }

  initNodes() {
    this.input = this.input.map( (inp, i) => {
      let input = this.input;
      let len = this.height/input.length * (input.length-1);
      let off = (this.height-len)/2;
      const inpNode = new Node(this.pos.x, this.pos.y + this.height/input.length * i + off, false);
      inpNode.parent = this;
      return inpNode;
    });
    this.output = this.output.map( (out, i) => {
      let output = this.output;
      let len = this.height/output.length * (output.length-1);
      let off = (this.height-len)/2;
      const outNode = new Node(this.pos.x+this.width, this.pos.y + this.height/output.length * i + off, false);
      outNode.parent = this;
      return outNode;
    });
  }

  preview() {
    if(this.type == "in") return;
    this.height = max(gateConfig[this.type][0], gateConfig[this.type][1])*30+4;
    textSize(30);
    this.txt = this.type.toUpperCase();
    this.width = textWidth(this.txt)+30;
    this.pos = mouse.copy().sub(this.width/2, this.height/2);
    push();
    translate(this.pos);
    noStroke();
    let clr = gateColors[this.type];
    fill(red(clr), green(clr), blue(clr), 100);
    rect(0, 0, this.width, this.height);
    fill(255, 100);
    text(this.txt, this.width/2, this.height/2);
    pop();
    if(mouseUp) {
      gates.push(new Gate(this.pos.x, this.pos.y, this.type));
      this.type = undefined;
    }
    if(rightMouseDown) this.type = undefined;
  }

  display(index) {
    this.index = index;
    if(this.type == "in") this.f = "inputs["+index+"]";
    if(this.type == "out") this.table = truthTables[level];
    let over = this.mouseIn();

    if(mouseUp) {
      this.drag = false;
      if(this.type == "in" && over) {this.on = !this.on; clickSound.play();}
    } 
    if(this.drag) this.move();

    textSize(30);
    push();
    translate(this.pos);
    noStroke();
    fill(gateColors[this.type]);
    if(!this.side) {
      this.width = textWidth(this.txt)+30;
      rect(0, 0, this.width, this.height);
      fill(255);
      text(this.txt, this.width/2, this.height/2);

      let gateOut = gateOutputs[this.type](this.inputStates);
      this.outputStates = gateOut instanceof Array ? [...gateOut] : [gateOut];

    } else {
      if(this.on) {
        for(let i = 3; i >= 0; i --) {
          fill(red(onColor), green(onColor), blue(onColor), i*5);
          let b = i*20;
          rect(-b, -b, this.width+b*2, this.height+b*2, 100);
        }
        fill(onColor);
      }
      this.width = 50;
      rect(0, 0, this.width, this.height, 10);
    }
    pop();

    push();
    let size = 0;
    if(this.type == "in") {size = 10;}
    let inNode = false;
    
    noStroke();
    this.input.forEach( (inp, i, input) => {
      let len = this.height/input.length * (input.length-1);
      let off = (this.height-len)/2;
      inp.pos.set(this.pos.x, this.pos.y + this.height/input.length * i + off);
      inp.size = 20+size;
      fill(0);
      circle(inp.pos.x, inp.pos.y, inp.size);

      this.inputStates[i] = inp.state;

      if(inp.mouseIn()) {
        if(currentWire) currentWire.mouseIn = true;
        if(mouseUp && inp.wire) {
          inp.wire.remove();
        }
        if(mouseUp && currentWire) {
          random(zaps).play();
          currentWire.p2 = inp;
          inp.output = currentWire.p1;
          inp.wire = currentWire;
          currentWire = null;
        }
        inNode = true;
      }
      if(inp.output) {
        if(inp.output.parent && inp.output.parent.f) this.inpF[i] = inp.output.parent.f;
        inp.state = inp.output.state;
      }
      else inp.state = false;
    });

    if(this.inpF.length > 0 && this.type != "out") this.f = getFuncStr(this.txt, this.inpF);
    if(this.inpF.length > 0 && this.type == "out") this.f = eval(getFuncStr(this.txt, this.inpF, true));


    this.output.forEach((out, i, output) => {
      let len = this.height/output.length * (output.length-1);
      let off = (this.height-len)/2;
      out.pos.set(this.pos.x+this.width+size, this.pos.y + this.height/output.length * i + off);
      out.size = 20+size;
      fill(0);
      circle(out.pos.x, out.pos.y, out.size);

      if(this.on) out.state = true;
      else if(!this.side) out.state = this.outputStates[i];
      else out.state = false;
      if(out.mouseIn()) {
        if(mouseDown) {
          currentWire = new Wire(out, mouse);
          out.wire = currentWire;
          wires.push(currentWire);
        } 
        if(currentWire) currentWire.mouseIn = true;
        inNode = true;
      }
    });
    pop();

    if(inNode) return;

    if(over) {
      if(mouseIsPressed && !this.side && !dragCheck(this)) this.drag = true;
      if(rightMouseDown && !this.side) this.remove();
      if(this.type == "out" && this.table) this.displayTable();
    }
    if((this.pos.x < width*0.1 || this.pos.x > width*0.9) && !this.side) this.remove();;
    
    if(this.type == "out" && !showDemo && this.on != this.inputStates[0]) {
      this.on = this.inputStates[0];
    }

  }

  displayTable() {  
    const config = levelConfig[level];
    let pos = this.pos.copy().add(-85, -50);//createVector(0, 0);
    push();
    translate(pos);
    strokeWeight(1);
    fill(0, 150);
    stroke(255);
    rect(-10, -11, 20+config[0]*20, 20+(this.table.length-1)*15);
        
    for(let row = 0; row < this.table.length; row ++) {
      for(let col = 0; col < this.table[row].length; col ++) {
        if(col >= config[0] && col != this.index) continue;
        fill(255);
        stroke(255);
        let xPos = col*20;
        if(col >= config[0]) {
          fill(onColor);
          stroke(onColor);
          xPos = config[0]*20;
        }
        textSize(15);
        text(this.table[row][col], xPos, row*15);
      }
    }
    pop();
  }

  remove() {
    this.output.forEach((out) => {
      if(out.wire && out.wire.p2) {
        if(out.wire.p2.output) out.wire.p2.output = undefined;
        if(out.wire.p2.wire) out.wire.p2.wire = undefined;
        out.wire.remove();
      }
    });
    this.input.forEach((inp) => {
      if(inp.wire) {
        const wire = inp.wire;
        wire.remove();
        inp.wire = undefined;
        inp.output = undefined;
        inp.state = false;
      }
    });
    gates.splice(this.index, 1);
  }

  mouseIn() {
    return mouse.x > this.pos.x && mouse.x < this.pos.x+this.width && mouse.y > this.pos.y && mouse.y < this.pos.y+this.height;
  }

  move() {
    const target = createVector(mouse.x-this.width/2, mouse.y-this.height/2);
    this.pos.lerp(target, 0.8);
    noStroke();
    fill(255, 50);
    let t = 12;
    rect(this.pos.x-t, this.pos.y-t, this.width+t*2, this.height+t*2);
  }
}

class Node {
  constructor(x, y, state, size) {
    this.parent = null;
    this.pos = createVector(x, y);
    this.state = state;
    this.size = size || 20;
    this.output = null;
    this.wire = null;
  }
  mouseIn() {
    this.r = this.size/2;
    return p5.Vector.sub(this.pos, mouse).magSq() < 15*15;
  }
}

class Wire {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.pos1 = p1.pos || p1;
    this.pos2 = p2.pos || p2;
    this.vertices = [this.pos1];
  }

  display(i) {
    // setup
    this.i = i;
    this.pos1 = this.p1.pos || this.p1;
    this.pos2 = this.p2.pos || this.p2;

    // graphic
    if(this.pos2 == mouse && this.vertices.length > 1) {
      strokeWeight(1);
      stroke(255, 20);
      line(mouse.x, 0, mouse.x, height);
      line(0, mouse.y, width, mouse.y);
    }
    stroke(0);
    if(this.p1.state) stroke(onColor);
    strokeWeight(4);
    if(this.vertices.length < 2) {
      line(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y);
    } else {
      this.vertices.forEach( (v, i, vertices) => {
        if(i == vertices.length-1) line(v.x, v.y, this.pos2.x, this.pos2.y);
        else {
          let pv = vertices[i+1];
          line(pv.x, pv.y, v.x, v.y);
        }
      });
    }

    // mouse events
    if(rightMouseDown && this.pos2 == mouse) this.vertices.push({x: mouse.x, y:mouse.y});

    if(mouseUp && !this.mouseIn && !this.p2.pos) this.remove();
    if(!this.pos1 || !this.pos2) this.remove();

    this.mouseIn = false;
  }

  remove() {
    const i = getIndex(wires, this);
    print(i);
    if(!isNaN(i) && wires[i] && wires[i].p2) {
      if(wires[i].p2.wire) wires[i].p2.wire = undefined;
      if(wires[i].p2.output) wires[i].p2.output = undefined;
      if(wires[i].p2.state) wires[i].p2.state = false;
    }
    if(!isNaN(i) && wires[i]) wires.splice(i, 1);
  }
}




const gateConfig = {
  'in' : [0, 1],
  'out': [1, 0],
  'and': [2, 1],
  'not': [1, 1],
  'nand': [2, 1],
  'or': [2, 1],
  'xor': [2, 1],
  'adder': [3, 2],
  '4bit adder': [8, 5],
}

const gateOutputs = {
  'out': (x) => {return x[0]},
  'and': AND,
  'not': NOT,
  'nand': NAND,
  'or': OR,
  'xor': XOR,
  'adder': SUM
}

function getFuncStr(type, inputs, newFunc) {
  const name = type.toUpperCase();
  let msg = "";

  if(newFunc) {
    msg = "(inputs) => {return "
  } else {
    msg = name+"([";
  }
  
  for(let i = 0; i < inputs.length; i ++) {
    msg += inputs[i];
    if(i < inputs.length-1) msg += ", ";
  }
  if(newFunc) msg += "};";
  else msg += "])";
  return msg;
};


function NOT(inputs) {return !inputs[0];}
function AND(inputs) {return (inputs[0] && inputs[1]);}
function NAND(inputs) {return !(inputs[0] && inputs[1]);}
function OR(inputs) {return (inputs[0] || inputs[1]);}
function XOR(inputs) {return (inputs[0] != inputs[1]);}
function SUM(inputs) {
  let sum = XOR([inputs[0], inputs[1]]);
  let o1 = XOR([sum, inputs[2]]) ? 1 : 0;
  let o2 = OR([AND([inputs[0], inputs[1]]), AND([sum, inputs[2]])]) ? 1 : 0;
  return [o1, o2];
}



function getIndex(arr, item) {
  let index = undefined;
  for(let i = 0; i < arr.length; i ++) {
    if(arr[i] == item) {
      index = i;
      break;
    }
  }
  return index;
}