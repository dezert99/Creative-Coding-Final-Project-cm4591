var player, bullet;

var shot = false;
var cantPickup = false;
var canKill = true;

var enemies = new  p5.prototype.Group();
var shootenemies = new p5.prototype.Group();
var bosses = new  p5.prototype.Group();
var megabosses = new  p5.prototype.Group();
var asteroids = new p5.prototype.Group();
var enemyBullets = new p5.prototype.Group();

var shooterTimer = 0;
var bossTimer = 0;
var bossPatterns = ["single","double","wild","blast"];
var megaBossTimer = 0;

var gameover = false;
var won = false;
var level = 0;
var levelSpawns = [
    {
        mini: 0,
        boss: 1,
        shoot:0,
        megaboss: 1,
        asteroid: 0,
    },
    {
        mini: 2,
        shoot: 1,
        boss: 0,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 4,
        boss: 0,
        shoot:0,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 2,
        boss: 1,
        shoot:0,
        megaboss: 0,
        asteroid: 4,
    },
];

// -------------------- Spawn sprite functions --------------------

// Adds num amount of enemies and either a random position or a specified positon
function addEnemy(num, x, y, increment) {
    for(let i =0; i < num; i++) {
        let enemy = createSprite(x ? x :Math.random()*width,y ? y : Math.random()*height*.3, 32,32);
        enemy.addAnimation("idle",'./assets/enemy2_32x32.png')
        enemy.setCollider("circle",0,0,16)
        enemies.add(enemy);
    } 
    if(increment) {
        levelSpawns[level].mini += num;
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

function addMegaBoss(num,x, y){
    for(let i =0; i < num; i++) {
        let megaboss = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 96,96);
        megaboss.addAnimation("idle",'./assets/megaboss.png')
        megaboss.setCollider("circle",0,0,48);
        megabosses.add(megaboss);
    }
}

function addShootEnemy(num,x, y){
    for(let i =0; i < num; i++) {
        let shooty = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 32,32);
        shooty.addAnimation("idle",'./assets/enemy_shoot.png')
        // shooty.setSpeed(.2,Math.random()*1200);
        shooty.setCollider("circle",0,0,16);
        shootenemies.add(shooty);
    }
}

function addEnemyBullet(x,y,speed,direction){
    console.log("called",direction);
    let bullet = createSprite(x,y, 4,4);
    bullet.addAnimation("idle",'./assets/enemy-bullet.png')
    bullet.setSpeed(speed,direction);
    bullet.setCollider("circle",0,0,2);
    enemyBullets.add(bullet);
}

function addBossBullets(x,y, pattern){
    let num = Math.floor(random(5,15));
    console.log(num);
    let spacing = 360/num;
    let d = 0;
    if(pattern === "single"){
        for(let i = 0; i <num; i++){
            addEnemyBullet(x,y,2,d);
            d = d + spacing;
        }
    }
    else if(pattern == "double"){
        for(let i = 0; i <num; i++){
            addEnemyBullet(x,y,2,d);
            d = d + spacing;
        }
        setTimeout(() => {
            d = random(0,360);
            for(let i = 0; i <num; i++){
                addEnemyBullet(x,y,2,d);
                d = d + spacing;
            }
        }, 1500)
    }
    else if(pattern === "wild"){
        for(let i = 0; i <num; i++){
            addEnemyBullet(x,y,2,d);
            d = d + spacing;
        }
        let dup = Math.floor(random(1,3));
        for(let i = 0; i< dup; i++){
            setTimeout(() => {
                d = random(0,360);
                num = Math.floor(random(5,15));
                for(let i = 0; i <num; i++){
                    addEnemyBullet(x,y,2,d);
                    d = d + spacing;
                }
            }, 1500+(1500*i));
        }
    }
    else if(pattern === "blast") {
        let dx = x- player.position.x;
        let dy = y - player.position.y;
        var angle = Math.atan2(dy, dx) * 180 / Math.PI
        angle -= 180;
        num = 4;
        d = angle-25; //Direction
        addEnemyBullet(x,y,2,d);
        for(let i = 0; i <num; i++){
            setTimeout((direction) => {
                addEnemyBullet(x,y,2,direction);
            }, 600+(600*i), d);
        }
        d = angle;
        addEnemyBullet(x,y,2,d);
        for(let i = 0; i <num; i++){
            setTimeout((direction) => {
                addEnemyBullet(x,y,2,direction);
            }, 600+(600*i),d);
        }
        d = angle + 25;
        addEnemyBullet(x,y,2,d);
        for(let i = 0; i <num; i++){
            setTimeout((direction) => {
                addEnemyBullet(x,y,2,direction);
            }, 600+(600*i),d);
        }
    }
   
}

