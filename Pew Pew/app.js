window.onload = function () {
    // -- Particle effects --------------------
    GunParticle = function (game, x, y) {

        Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData('gunEffect'));

    };
    GunParticle.prototype = Object.create(Phaser.Particle.prototype);
    GunParticle.prototype.constructor = GunParticle;
    // ----------------------------------------

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

    //  Add the States your game has.
    game.state.add('Boot', GameStates.Boot);
    game.state.add('Preloader', GameStates.Preloader);
    game.state.add('Game', GameStates.Game);

    //  Now start the Boot state.
    game.state.start('Boot');

};