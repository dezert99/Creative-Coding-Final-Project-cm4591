var player, bullet, bg, snd_bg, snd_playershootm, snd_explosion, snd_gameover, snd_win;

var shot = false;
var cantPickup = false;
var canKill = true;

var enemies = new  p5.prototype.Group();
var shootenemies = new p5.prototype.Group();
var bosses = new  p5.prototype.Group();
var megabosses = new  p5.prototype.Group();
var asteroids = new p5.prototype.Group();
var enemyBullets = new p5.prototype.Group();
var fuelPods = new p5.prototype.Group();

var shooterTimer = 0;
var bossTimer = 0;
var bossPatterns = ["single","double","wild","blast"];
var megaBossTimer = 0;
var playerSpeed = 0;

// ----------- Player controls
var fuel = 1000;
var max_fuel = 1000;
var playerMaxSpeed = 2;
var cantStop = false;


var gameover = false;
var won = false;
var started = false;
var level = 0;
var levelSpawns = [
    {
        mini: 3,
        boss: 0,
        shoot:0,
        megaboss: 0,
        asteroid: 4,
    },
    {
        mini: 2,
        shoot: 1,
        boss: 0,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 2,
        boss: 1,
        shoot:1,
        megaboss: 0,
        asteroid: 3,
    },
    {
        mini: 2,
        boss: 1,
        shoot:2,
        megaboss: 0,
        asteroid: 6,
    },
    {
        mini: 2,
        boss: 1,
        shoot:2,
        megaboss: 1,
        asteroid: 5,
    },
];

// -------------------- Spawn sprite functions --------------------

// Adds num amount of enemies and either a random position or a specified positon
function addEnemy(num, x, y, increment) {
    for(let i =0; i < num; i++) {
        let enemy = createSprite(x ? x :Math.random()*width,y ? y : Math.random()*height*.3, 32,32);
        enemy.addAnimation("idle",'./assets/enemy2_32x32-new.png')
        enemy.setCollider("circle",0,0,12)
        enemies.add(enemy);
    } 
    if(increment) {
        levelSpawns[level].mini += num;
    }

}

// Adds fuel at position x, y
function addFuel(num,x,y){
    for(let i =0; i < num; i++) {
        let fuel = createSprite(x,y, 4,4);
        fuel.addAnimation("idle",'./assets/fuel.png')
        fuelPods.add(fuel);
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

// Adds num amount of bosses and either a random position or a specified positon
function addBoss(num,x, y){
    for(let i =0; i < num; i++) {
        let boss = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 64,64);
        boss.addAnimation("idle",'./assets/boss.png')
        // boss.setSpeed(.2,Math.random()*1200);
        boss.setCollider("circle",0,0,32);
        bosses.add(boss);
    }
}

// Adds num amount of bosses and either a random position or a specified positon
function addMegaBoss(num,x, y){
    for(let i =0; i < num; i++) {
        let megaboss = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 96,96);
        megaboss.addAnimation("idle",'./assets/megaboss.png')
        megaboss.setCollider("circle",0,0,48);
        megabosses.add(megaboss);
    }
}

// Adds num amount of shooters and either a random position or a specified positon
function addShootEnemy(num,x, y){
    for(let i =0; i < num; i++) {
        let shooty = createSprite(x ? x : Math.random()*width,y ? y : Math.random()*height*.3, 32,32);
        shooty.addAnimation("idle",'./assets/enemy_shoot.png')
        // shooty.setSpeed(.2,Math.random()*1200);
        shooty.setCollider("circle",0,0,16);
        shootenemies.add(shooty);
    }
}

// Adds enemy bullets given an x, y speed and direction
function addEnemyBullet(x,y,speed,direction){
    console.log("called",direction);
    let bullet = createSprite(x,y, 4,4);
    bullet.addAnimation("idle",'./assets/enemy-bullet.png')
    bullet.setSpeed(speed,direction);
    bullet.setCollider("circle",0,0,2);
    enemyBullets.add(bullet);
}

