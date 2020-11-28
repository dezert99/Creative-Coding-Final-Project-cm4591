var player, bullet;

var shot = false;
var cantPickup = false;
async function setup() {
    createCanvas(700, 600);
    
    player = createSprite(width/2,height/2,32,32)
    player.addAnimation("floating",'./assets/player_32x32.png');

    bullet = createSprite(width/2,-200,4,4);
    bullet.addAnimation("floating", './assets/bullet.png');
}

function draw() {
    background(0);
    
    drawSprites();

    //Handle rotation of ship
    if (abs(player.position.x - mouseX) > 10 && abs(player.position.y - mouseY) > 10) {
        var x = player.position.x - mouseX
        var y = player.position.y - mouseY
        var angle = Math.atan2(y, x) * 180 / Math.PI
        player.rotation = angle + 270
    }

    // Basic Movement
    if(keyWentDown("w")) {
        console.log("player.direction",player.rotation);
        player.setSpeed(1.5,player.rotation-90);
    }
    else if(keyWentDown("s")) {
        console.log("stopping movement");
        player.setSpeed(0);
    }

    // Handle shooting if enter is pressed
    if(keyWentDown(13) && !shot){
        bullet.position.x = player.position.x;
        bullet.position.y = player.position.y;
        bullet.setSpeed(3,player.rotation-90);
        shot = true;
        cantPickup = true;
        setInterval(() => {cantPickup = false},1000);
    }

    //Constrain ship position
    player.position.x = constrain(player.position.x, player.width/2,width-player.width/2);
    player.position.y = constrain(player.position.y, player.height/2, height-player.height/2);

    //Constrain bullet position
    if(bullet.position.x <= 4 || bullet.position.x >= width-4 || bullet.position.y <= 4 || bullet.position.y >= height-4){
        bullet.setSpeed(0);
    }

    if(!cantPickup && shot && dist(player.position.x, player.position.y, bullet.position.x, bullet.position.y) <40 && player.overlap(bullet)) {
        bullet.position.x = 1000;
        shot = false;
    }

}
