/*
Dylan Miller - dtm9@uw.edu
TCSS 491 A
Taxi Cab sprite image free as in freedom at unluckystudio.com
Sprite sheet featuring said taxi cab made by me
Exsplosion spritesheet found from unknown source on Google
*/

var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function MushroomDude(game, spritesheet) {
    this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
    this.x = 0;
    this.y = 0;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

MushroomDude.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

MushroomDude.prototype.update = function () {
    if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
        this.x += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -230;
}

function Background(game, spritesheet) {
  this.x = 0;
  this.y = 0;
  this.spritesheet = spritesheet;
  this.game = game;
  this.ctx = game.ctx;
};

Background.prototype.draw = function () {
  this.ctx.drawImage(this.spritesheet, this.x, this.y);
};

Background.prototype.update = function () {
};

function Splosion(game, spritesheet, x, y) {
  this.animation = new Animation(spritesheet, 80, 80, 8, 0.08, 48, false, 1);
  this.speed = 100;
  this.ctx = game.ctx;
  Entity.call(this, game, x, y);
}

Splosion.prototype = new Entity();
Splosion.prototype.constructor = Splosion;

Splosion.prototype.update = function () {
  Entity.prototype.update.call(this);
}

Splosion.prototype.draw = function () {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  Entity.prototype.draw.call(this);
}

function Car(game, spritesheet) {
  this.animation = new Animation(spritesheet, 256, 256, 4, 1, 12, true, 1);
  this.speed = 100;
  this.ctx = game.ctx;
  this.crashed = false;
  Entity.call(this, game, 350, 850);
}

Car.prototype = new Entity();
Car.prototype.constructor = Car;

Car.prototype.update = function () {
  //if not yet crashed
  if (this.animation.elapsedTime < this.animation.totalTime * 8 / 12) {
    this.y -= this.game.clockTick * this.speed;
  }

  //if turning
  if (this.animation.elapsedTime > 5 && this.animation.elapsedTime < 8) {
    //console.log("turning!");
    this.x += this.game.clockTick * this.speed;
  }

  //if crashed
  if (this.animation.elapsedTime > 8 && this.crashed === false) {
    this.crashed = true;
    this.game.addEntity(new Splosion(this.game, AM.getAsset("./img/splosion.png"), this.x + 70, this.y + 70));
  }

  //if animation is over
  if (this.animation.elapsedTime === 0) {
    this.y = 850;
    this.x = 350;
    this.crashed = false;
    console.log("should reset right here...");
  }

  Entity.prototype.update.call(this);
}

Car.prototype.draw = function () {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
  Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/background.png");
AM.queueDownload("./img/car.png");
AM.queueDownload("./img/splosion.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.png")));
    gameEngine.addEntity(new Car(gameEngine, AM.getAsset("./img/car.png")));
});