// Adds boss bullets given a pattern
function addBossBullets(x,y, pattern){
    let num = Math.floor(random(5,15));
    console.log(num);
    let spacing = 360/num; // Spacing of bullet to shoot in a circle
    let d = 0;
    if(pattern === "single"){  // One burst in a circle
        for(let i = 0; i <num; i++){
            addEnemyBullet(x,y,2,d);
            d = d + spacing;
        }
    }
    else if(pattern == "double"){ // two bursts in a circle
        for(let i = 0; i <num; i++){
            addEnemyBullet(x,y,2,d);
            d = d + spacing;
        }
        setTimeout(() => { // delay the next volley by 1.5 seconds
            d = random(0,360);
            for(let i = 0; i <num; i++){
                addEnemyBullet(x,y,2,d);
                d = d + spacing;
            }
        }, 1500)
    }
    else if(pattern === "wild"){ // Randomized pattern of bursts
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
    else if(pattern === "blast") { // 3 lines of bullets shot towards player
        let dx = x- player.position.x;
        let dy = y - player.position.y;
        var angle = Math.atan2(dy, dx) * 180 / Math.PI
        angle -= 180; // Adjust due to direction of sprite. 
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

function enemyHit(enemy, bullet){ // chaser hit
    if(canKill){
        enemy.remove();
        levelSpawns[level].mini--;
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
        addFuel(2, enemy.position.x,enemy.position.y)
    
        //Check for win state after decrementing level spawns
        if(checkForWin()){
            newRound();
        }
        snd_explosion.play();
    }
    else {
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
    }
}

function shooterHit(enemy, bullet){ // shooter hit
    if(canKill){
        enemy.remove();
        levelSpawns[level].shoot--;
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
        addFuel(3, enemy.position.x,enemy.position.y)
        //Check for win state after decrementing level spawns
        if(checkForWin()){
            newRound();
        }
        snd_explosion.play();
    }
    else{
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
    }
}

function bossHit(boss, bullet, shieldDown){  // boss hit
    if(shieldDown && canKill){
        boss.remove();
        levelSpawns[level].boss--;
        snd_explosion.play();

        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
        addFuel(4, boss.position.x,boss.position.y)

        if(checkForWin()){
            newRound();
        }
    }
    else {
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
    }

    
}
function megaBossHit(boss, bullet, shieldDown){  // megaboss hit
    if(shieldDown){
        boss.remove();
        levelSpawns[level].megaboss--;
        snd_explosion.play();
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
        addFuel(6, boss.position.x,boss.position.y)

        if(checkForWin()){
            newRound();
        }
    }
    else {
        canKill = false;
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
    }

    
    
   
}

function playerHit() {
    enemies.removeSprites();
    player.remove();
    gameover = true;
    snd_explosion.play();
}

function collectFuel(fuelPointer, player){
    fuel+= 50;
    fuelPointer.remove();
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
    addShootEnemy(currLevel.shoot);
    addMegaBoss(currLevel.megaboss);
    fuel = max_fuel;
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
    if(!notDone && level === levelSpawns.length-1) { //Final win condition
        won = true;
        clearBoard(true);
        return false;
    }
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
    text('Press enter to restart', width/2-(textWidth('Press enter to restart')/2), height/2+30);
}

function drawWin(){
    textSize(32);
    fill(255);
    text('Winner!', width/2-(textWidth('Winner!')/2), height/2);
}

function drawStart(){
    textSize(32);
    fill(255);
    text('Welcome!', width/2-(textWidth('Welcome!')/2), 200);
    text('Press E to shoot', width/2-(textWidth('Press E to shoot')/2), 230);
    text('Hold W to move in the direction', width/2-(textWidth('Hold W to move in the direction')/2), 260);
    text('the ship is facing', width/2-(textWidth('the ship is facing')/2), 290);
    text('Hold S to slow down', width/2-(textWidth('Hold S to slow down')/2), 320);
    text('Press enter to start!', width/2-(textWidth('Press enter to start!')/2), 350);
}

function clearBoard(movePlayer){
    asteroids.removeSprites();
    enemies.removeSprites();
    shootenemies.removeSprites();
    enemyBullets.removeSprites();
    fuelPods.removeSprites();

    resetBullet();

    if(movePlayer) {
        player.position.x = width/2;
        player.position.y = height*.75;
        player.setSpeed(0);
    }

    // shooterTimer = 0;
}

// -------------------- Game --------------------
function preload() {
    // we have included both an .ogg file and an .mp3 file
    soundFormats('ogg', 'mp3', 'wav');
  
    // if mp3 is not supported by this browser,
    // loadSound will load the ogg file
    // we have included with our sketch
    snd_bg = loadSound('./assets/Battleinthestars.ogg');
    snd_playershoot = loadSound("./assets/pshoot.wav");
    snd_playershoot.setVolume(1);
    snd_gameover = loadSound("./assets/gameover.ogg");

    snd_explosion = loadSound("./assets/explosion.wav");
    snd_explosion.setVolume(5);

    snd_win = loadSound("./assets/EpicEnd.ogg");

    bg = loadImage('./assets/bg.png');

  }


async function setup() {
    createCanvas(640, 640);
    snd_bg.loop();
    player = createSprite(width/2,height-100,32,32)
    player.addAnimation("floating",'./assets/player_32x32.png');

    bullet = createSprite(width/2,-200,4,4);
    bullet.addAnimation("floating", './assets/bullet.png');
    bullet.visible = false;
    

    //Spawn inital enemies and astroids.
    // addEnemy(levelSpawns[0].mini);
    // addAsteroid(levelSpawns[0].asteroid);
    // addShootEnemy(levelSpawns[0].shoot);
    // addBoss(levelSpawns[0].boss);
    // addMegaBoss(levelSpawns[0].megaboss);
    
    player.setCollider("circle",0,0,12)
}

function drawFuel(){
    let barWidth = 150;
    let drawWidth = (fuel/max_fuel) * barWidth;
    let red = color(255, 0, 0);
    let green = color(0,255,0);
    let col = lerpColor(red, green, fuel/max_fuel);

    textSize(12);
    fill(255);
    text('Fuel:', 20,20);
    fill(0);
    rect(25+textWidth('Fuel:'), 11, barWidth, 10);
    fill(col);
    rect(25+textWidth('Fuel:'), 11, drawWidth, 10);
}


function draw() {
    background(bg);
    drawFuel();
    
    drawSprites();
    if(!started){
        drawStart();

        if(keyDown("enter")){
            addEnemy(levelSpawns[0].mini);
            addAsteroid(levelSpawns[0].asteroid);
            addShootEnemy(levelSpawns[0].shoot);
            addBoss(levelSpawns[0].boss);
            addMegaBoss(levelSpawns[0].megaboss);
            started = true;
        }
        return;
    }
    if(gameover) {
        if(snd_bg.isPlaying()){
            snd_bg.pause();
            snd_gameover.play();
        }
        snd_bg.pause();
        console.log("calling");
        drawGameover();
        if(keyDown("enter")){
            location.reload();
        }
        return;
    }
    else if(won) {
        if(snd_bg.isPlaying()){
            snd_bg.pause();
            snd_win.loop();
        }
        drawWin();
        return;
    }

    //Check for fuel pickup
    fuelPods.overlap(player, collectFuel);


    //Handle rotation of ship
    if (abs(player.position.x - mouseX) > 10 && abs(player.position.y - mouseY) > 10) {
        var x = player.position.x - mouseX
        var y = player.position.y - mouseY
        var angle = Math.atan2(y, x) * 180 / Math.PI
        player.rotation = angle + 270
    }

    // Basic Movement
    if(keyDown("w")) {
      
        player.addSpeed(.07, player.rotation-90);
        player.limitSpeed(playerMaxSpeed);
        // player.setSpeed(playerSpeed,player.rotation-90);
        fuel -= 1;
        if(fuel === 0){
            gameover = true;
        }
    }
    else if(keyDown("s")) {
        let speed = player.getSpeed();
        player.setSpeed(speed-.07);
    }

    // Handle shooting if enter is pressed
    if(keyWentDown(69) && !shot){
        bullet.visible = true;
        bullet.position.x = player.position.x;
        bullet.position.y = player.position.y;
        bullet.setSpeed(3,player.rotation-90);
        shot = true;
        cantPickup = true;
        cantStop = true
        canKill = true;
        snd_playershoot.play();

        setTimeout(() => {cantPickup = false},1500);
        setTimeout(() => {cantStop = false},1000);
    }

    //Constrain ship position
    player.position.x = constrain(player.position.x, player.width/2,width-player.width/2);
    player.position.y = constrain(player.position.y, player.height/2, height-player.height/2);

    //Constrain bullet position
    if(!cantStop && (bullet.position.x <= 4 || bullet.position.x >= width-4 || bullet.position.y <= 4 || bullet.position.y >= height-4)){
        console.log("stopping bullet", cantStop);
        bullet.setSpeed(0);
    }
    if(!cantStop && (bullet.position.x > width || bullet.position.x < 0 || bullet.position.y > height || bullet.position.y < 0)) {
        bullet.position.x = (Math.random()*(width-60)) + 30;
        bullet.position.y = (Math.random()*(height-60)) + 30;
        bullet.setSpeed(0);
    }

    //Handle pickup of bullet
    if(!cantPickup && shot && dist(player.position.x, player.position.y, bullet.position.x, bullet.position.y) <40 && player.overlap(bullet)) {
        bullet.visible = false;
        shot = false;
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
            addEnemyBullet(shooter.position.x, shooter.position.y, 2,shooter.rotation-90);
        }
        
    })
    shooterTimer = (shooterTimer+1)%300;
    // -------------- Boss movement and collision ---------------
    let shieldHealth = levelSpawns[level].mini*20;
    bosses.forEach(boss => {
        boss.attractionPoint(.2,player.position.x,player.position.y);
        boss.overlap(bullet, (boss,bullet) => bossHit(boss,bullet,shieldHealth === 0));

        boss.overlap(player, playerHit);
        fill(133, 255, 253,shieldHealth);
        ellipse(boss.position.x,boss.position.y,80,80)
        boss.debug = mouseIsPressed;
        boss.maxSpeed = .3;
        let alpha = 40+sin(frameCount/15)*30
        stroke(18, 255, 121,alpha);
        megabosses.forEach(megaBoss => {
            line(megaBoss.position.x,megaBoss.position.y,boss.position.x, boss.position.y);    
        })

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

    console.log("bullet:",bullet.position.x, bullet.position.y);
}