// -------------------- Collision functions --------------------

function enemyHit(enemy, bullet){
    if(canKill){
        enemy.remove();
        bullet.position.x = (Math.random()*width-20) + 10;
        bullet.position.y = (Math.random()*height-20) + 10;
        bullet.setSpeed(0);
        levelSpawns[level].mini--;
        canKill = false;
    
        //Check for win state after decrementing level spawns
        if(checkForWin()){
            newRound();
        }
    }
}

function shooterHit(enemy, bullet){
    enemy.remove();
    bullet.position.x = (Math.random()*width-20) + 10;
    bullet.position.y = (Math.random()*height-20) + 10;
    bullet.setSpeed(0);
    levelSpawns[level].shoot--;
    canKill = false;

    //Check for win state after decrementing level spawns
    if(checkForWin()){
        newRound();
    }
}

function bossHit(boss, bullet, shieldDown){
    canKill = false;
    bullet.position.x = (Math.random()*width-20) + 10;
    bullet.position.y = (Math.random()*height-20) + 10;
    bullet.setSpeed(0);
    
    if(shieldDown){
        boss.remove();
        levelSpawns[level].boss--;

        if(checkForWin()){
            newRound();
        }
    }
}
function megaBossHit(boss, bullet, shieldDown){
    canKill = false;
    bullet.position.x = (Math.random()*width-20) + 10;
    bullet.position.y = (Math.random()*height-20) + 10;
    bullet.setSpeed(0);
    
    if(shieldDown){
        boss.remove();
        levelSpawns[level].megaboss--;

        if(checkForWin()){
            newRound();
        }
    }
}

function playerHit() {
    enemies.removeSprites();
    player.remove();
    gameover = true;
}

// -------------------- Game state functions --------------------
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
    addShootEnemy(currLevel.shoot)
}

function resetBullet(){
    bullet.position.x = -1000;
    shot = false;
    cantPickup = false;
    canKill = true;
}

//Checks the current level spawns to see if there are any enemies left
function checkForWin(){
    let currLevel = levelSpawns[level];
    let notDone = false;
    Object.keys(currLevel).forEach(key => {
        console.log("key",key)
        if(key != "asteroid" && currLevel[key] != 0){
            console.log("setting for",key, currLevel[key]);
            notDone = true;
        }
    })
    console.log("notDone",notDone);
    return !notDone;
    // if(currLevel.mini === 0 && currLevel.boss === 0 && currLevel.megaboss === 0 ) {
    //     return true;
    // }
    // return true;
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
    shootenemies.removeSprites();
    resetBullet();

    if(movePlayer) {
        player.position.x = width/2;
        player.position.y = height*.75;
        player.setSpeed(0);
    }

    shooterTimer = 0;
}

