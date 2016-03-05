// Preloader will load all of the assets like graphics and audio
GameStates.Preloader = function (game) {
    this.preloadBar = null;
}

GameStates.Preloader.prototype = {
    preload: function () {
        // common to add a loading bar sprite here...
        this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        // Animations
        this.load.spritesheet('gun', 'assets/animations/cannon.png', 30, 30);
        this.load.spritesheet('target', 'assets/animations/ghost.png', 30, 30);
        // Images
        this.load.image('gridblue', 'assets/images/Grid_blue.png');
        this.load.image('gridgreen', 'assets/images/Grid_green.png');
        this.load.image('gridred', 'assets/images/Grid_red.png');

        // Sprites
        this.load.image('pellet', 'assets/sprites/Pellet.png');
        this.load.image('mirror', 'assets/sprites/Mirror.png');
        this.load.image('barrier', 'assets/sprites/Barrier.png');
        this.load.image('block', 'assets/sprites/Block.png');
        this.load.image('tile', 'assets/sprites/Tile.png');
        this.load.image('star', 'assets/sprites/Star.png');
        this.load.image('happystar', 'assets/sprites/Star_happy.png');
        this.load.image('pointer', 'assets/sprites/Pointer.png');

        // UI Elements
        this.load.image('reload', 'assets/gui/Reload.png');

        // Audio
        this.load.audio('laser', 'assets/sounds/laser.ogg');
        this.load.audio('beep', 'assets/sounds/beep.ogg');
        this.load.audio('click', 'assets/sounds/click.ogg');
        this.load.audio('grind', 'assets/sounds/grind.ogg');
        this.load.audio('fanfare', 'assets/sounds/fanfare.ogg');
        this.load.audio('sparkle', 'assets/sounds/sparkle.ogg');
        this.load.audio('spark', 'assets/sounds/spark.ogg');

        // Music
        this.load.audio('track1', 'assets/music/Track 1.ogg');

        // Levels
        var packs = this.cache.getJSON("gamedata").packs;
        for (var index = 0; index < packs.length; index++) {
            this.load.json(packs[index].file, 'assets/data/' + packs[index].file + '.json');
        }
    },

    create: function () {
        this.state.start('Game');
    }
};