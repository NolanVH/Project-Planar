/*
	This scene displays the intro gameplay instructions and controls and then
	launches the main game scene when a click input is detected
 */

class IntroScene extends Phaser.Scene {
	constructor() {
		super({ key: 'IntroScene'});
	}

	preload() {
		this.load.image('introImage', 'assets/infoBackground.jpg');
		this.load.image('monkey', 'assets/monkey.png');
		this.load.image('redBanana', 'assets/redBanana.png');
		this.load.image('blueBanana', 'assets/blueBanana.png');
		this.load.image('purpleBanana', 'assets/purpleBanana.png');
		this.load.image('yellowBanana', 'assets/yellowBanana.png');
		this.load.image('poop', 'assets/poop.png');
	}

	create() {
		let displayWidth = 1400;
		const self = this;
		const bg = this.add.sprite(0, 0, 'introImage');
		bg.setOrigin(0,0);
		bg.setScale(1);
		self.add.text(displayWidth/2, 5, "Project Planar", { font: '50px Arial'}).setOrigin(0.5, 0);
		self.add.text(displayWidth/2, 100, "Welcome to Project Planar!\n",
			{ font: '32px Arial'}).setOrigin(0.5, 0);
		self.add.text(displayWidth/2, 150, "The objective of this game is to kill other monkeys by throwing poop at them\n",
			{ font: '32px Arial'}).setOrigin(0.5, 0);
		self.add.text(125 , 250,
			"Use WASD to move and click the left mouse to shoot\n\n" +
			"The yellow banana is a speed boost\n\n" +
			"The blue banana is extra health\n\n" +
			"The red banana increases your fire rate\n\n" +
			"The purple banana teleports you to a random location\n",
			{ font: '32px Arial' });
		self.add.sprite(1100, 400, 'monkey').setOrigin(0.5, 0.5).setDisplaySize(150, 150);
		self.add.sprite(1175, 355, 'yellowBanana').setOrigin(0.5, 0.5).setDisplaySize(75, 75);
		self.add.sprite(1025, 350, 'poop').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
		self.add.sprite(65, 335, 'yellowBanana').setOrigin(0.5, 0.5).setDisplaySize(75, 75);
		self.add.sprite(65, 400, 'blueBanana').setOrigin(0.5, 0.5).setDisplaySize(75, 75);
		self.add.sprite(65, 475, 'redBanana').setOrigin(0.5, 0.5).setDisplaySize(75, 75);
		self.add.sprite(65, 545, 'purpleBanana').setOrigin(0.5, 0.5).setDisplaySize(75, 75);
		self.add.text(displayWidth/2, 700, "Good Luck!", { font: '50px Arial'}).setOrigin(0.5, 0);
		self.add.text(displayWidth/2, 800, "Click left mouse to continue...", { font: '32px Arial'}).setOrigin(0.5, 0);
		this.input.once('pointerup', function () {
			this.scene.launch('Game');
		}, this);
	}
}

export default IntroScene;