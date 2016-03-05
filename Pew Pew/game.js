GameStates.Game = function (game) {
    var pellet;
    var guns;
    var mirrors;
    var barriers;
    var blocks;
    var tiles;
    var targets;
    var stars;
    var hitStars;
    var offsetX, offsetY;
    var gridSize;
    var gameArea;
    var pelletSpeed;
    var grid;
    var gameState;
    var pointer;

    // Level data
    GameStates.Game.pack = 0;
    GameStates.Game.level = 0;
    GameStates.Game.music = null;
    var gameData;  // Global data - size, pack names, etc
    var packData;  // Data for the current level pack
    var levelData; // Data for the current level
};

GameStates.Game.prototype = {

    makePointer: function(x, y) {
        var pointer = this.add.sprite(this.offsetX + (this.gridSize * x) + 24, this.offsetY + (this.gridSize * y) + 24, "pointer");
        pointer.anchor.setTo(0.3, 0.2);
        pointer.angle = -45;
        var sx = pointer.x;
        var sy = pointer.y;
        this.add.tween(pointer).to({ x: sx + 6, y: sy + 6 }, 500, Phaser.Easing.Linear.InOut, true, 0, -1, true).loop(true);

        return pointer;
    },

    makeTarget: function (x, y) {
        var target = this.targets.create(this.offsetX + (this.gridSize * x), this.offsetY + (this.gridSize * y), "target");
        target.animations.add("idle");
        target.animations.play("idle", 1, true);
        this.grid[x][y] = target;
        target.gridX = x;
        target.gridY = y;
        this.gameState.targetsLeft++;
        return target;
    },

    makeStar: function (x, y) {
        var star = this.stars.create(1 + this.offsetX + (this.gridSize * x), 1 + this.offsetY + (this.gridSize * y), "star");
        this.grid[x][y] = star;
        this.gameState.starsLeft++;

        var hitStar = this.hitStars.create(1 + this.offsetX + (this.gridSize * x), 1 + this.offsetY + (this.gridSize * y), "happystar");
        star.hitStar = hitStar;
        star.hit = false;
        hitStar.alpha = 0;
        return star;
    },

    makeMirror: function (x, y, dir) {
        var mirror = this.mirrors.create(this.offsetX + (this.gridSize * x) + 16, this.offsetY + (this.gridSize * y) + 16, "mirror");
        this.grid[x][y] = mirror;
        mirror.gridX = x;
        mirror.gridY = y;
        mirror.anchor.setTo(0.5, 0.5);
        switch (dir) {
            case "tl":
                mirror.angle = -90;
                break;
            case "bl":
                mirror.angle = 180;
                break;
            case "br":
                mirror.angle = 90;
                break;
        }
        mirror.dir = dir;
        mirror.inputEnabled = true;
        mirror.input.useHandCursor = true;
        mirror.events.onInputUp.add(this.onMirrorClick, this);
        return mirror;
    },

    makeGun: function (x, y, dir) {
        var gun = this.guns.create(this.offsetX + (this.gridSize * x) + 16, this.offsetY + (this.gridSize * y) + 16, "gun");
        gun.animations.add("idle");
        gun.animations.play("idle", 2, true);
        this.grid[x][y] = gun;
        gun.gridX = x;
        gun.gridY = y;
        gun.dir = dir;
        gun.anchor.setTo(0.5, 0.5);
        switch (dir) {
            case "up":
                gun.angle = -90;
                break;
            case "down":
                gun.angle = 90;
                break;
            case "left":
                gun.angle = 180;
                break;
        }
        gun.inputEnabled = true;
        gun.input.useHandCursor = true;
        gun.events.onInputUp.add(this.onGunClick, this);
        this.addGunParticles(gun);

        return gun;
    },

    addGunParticles: function (gun) {
        var cx, cy;
        var maxX, maxY;
        var minX, minY;
        switch (gun.dir) {
            case "right":
                cx = gun.x + 16;
                cy = gun.y;
                minX = 50;
                minY = 0;
                maxX = 50;
                maxY = 0;
                break;
            case "left":
                cx = gun.x - 16;
                cy = gun.y;
                minX = -50;
                minY = 0;
                maxX = -50;
                maxY = 0;
                break;
            case "up":
                cx = gun.x;
                cy = gun.y - 16;
                minX = 0;
                minY = -50;
                maxX = 0;
                maxY = -50;
                break;
            case "down":
                cx = gun.x;
                cy = gun.y + 16;
                minX = 0;
                minY = 50;
                maxX = 0;
                maxY = 50;
                break;

        }
        var emitter = this.add.emitter(cx, cy, 64);
        emitter.width = 8;
        emitter.height = 8;
        emitter.particleClass = GunParticle;

        emitter.makeParticles();

        emitter.minParticleSpeed.set(minX, minY);
        emitter.maxParticleSpeed.set(maxX, maxY);

        emitter.setRotation(0, 0);
        emitter.setScale(0.1, 1, 0.1, 1, 200, Phaser.Easing.Quintic.Out);
        emitter.gravity = 0;

        emitter.start(false, 250, 100);
    },

    makeBarrier: function (x, y, dir) {
        var barrier = this.barriers.create(this.offsetX + (this.gridSize * x) + 16, this.offsetY + (this.gridSize * y) + 16, "barrier");
        this.grid[x][y] = barrier;
        barrier.gridX = x;
        barrier.gridY = y;
        barrier.anchor.setTo(0.5, 0.5);
        barrier.dir = dir;
        if (dir == "v") {
            barrier.angle = 90;
        }
        barrier.inputEnabled = true;
        barrier.input.useHandCursor = true;
        barrier.events.onInputUp.add(this.onBarrierClick, this);

        return barrier;
    },

    makeBlock: function (x, y) {
        var block = this.blocks.create(this.offsetX + (this.gridSize * x) + 16, this.offsetY + (this.gridSize * y) + 16, "block");
        this.grid[x][y] = block;
        block.gridX = x;
        block.gridY = y;
        block.anchor.setTo(0.5, 0.5);

        return block;
    },

    makeTile: function (x, y) {
        var tile = this.tiles.create(this.offsetX + (this.gridSize * x) + 16, this.offsetY + (this.gridSize * y) + 16, "tile");
        this.grid[x][y] = tile;
        tile.gridX = x;
        tile.gridY = y;
        tile.anchor.setTo(0.5, 0.5);

        return tile;
    },

    setGap: function (gap) {
        if (!gap.hasOwnProperty("fromX") || gap.fromX < 0) {
            gap.fromX = 0;
        }
        if (!gap.hasOwnProperty("fromY") || gap.fromY < 0) {
            gap.fromY = 0;
        }
        if (!gap.hasOwnProperty("toX") || gap.toX > this.gameData.size.width) {
            gap.toX = 0;
        }
        if (!gap.hasOwnProperty("toY") || gap.toY > this.gameData.size.height) {
            gap.toY = 0;
        }
        if (gap.toX < gap.fromX) {
            gap.toX = gap.fromX;
        }
        if (gap.toY < gap.fromY) {
            gap.toY = gap.fromY;
        }
        for (var xIndex = gap.fromX; xIndex <= gap.toX; xIndex++) {
            for (var yIndex = gap.fromY; yIndex <= gap.toY; yIndex++) {
                if (this.grid[xIndex][yIndex] == "fill") {
                    this.grid[xIndex][yIndex] = null;
                }
            }
        }
    },

    onTitleClick: function(text, pointer) {
        this.state.start("Game");
    },

    onGunClick: function (gun, pointer) {
        if (this.gameState.finished || this.gameState.firing) {
            return;
        }
        if (this.pointer != null && this.pointer.alive) {
            this.pointer.kill();
        }
        this.sound.play("laser");
        this.pellet = this.add.sprite(gun.x, gun.y, "pellet");
        this.pellet.anchor.setTo(0.5, 0.5);
        this.pellet.lastMirror = null;
        this.physics.arcade.enable(this.pellet);
        this.pellet.enableBody = true;
        var vx = 0;
        var vy = 0;
        switch (gun.dir) {
            case "right":
                vx = this.pelletSpeed;
                break;
            case "up":
                vy = -this.pelletSpeed;
                break;
            case "left":
                vx = -this.pelletSpeed;
                break;
            case "down":
                vy = this.pelletSpeed;
        }
        this.pellet.body.velocity.x = vx;
        this.pellet.body.velocity.y = vy;
        this.gameState.firing = true;
    },

    hitTarget: function (pellet, target) {
        if (!target.alive || !pellet.alive) {
            return;
        }
        this.gameState.targetsLeft--;
        this.checkIsFinished();
        this.killPellet();
        target.animations.stop();
        this.sound.play("spark");
        var tween = this.add.tween(target).to({ alpha: 0.3 }, 50, Phaser.Easing.Linear.None, true, 0, 2, true).start();
        if (this.gameState.finished) {
            tween.onComplete.add(function () { this.loadNextLevel() }, this);
        }
        tween.onComplete.add(function () { target.kill(); });
    },

    hitStar: function (pellet, star) {
        if (!pellet.alive || star.hit) {
            return;
        }
        this.gameState.starsLeft--;
        this.checkIsFinished();
        
        this.switchStar(star, star.hitStar);
        if (this.gameState.finished) {
            var fanfare = this.add.audio("fanfare");
            fanfare.onStop.add(this.onFanfareEnd, this);
            fanfare.play();
        } else {
            this.sound.play("sparkle");
        }
    },

    onFanfareEnd: function(sound) {
        this.loadNextLevel();
    },

    switchStar: function(star, hitStar) {
        star.alpha = 0;
        star.hit = true;
        hitStar.alpha = 1;
        hitStar.hit = false;
    },

    checkIsFinished: function() {
        var allTargets = this.gameState.targetsLeft <= 0;
        var allStars = this.gameState.starsLeft <= 0;
        this.gameState.finished = allTargets && allStars;
    },

    loadNextLevel: function () {
        GameStates.Game.level++;
        if (GameStates.Game.level >= this.packData.levels.length) {
            GameStates.Game.level = 0;
            GameStates.Game.pack++;
        }
        if (GameStates.Game.pack >= this.gameData.packs.length) {
            GameStates.Game.pack = 0;
        }
        this.state.start("Game")
    },

    onBarrierClick: function (barrier, pointer) {
        if (this.gameState.finished || this.gameState.firing || barrier.rotating) {
            return;
        }
        barrier.rotating = true;
        var targetAngle = barrier.angle + 90;
        var tween = this.add.tween(barrier).to({ angle: targetAngle }, 400, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(function () {
            this.rotating = false;
            switch (barrier.dir) {
                case "h":
                    barrier.dir = "v";
                    break;
                case "v":
                    barrier.dir = "h";
                    break;
            }
        }, barrier);
    },

    hitBarrier: function (pellet, barrier) {
        if ((pellet.body.velocity.x != 0 && barrier.dir == "v") || (pellet.body.velocity.y != 0 && barrier.dir == "h")) {
            var tween = this.add.tween(barrier);
            tween.to({ alpha: 0.7 }, 70, "Linear").to({ alpha: 1.0 }, 70, "Linear").start();
            this.killPellet();
            this.sound.play("click");
        }
    },

    hitTile: function (pellet, tile) {
        this.killPellet();
        this.sound.play("click");
    },

    onMirrorClick: function (mirror, pointer) {
        if (this.gameState.finished || this.gameState.firing || mirror.rotating) {
            return;
        }
        mirror.rotating = true;
        var targetAngle = mirror.angle + 90;
        var tween = this.add.tween(mirror).to({ angle: targetAngle }, 400, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(function () {
            this.rotating = false;
            switch (mirror.dir) {
                case "bl":
                    mirror.dir = "tl";
                    break;
                case "br":
                    mirror.dir = "bl";
                    break;
                case "tl":
                    mirror.dir = "tr";
                    break;
                case "tr":
                    mirror.dir = "br";
                    break;
            }
        }, mirror);
    },

    hitMirror: function (pellet, mirror) {
        if (this.pellet.lastMirror == mirror) {
            return;
        }
        // Hateful hacks because I don't understand why things aren't centred properly
        var diffX = -8;
        var diffY = -8;
        if (pellet.body.velocity.y > 0) {
            diffX = -8;
        }
        if (pellet.body.velocity.y < 0) {
            diffX = -8;
        }
        var dx = Math.abs(mirror.body.x - (pellet.body.x + diffX));
        var dy = Math.abs(mirror.body.y - (pellet.body.y + diffY));
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        //3 seems 'good enough'
        if (dist < 3) {
            this.pellet.lastMirror = mirror;
            var tween = this.add.tween(mirror);
            tween.to({ alpha: 0.7 }, 70, "Linear").to({ alpha: 1.0 }, 70, "Linear").start();
            switch (mirror.dir) {
                case "bl":
                    if (pellet.body.velocity.x > 0) {
                        this.bouncePellet(0, this.pelletSpeed);
                    } else if (pellet.body.velocity.y < 0) {
                        this.bouncePellet(-this.pelletSpeed, 0);
                    } else {
                        this.killPellet();
                        this.push(mirror, pellet.body.velocity.x, pellet.body.velocity.y);
                    }
                    break;
                case "br":
                    if (pellet.body.velocity.x < 0) {
                        this.bouncePellet(0, this.pelletSpeed);
                    } else if (pellet.body.velocity.y < 0) {
                        this.bouncePellet(this.pelletSpeed, 0);
                    } else {
                        this.killPellet();
                        this.push(mirror, pellet.body.velocity.x, pellet.body.velocity.y);
                    }
                    break;
                case "tl":
                    if (pellet.body.velocity.x > 0) {
                        this.bouncePellet(0, -this.pelletSpeed);
                    } else if (pellet.body.velocity.y > 0) {
                        this.bouncePellet(-this.pelletSpeed, 0);
                    } else {
                        this.killPellet();
                        this.push(mirror, pellet.body.velocity.x, pellet.body.velocity.y);
                    }
                    break;
                case "tr":
                    if (pellet.body.velocity.x < 0) {
                        this.bouncePellet(0, -this.pelletSpeed);
                    } else if (pellet.body.velocity.y > 0) {
                        this.bouncePellet(this.pelletSpeed, 0);
                    } else {
                        this.killPellet();
                        this.push(mirror, pellet.body.velocity.x, pellet.body.velocity.y);
                    }
                    break;
            }
        }
    },

    hitBlock: function (pellet, block) {
        var tween = this.add.tween(block);
        this.killPellet();
        this.push(block, pellet.body.velocity.x, pellet.body.velocity.y);
    },

    push: function(thing, vx, vy) {
        var dx = 0;
        var dy = 0;
        if (vx > 0) {
            dx = 1;
        }
        if (vx < 0) {
            dx = -1;
        }
        if (vy > 0) {
            dy = 1;
        }
        if (vy < 0) {
            dy = -1;
        }
        var tx = thing.gridX + dx;
        var ty = thing.gridY + dy;
        if (tx < 0 || tx > this.gameData.size.width) {
            console.log("Cannot push out of bounds: " + tx + "," + ty);
            this.sound.play("click");
            return;
        }
        if (ty < 0 || ty > this.gameData.size.height) {
            console.log("Cannot push out of bounds: " + tx + "," + ty);
            this.sound.play("click");
            return;
        }
        
        if (this.grid[tx][ty] != null) {
            console.log(tx + "," + ty + " is obstructed");
            this.sound.play("click");
            return;
        }
        this.grid[thing.gridX][thing.gridY] = null;
        this.grid[tx][ty] = thing;
        thing.gridX = tx;
        thing.gridY = ty;
        var tBodyX = thing.body.x + (this.gridSize * dx);
        var tBodyY = thing.body.y + (this.gridSize * dy);
        var tween = this.add.tween(thing.body);
        tween.to({ x: tBodyX, y: tBodyY }, 150, Phaser.Easing.Quadratic.Out).start();
        this.sound.play("grind");
    },

    bouncePellet: function (xv, yv) {
        this.pellet.body.velocity.x = xv;
        this.pellet.body.velocity.y = yv;
        this.sound.play("beep");
    },

    killPellet: function () {
        this.pellet.kill();
        this.gameState.firing = false;
        this.resetStars();
    },

    resetStars: function () {
        this.gameState.starsLeft = this.stars.children.length;
        this.gameState.starsLeft = this.stars.children.length;
        for (var index = 0; index < this.stars.children.length; index++) {
            var star = this.stars.children[index];
            if (star.hit) {
                this.switchStar(star.hitStar, star);
            }
        }
    },

    getLevelProperty: function(name, packFallback) {
        var hasProperty = this.levelData.hasOwnProperty(name);
        if (hasProperty) {
            return this.levelData[name];
        }
        if (!packFallback) {
            return null;
        }
        hasProperty = this.packData.hasOwnProperty(name);
        if (hasProperty) {
            return this.packData[name];
        }
        return "";
    },

    create: function () {
        // Init particles
        var gunEffect = this.add.bitmapData(4, 4);
        var gradient = gunEffect.ctx.createRadialGradient(2, 2, 0, 2, 2, 2);

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        gunEffect.context.fillStyle = gradient;
        gunEffect.context.fillRect(0, 0, 4, 4);
        this.cache.addBitmapData("gunEffect", gunEffect);

        // Data
        this.gameData = this.cache.getJSON("gamedata");
        var currpack = this.gameData.packs[GameStates.Game.pack];
        var pack = this.gameData.packs[GameStates.Game.pack].file;
        this.packData = this.cache.getJSON(pack);
        this.levelData = this.packData.levels[GameStates.Game.level];

        // Music
        var trackName = this.getLevelProperty("music", true);
        var hasMusic = trackName != "";
        var currentlyPlaying = GameStates.Game.music != null;
        var sameTrack = currentlyPlaying && (trackName == GameStates.Game.music.key);
        // Should stop current track?
        if (currentlyPlaying && !sameTrack) {
            GameStates.Game.music.stop();
        }
        // No more music?
        if (currentlyPlaying && !hasMusic) {
            GameStates.Game.music = null;
        }
        // Start new track?
        if (hasMusic && !sameTrack) {
            GameStates.Game.music = this.add.audio(trackName);
            GameStates.Game.music.loop = true;
            GameStates.Game.music.play();
        }
        
        // Grid
        this.grid = [];
        var xIndex = 0;
        var yIndex = 0;
        for (xIndex = 0; xIndex <= this.gameData.size.width; xIndex++) {
            var inner = [];
            for (yIndex = 0; yIndex <= this.gameData.size.height; yIndex++) {
                inner.push(null);
            }
            this.grid.push(inner);
        }
        this.gameState = {
            firing: false,
            finished: false,
            targetsLeft: 0,
            starsLeft: 0,
            fireCount: 0
        }

        // Init physics
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // Config
        this.pelletSpeed = 256;

        // Layout
        this.offsetX = 16;
        this.offsetY = 44;
        this.gridSize = 32;
        this.gameArea = new Phaser.Rectangle(17, 45, 770, 545);

        // Grid
        var gridFile = this.getLevelProperty("image", true);
        var grid = this.add.image(0, 0, gridFile);

        // Mirrors
        this.mirrors = this.add.group();
        this.physics.arcade.enable(this.mirrors);
        this.mirrors.enableBody = true;
        if (this.levelData.hasOwnProperty("mirrors")) {
            for (var mirrorIndex = 0; mirrorIndex < this.levelData.mirrors.length; mirrorIndex++) {
                var mirror = this.levelData.mirrors[mirrorIndex];
                this.makeMirror(mirror.x, mirror.y, mirror.dir);
            }
        }

        // Barriers
        this.barriers = this.add.group();
        this.physics.arcade.enable(this.barriers);
        this.barriers.enableBody = true;
        if (this.levelData.hasOwnProperty("barriers")) {
            for (var barrierIndex = 0; barrierIndex < this.levelData.barriers.length; barrierIndex++) {
                var barrier = this.levelData.barriers[barrierIndex];
                this.makeBarrier(barrier.x, barrier.y, barrier.dir);
            }
        }

        // Blocks
        this.blocks = this.add.group();
        this.physics.arcade.enable(this.blocks);
        this.blocks.enableBody = true;
        if (this.levelData.hasOwnProperty("blocks")) {
            for (var blockIndex = 0; blockIndex < this.levelData.blocks.length; blockIndex++) {
                var block = this.levelData.blocks[blockIndex];
                this.makeBlock(block.x, block.y);
            }
        }

        // Guns
        this.guns = this.add.group();
        for (var gunIndex = 0; gunIndex < this.levelData.guns.length; gunIndex++) {
            var gun = this.levelData.guns[gunIndex];
            this.makeGun(gun.x, gun.y, gun.dir);
        }

        // Targets
        this.targets = this.add.group();
        this.physics.arcade.enable(this.targets);
        this.targets.enableBody = true;
        if (this.levelData.hasOwnProperty("targets")) {
            for (var targetIndex = 0; targetIndex < this.levelData.targets.length; targetIndex++) {
                var target = this.levelData.targets[targetIndex];
                this.makeTarget(target.x, target.y);
            }
        }

        // Stars
        this.stars = this.add.group();
        this.hitStars = this.add.group();
        this.physics.arcade.enable(this.stars);
        this.stars.enableBody = true;
        if (this.levelData.hasOwnProperty("stars")) {
            for (var starIndex = 0; starIndex < this.levelData.stars.length; starIndex++) {
                var star = this.levelData.stars[starIndex];
                this.makeStar(star.x, star.y);
            }
        }

        // Fill mode
        this.tiles = this.add.group();
        this.physics.arcade.enable(this.tiles);
        this.tiles.enableBody = true;
        if (this.levelData.hasOwnProperty("mode") && this.levelData.mode == "filled") {

            for (xIndex = 0; xIndex <= this.gameData.size.width; xIndex++) {
                for (yIndex = 0; yIndex <= this.gameData.size.height; yIndex++) {
                    if (this.grid[xIndex][yIndex] == null) {
                        this.grid[xIndex][yIndex] = "fill";
                    }
                }
            }
            if (this.levelData.hasOwnProperty("gaps")) {
                for (var gapIndex = 0; gapIndex < this.levelData.gaps.length; gapIndex++) {
                    var gap = this.levelData.gaps[gapIndex];
                    this.setGap(gap);
                }
            }
            for (xIndex = 0; xIndex <= this.gameData.size.width; xIndex++) {
                for (yIndex = 0; yIndex <= this.gameData.size.height; yIndex++) {
                    if (this.grid[xIndex][yIndex] == "fill") {
                        this.makeTile(xIndex, yIndex);
                    }
                }
            }
        }

        // Pointer
        if (this.levelData.hasOwnProperty("hint")) {
            this.pointer = this.makePointer(this.levelData.hint.x, this.levelData.hint.y);
        } else {
            this.pointer = null;
        }

        // UI
        var title = this.add.text(598, 6, "Pew Pew Pew", { fontSize: "28px", fill: "#FFF" });
        var levelName = this.add.text(46, 6, "Level " + (1 + GameStates.Game.level) + ": " + this.levelData.title, { fontSize: "28px", fill: "#FFF" });
        var reload = this.add.image(16, 12, "reload");
        reload.scale.setTo(0.75, 0.75);
        reload.alpha = 0.7;
        reload.inputEnabled = true;
        reload.input.useHandCursor = true;
        reload.events.onInputUp.add(this.onTitleClick, this);
    },

    update: function () {
        if (this.gameState.firing) {
            // Check for target hits
            this.physics.arcade.overlap(this.pellet, this.targets, this.hitTarget, null, this);
            if (!this.gameState.firing || this.gameState.finished) {
                return;
            }

            // Pellet is out of bounds - kill it
            if (this.pellet.alive && !Phaser.Rectangle.containsRect(this.pellet.body, this.gameArea)) {
                this.killPellet();
            }
            if (!this.gameState.firing) {
                return;
            }

            // Check for object hits
            this.physics.arcade.overlap(this.pellet, this.mirrors, this.hitMirror, null, this);
            this.physics.arcade.overlap(this.pellet, this.stars, this.hitStar, null, this);
            this.physics.arcade.overlap(this.pellet, this.barriers, this.hitBarrier, null, this);
            this.physics.arcade.overlap(this.pellet, this.blocks, this.hitBlock, null, this);
            this.physics.arcade.overlap(this.pellet, this.tiles, this.hitTile, null, this);
        }
    },

    render: function () { },

};
