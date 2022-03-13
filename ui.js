class Button {
  constructor(x, y, txt, on, off) {
    this.pos = createVector(x, y);
    this.txt = txt;
    this.type = this.txt.toLowerCase();
    textSize(20);
    this.width = textWidth(this.txt)+16;
    this.height = 40;
    this.clr = 80;
    this.offset = 0;
    this.on = on || this.addGates;
    this.off = off || false;
  }

  addGates() {
    if(this.offset == 0) this.offset = gateConfig[this.type][0]*30+6;
    let newGate = new Gate(this.pos.x, this.pos.y-this.offset, this.type);
    gates.push(newGate);
    this.offset += gateConfig[this.type][0]*30+6;
  }

  resetOff() {this.offset = gateConfig[this.type][0]*30+6;}

  update() {
    if(this.mouseOver()) {
      this.clr = lerp(this.clr, 180, 0.1);
      if(mouseDown) {
        this.on(this);
      }
    }
    else {
      this.clr = lerp(this.clr, 80, 0.1);
      if(this.off) this.off();
    }
  }

  display() {
    this.update();
    textSize(20);
    this.width = textWidth(this.txt)+16;
    push();
    translate(this.pos);
    noStroke();
    fill(this.clr);
    rect(0, 0, this.width, this.height);
    fill(255);
    text(this.txt, this.width/2, this.height/2);
    pop();
  }

  mouseOver() {
    return mouse.x > this.pos.x && mouse.x < this.pos.x+this.width && mouse.y > this.pos.y && mouse.y < this.pos.y+this.height;
  }

}