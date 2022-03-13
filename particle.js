let confetti = [];

class Confetti {
  constructor(pos) {
    this.pos = pos.copy();
    this.dir = p5.Vector.random2D();
    const speed = random(8, 15);
    this.vel = p5.Vector.mult(this.dir, speed);
    this.vel.y -= 5;
    this.avel = random(10*PI/180);
    this.rot = random(TWO_PI);
    this.grav = createVector(0, 0.16);
    this.clr = gateColors[random(Object.keys(gateColors).slice(2))];
  }

  display() {
    push();
    translate(this.pos);
    rotate(this.rot);
    fill(this.clr);
    noStroke();
    rect(-5, -3, 10, 6);
    pop();

    this.pos.add(this.vel);
    this.vel.add(this.grav);
    this.vel.mult(0.95);
    this.rot += this.avel;
  }
}
