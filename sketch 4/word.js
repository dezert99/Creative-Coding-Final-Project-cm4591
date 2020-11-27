class Word {
    constructor(x,y, text, size) {
        this.position = createVector(x,y);
        this.text = text;
        this.size = size;
        this.velocity = createVector(Math.random(), Math.random())
        this.textwidth = 0;
    }
    
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.position.x+this.textwidth > windowWidth-100 || this.position.x < 0) {
            this.velocity.x *= -1;
        }
        else if(this.position.y > windowHeight-100 || this.position.y < 0) {
            this.velocity.y *= -1;
        }
    }

    show(){
        textSize(this.size);
        this.textwidth = textWidth(this.text);
        fill(255);
        text(this.text, this.position.x, this.position.y);
    }
}