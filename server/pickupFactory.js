function PickupFactory(self) {
	let thisItem;
	this.spawnItem = function(type) {
		let item;
		if (type === "health") {
			item = new healthItem();
		}
		else if (type === "damage") {
			item = new damageItem();
		}
		else if (type === "teleport") {
			item = new teleportItem();
		}
		else if (type === "speed") {
			item = new speedItem();
		}

		item.type = type;
		console.log("image: " + item.image);
		let x = Math.floor(Math.random() * (displayWidth - 100)) + 20;
		let y = Math.floor(Math.random() * (displayHeight - 100)) + 20;
		const physicsItem = self.physics.add.image(x, y, item.image).setOrigin(0.5, 0.5).setDisplaySize(35, 35);
		physicsItem.type = type;
		self.items.add(physicsItem);
		if(item.modifier2) {
			thisItem = {
				x: x,
				y: y,
				type: type,
				image: item.image,
				modifier: item.modifier,
				modifier2: item.modifier2
			}
		} else {
			thisItem = {
				x: x,
				y: y,
				type: type,
				image: item.image,
				modifier: item.modifier
			}
		}
		return thisItem;
	}
}

let healthItem = function() {
	this.image = 'blueBanana';
	this.modifier = 2;
}

let damageItem = function() {
	this.image = 'redBanana';
	this.modifier = 1.5;
}

let teleportItem = function() {
	this.image = 'purpleBanana';
	this.modifier = Math.floor(Math.random() * displayWidth - 100) + 20;
	this.modifier2 = Math.floor(Math.random() * displayHeight - 100) + 20;
}

let speedItem = function() {
	this.image = 'yellowBanana';
	this.modifier = 1.5;
}