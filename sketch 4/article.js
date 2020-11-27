class Article {
    constructor(x,y, text, size, wordList, updateList) {
        this.position = createVector(x,y);
        this.text = text;
        this.size = size;
        this.velocity = createVector(Math.random(), Math.random())
        this.textwidth = 0;
        this.wordList = wordList
        this.updateList = updateList;
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
        if(mouseIsPressed && mouseX < this.position.x+this.textwidth && mouseX > this.position.x && mouseY < this.position.y +5 && mouseY > this.position.y-5){
            console.log("Stopped");
            this.updateList(this.wordList);
        }
    }

    show(){
        textSize(this.size);
        this.textwidth = textWidth(this.text);
        fill(255);
        text(this.text, this.position.x, this.position.y);
    }

    mousePressed(){
        
    }
}