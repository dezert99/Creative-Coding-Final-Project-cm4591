var player, bullet;

var shot = false;
var cantPickup = false;
var enemies = new  p5.prototype.Group();
var bosses = new  p5.prototype.Group();
var megabosses = new  p5.prototype.Group();
var asteroids = new p5.prototype.Group();

var gameover = false;
var won = false;
var level = 0;
var levelSpawns = [
    {
        mini: 1,
        boss: 0,
        megaboss: 0,
        asteroid: 2,
    },
    {
        mini: 2,
        boss: 0,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 4,
        boss: 0,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 2,
        boss: 1,
        megaboss: 0,
        asteroid: 4,
    },
];

// Adds num amount of enemies and either a random position or a specified positon
function addEnemy(num, x, y) {
    for(let i =0; i < num; i++) {
        let enemy = createSprite(x ? x :Math.random()*width,y ? y : Math.random()*height*.3, 32,32);
        enemy.addAnimation("idle",'./assets/enemy2_32x32.png')
        enemy.setCollider("circle",0,0,16)
        enemies.add(enemy);
    } 
}

// Adds num amount of asteroids and either a random position or a specified positon
function addAsteroid(num,x, y){
    for(let i =0; i < num; i++) {
        let asteroid = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 44,38);
        asteroid.addAnimation("idle",'./assets/asteroid-r.png')
        asteroid.rotationSpeed = .2;
        asteroid.setSpeed(.2,Math.random()*1200);
        asteroid.setCollider("circle",0,0,16);
        asteroids.add(asteroid);
    }
}

// Adds num amount of asteroids and either a random position or a specified positon
function addBoss(num,x, y){
    for(let i =0; i < num; i++) {
        let boss = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 64,64);
        boss.addAnimation("idle",'./assets/boss.png')
        // boss.setSpeed(.2,Math.random()*1200);
        boss.setCollider("circle",0,0,32);
        bosses.add(boss);
    }
}


function newRound(){
    if(level+1 === levelSpawns.length){
        console.log("finished");
        clearBoard();
        player.remove();
        won = true;
        return;
    }
    let currLevel = levelSpawns[++level];

    clearBoard(true);
    addAsteroid(currLevel.asteroid);
    addEnemy(currLevel.mini);
    addBoss(currLevel.boss);
}

function resetBullet(){
    bullet.position.x = -1000;
    shot = false;
    cantPickup = false;
}

async function setup() {
    createCanvas(700, 600);
    
    player = createSprite(width/2,height/2,32,32)
    player.addAnimation("floating",'./assets/player_32x32.png');

    bullet = createSprite(width/2,-200,4,4);
    bullet.addAnimation("floating", './assets/bullet.png');

    //Spawn inital enemies and astroids.
    addEnemy(levelSpawns[0].mini);
    addAsteroid(levelSpawns[0].asteroid);
    
    player.setCollider("circle",0,0,16)
}

function enemyHit(enemy, bullet){
    enemy.remove();
    bullet.position.x = (Math.random()*width-20) + 10;
    bullet.position.y = (Math.random()*height-20) + 10;
    bullet.setSpeed(0);
    levelSpawns[level].mini--;

    //Check for win state after decrementing level spawns
    if(checkForWin()){
        newRound();
    }
}

function bossHit(boss, bullet){
    boss.remove();
    bullet.position.x = (Math.random()*width-20) + 10;
    bullet.position.y = (Math.random()*height-20) + 10;
    bullet.setSpeed(0);
    levelSpawns[level].boss--;

    //Check for win state after decrementing level spawns
    if(checkForWin()){
        newRound();
    }
}

//Checks the current level spawns to see if there are any enemies left
function checkForWin(){
    let currLevel = levelSpawns[level];
    if(currLevel.mini === 0 && currLevel.boss === 0 && currLevel.megaboss === 0) {
        return true;
    }
    return false;
}

function playerHit() {
    enemies.removeSprites();
    player.remove();
    gameover = true;
}

function drawGameover(){
    textSize(32);
    fill(255);
    text('Game over!', width/2-(textWidth('Game over!')/2), height/2);
}

function drawWin(){
    textSize(32);
    fill(255);
    text('Winner!', width/2-(textWidth('Winner!')/2), height/2);
}

function clearBoard(movePlayer){
    asteroids.removeSprites();
    enemies.removeSprites();
    resetBullet();

    if(movePlayer) {
        player.position.x = width/2;
        player.position.y = height*.75;
        player.setSpeed(0);
    }
}

function draw() {
    background(0);
    
    drawSprites();

    if(gameover) {
        console.log("calling");
        drawGameover();
        return;
    }
    else if(won) {
        drawWin();
        return;
    }

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
        setInterval(() => {cantPickup = false},1500);
    }

    //Constrain ship position
    player.position.x = constrain(player.position.x, player.width/2,width-player.width/2);
    player.position.y = constrain(player.position.y, player.height/2, height-player.height/2);

    //Constrain bullet position
    if(bullet.position.x <= 4 || bullet.position.x >= width-4 || bullet.position.y <= 4 || bullet.position.y >= height-4){
        bullet.setSpeed(0);
    }

    //Handle pickup of bullet
    if(!cantPickup && shot && dist(player.position.x, player.position.y, bullet.position.x, bullet.position.y) <40 && player.overlap(bullet)) {
        bullet.position.x = 1000;
        shot = false;
    }

    // Enemy hit detection
    enemies.collide(enemies);
    enemies.forEach(enemy => {
        enemy.attractionPoint(.2,player.position.x,player.position.y);
        enemy.overlap(bullet, enemyHit);
        enemy.overlap(player, playerHit);
        enemy.debug = mouseIsPressed;
        enemy.maxSpeed = 1;
    });

    bosses.forEach(boss => {
        // boss.attractionPoint(.2,player.position.x,player.position.y);
        boss.overlap(bullet, bossHit);
        boss.overlap(player, playerHit);
        boss.debug = mouseIsPressed;
        boss.maxSpeed = 1;
    });
    
    player.debug = mouseIsPressed;
    asteroids.forEach(asteroid => {
        asteroid.debug = mouseIsPressed;
        if(asteroid.collide(player)){
            playerHit();
        }
        if(dist(asteroid.position.x, asteroid.position.y, player.position.x, player.position.y) < 150){
            console.log("attracting player")
            player.attractionPoint(.01, asteroid.position.x,asteroid.position.y);
        }
    })
    
}