// -------------------- Game --------------------
async function setup() {
    createCanvas(700, 600);
    
    player = createSprite(width/2,height/2,32,32)
    player.addAnimation("floating",'./assets/player_32x32.png');

    bullet = createSprite(width/2,-200,4,4);
    bullet.addAnimation("floating", './assets/bullet.png');

    //Spawn inital enemies and astroids.
    addEnemy(levelSpawns[0].mini);
    addAsteroid(levelSpawns[0].asteroid);
    addShootEnemy(levelSpawns[0].shoot);
    addBoss(levelSpawns[0].boss);
    addMegaBoss(levelSpawns[0].megaboss);
    
    player.setCollider("circle",0,0,16)
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
        canKill = true;
    }

    // -------------- Minion movement and collision ---------------
    // Enemy hit detection
    enemies.collide(enemies);
    enemies.collide(shootenemies);
    enemies.forEach(enemy => {
        enemy.attractionPoint(.2,player.position.x,player.position.y);
        enemy.overlap(bullet, enemyHit);
        enemy.overlap(player, playerHit);
        enemy.debug = mouseIsPressed;
        let alpha = 40+sin(frameCount/15)*30
        stroke(133, 255, 253,alpha);
        enemy.maxSpeed = 1.2;

        bosses.forEach(boss => {
            line(enemy.position.x,enemy.position.y,boss.position.x, boss.position.y);            
        });
    });

    // -------------- Shooter movement and collision ---------------
    shootenemies.collide(shootenemies);
    shootenemies.forEach(shooter => {
        shooter.attractionPoint(.2,player.position.x,player.position.y);
        shooter.overlap(bullet, shooterHit);
        shooter.overlap(player, playerHit);
        shooter.debug = mouseIsPressed;
        shooter.maxSpeed = .5;

        //Handle rotation of ship
        if (abs(shooter.position.x - player.position.x) > 10 && abs(shooter.position.y - player.position.y) > 10) {
            var x = shooter.position.x - player.position.x
            var y = shooter.position.y - player.position.y
            var angle = Math.atan2(y, x) * 180 / Math.PI
            // console.log("rot",shooter.rotation, angle);
            shooter.rotation = angle + 270
        }
        if(shooterTimer === 0){
            addEnemyBullet(shooter.position.x, shooter.position.y, 1,shooter.rotation-90);
        }
        
    })
    shooterTimer = (shooterTimer+1)%300;
    // -------------- Boss movement and collision ---------------
    let shieldHealth = levelSpawns[level].mini*20;
    bosses.forEach(boss => {
        // boss.attractionPoint(.2,player.position.x,player.position.y);
        boss.overlap(bullet, (boss,bullet) => bossHit(boss,bullet,shieldHealth === 0));

        boss.overlap(player, playerHit);
        fill(133, 255, 253,shieldHealth);
        ellipse(boss.position.x,boss.position.y,80,80)
        boss.debug = mouseIsPressed;
        boss.maxSpeed = .3;

        if(bossTimer === 0){
            addBossBullets(boss.position.x,boss.position.y, bossPatterns[Math.floor(random(0,bossPatterns.length))]);
        }
    });
    bossTimer = (bossTimer+1)%500;

     // -------------- Megaboss movement and collision ---------------
     shieldHealth = levelSpawns[level].boss*20;
     megabosses.forEach(megaBoss => {
         // megaBoss.attractionPoint(.2,player.position.x,player.position.y);
         megaBoss.overlap(bullet, (megaBoss,bullet) => megaBossHit(megaBoss,bullet,shieldHealth === 0));
 
         megaBoss.overlap(player, playerHit);
         fill(18, 255, 121,shieldHealth);
         ellipse(megaBoss.position.x,megaBoss.position.y,120,120)
         megaBoss.debug = mouseIsPressed;
         megaBoss.maxSpeed = .3;
 
         if(megaBossTimer === 0){
            addEnemy(1,megaBoss.position.x,megaBoss.position.y, true);
         }
     });
     megaBossTimer = (megaBossTimer+1)%1000;
    
    player.debug = mouseIsPressed;

    // -------------- Asteroid movement and collision ---------------
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

    // -------------- Enemy bullet collision ---------------
    enemyBullets.forEach(bullet => {
        bullet.debug = mouseIsPressed;
        if(bullet.collide(player)) {
            playerHit();
        }

        if(bullet.position.x > width+5 || bullet.position.x < -5 || bullet.position.y > height+ 10 || bullet.position.y < -10){
            bullet.remove();
        }
    });
}
