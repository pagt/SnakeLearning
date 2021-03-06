(function() {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();

var Neuvol;
var game;
var FPS = 20;
var maxScore=0;
var size = 10;
var initBody = 5;

var images = {};

var speed = function(fps){
	FPS = parseInt(fps);
}

var isCollision = function(snake, canvasHeight, canvasWidth){
	//test collision with body
	for (step = 0; step < snake.body.length-1; step++) {
		if (snake.head.x < snake.body[step].x + snake.body[step].width  && snake.head.x + snake.head.width  > snake.body[step].x &&
				snake.head.y < snake.body[step].y + snake.body[step].height && snake.head.y + snake.head.height > snake.body[step].y) {
			return true;
		}
	}
	//test collision with border
	// Die if you go outside the canvas
	if((snake.head.y >= canvasHeight) || (snake.head.y + snake.head.height <= 0)){
		return true;
	}
	if(snake.head.x >= canvasWidth || snake.head.x + snake.head.width <= 0){
		return true;
	}
}

var isEatApple = function(snake, apple){

	//test head collision with apple
	if (snake.head.x < apple.x + apple.width  && snake.head.x + snake.head.width  > apple.x &&
			snake.head.y < apple.y +apple.height && snake.head.y + snake.head.height > apple.y) {
		console.log("eaten!", snake.body.length);
		return true;
	}

}

var Apple = function(json){
	this.x = 0;
	this.y = 0;
	this.width = size;
	this.height = size;

	this.init(json);
}

Apple.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

var Head = function(json){
	this.x = 0;
	this.y = 0;
	this.width = size;
	this.height = size;

	this.init(json);
}

Head.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}


var Body = function(json){
	this.x = 0;
	this.y = 0;
	this.width = size;
	this.height = size;

	this.init(json);
}

Body.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

var Snake = function(json){
	this.head = new Head();
	this.body = []; //body is reversed : tail first element
	this.alive = true;
	this.xdirect = 1;
	this.ydirect = 0;
	this.score = 0;
	this.eaten = 0;
	this.growCount = initBody + 2;// counter used for growth, should be > snake init size

	for(i = 0; i < initBody; i++) {
		var b = new Body();
		//tail is first
		b.x = -(initBody-i) * b.width;
		b.y = 0;
		this.body.push(b);
	}
	this.init(json);
}

Snake.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Snake.prototype.xturn = function(val){
	//cannot go backward
	if(this.xdirect != -val){
		this.xdirect = val;
		this.ydirect = 0;
	}
}

Snake.prototype.yturn = function(val){
	if(this.ydirect != -val){
		this.ydirect = val;
		this.xdirect = 0;
	}
}

Snake.prototype.grow = function(){
	this.growCount = 1;
	this.eaten += 1;

	//bonus for eating
	this.score += 10;
}

Snake.prototype.update = function(){
	//get tail info (used for grow)
	tailX = this.body[0].x;
	tailY = this.body[0].y;

	//update Body
	for (step = 0; step < this.body.length-1; step++) {
		this.body[step].x = this.body[step+1].x;
		this.body[step].y = this.body[step+1].y;
	}
	this.body[this.body.length-1].x = this.head.x;
	this.body[this.body.length-1].y = this.head.y;

	//update head
	this.head.x += this.head.width * this.xdirect ;
	this.head.y += this.head.height * this.ydirect ;

	//Grow if have eaten Apple
	if (this.growCount == this.body.length + 1) {
		//grow
		console.log("grown");
		var b = new Body();
		b.x = tailX;
		b.y = tailY;
		//tail is first element in body array
		this.body.unshift(b);
		this.growCount = this.body.length + 2; // should be > size of snake
	}

	//Growth counter
	this.growCount += 1;
}

Snake.prototype.updateScore = function(apple){
	/*
	//Simple scoring
	this.score += 1;
	*/

	//Complex scoring : for pushing exploration
	//+1 if goes toward food
	//-0.5 if not
	if (this.head.x < apple.x) {
		//food is to the right
		if (this.xdirect > 0) {
			this.score += 1;
		} else {
			this.score -= 0.5;
		}
	} else {
		//food is to the left
		if (this.xdirect < 0) {
			this.score += 1;
		} else {
			this.score -= 0.5;
		}
	}

	if (this.head.y < apple.y) {
		//apple is underneath
		if (this.ydirect > 0) {
			this.score += 1;
		} else {
			this.score -= 0.5;
		}
	} else {
		//food is to the top
		if (this.ydirect < 0) {
			this.score += 1;
		} else {
			this.score -= 0.5;
		}
	}
}

Snake.prototype.isDead = function(height, width){

	//Die if you hit your body or the canvas border
	if(isCollision(this, height, width)){
		return true;
	}
}

var Game = function(){
	this.snakes = [];
	this.canvas = document.querySelector("#playground");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.apple = new Apple();
	this.apple.x = Math.round(Math.random() * this.width / this.apple.width) * this.apple.width;
	this.apple.y = Math.round(Math.random() * this.width / this.apple.height) * this.apple.height;
	this.spawnInterval = 90;
	this.interval = 0;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;
	this.maxScore = 0;
}

Game.prototype.start = function(){
	this.interval = 0;
	this.snakes = [];
	this.currentMaxScore = 0;
	this.gen = Neuvol.nextGeneration();
	for(var i in this.gen){
		var s = new Snake();
		this.snakes.push(s);
	}
	console.log("started");

	this.generation++;
	this.alives = this.snakes.length;
}

Game.prototype.isItEnd = function(){
	for(var i in this.snakes){
		if(this.snakes[i].alive){
			return false;
		}
	}
	return true;
}

Game.prototype.update = function(){


	for(var i in this.snakes){
		if(this.snakes[i].alive){

			//The inputs are safe area around me + food location (up/down/left/right)
			//It is labelled as unsafe to go backward

			//Hit left key safe ?
			//Fake an update on Head
			this.snakes[i].head.x += this.snakes[i].head.width * (-1) ;
			//Assess safety
			if(isCollision(this.snakes[i], this.height, this.width) || this.snakes[i].xdirect == 1){
				leftSafe = 0;
			} else {
				leftSafe = 1;
			}
			//Reset Head
			this.snakes[i].head.x -= this.snakes[i].head.width * (-1) ;

			//Hit right key safe ?
			//Fake an update on Head
			this.snakes[i].head.x += this.snakes[i].head.width * (1) ;
			//Assess safety
			if(isCollision(this.snakes[i], this.height, this.width) || this.snakes[i].xdirect == -1){
				rightSafe = 0;
			} else {
				rightSafe = 1;
			}
			//Reset Head
			this.snakes[i].head.x -= this.snakes[i].head.width * (1) ;

			//Hit down key safe ?
			//Fake an update on Head
			this.snakes[i].head.y += this.snakes[i].head.height * (1) ;
			//Assess safety
			if(isCollision(this.snakes[i], this.height, this.width) || this.snakes[i].ydirect == -1 ){
				downSafe = 0;
			} else {
				downSafe = 1;
			}
			//Reset Head
			this.snakes[i].head.y -= this.snakes[i].head.height * (1) ;

			//Hit up key safe ?
			//Fake an update on Head
			this.snakes[i].head.y += this.snakes[i].head.height * (-1) ;
			//Assess safety
			if(isCollision(this.snakes[i], this.height, this.width) || this.snakes[i].ydirect == 1){
				upSafe = 0;
			} else {
				upSafe = 1;
			}
			//Reset Head
			this.snakes[i].head.y -= this.snakes[i].head.height * (-1) ;

			if (this.snakes[i].head.x < this.apple.x) {
				//food is to the right
				foodRight = 1;
			} else {
				foodRight = 0;
			}
			if (this.snakes[i].head.y < this.apple.y) {
				//food is to the top
				foodTop = 1;
			} else {
				foodTop = 0;
			}

			var inputs = [
				leftSafe,
				rightSafe,
				upSafe,
				downSafe,
				foodRight,
				foodTop
			];

			//NN tells which key to press
			// res returns 4 float numbers : the max number gives the button to press
			var res = this.gen[i].compute(inputs);

			//find the maximum in res
			var indexOfMaxValue = res.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
			if (indexOfMaxValue == 0){
				game.snakes[i].yturn(1);
			} else if (indexOfMaxValue == 1) {
				game.snakes[i].yturn(-1);
			} else if (indexOfMaxValue == 2) {
				game.snakes[i].xturn(1);
			} else {
				game.snakes[i].xturn(-1);
			}

			this.snakes[i].update();
			this.snakes[i].updateScore(this.apple);

			if (i == 0){
				console.log(inputs);
			}

			//Grow if you eat an apple
			// UPDATE ALL APPLES
			if(isEatApple(this.snakes[i], this.apple)){
				this.snakes[i].grow();
				//this.apple.x = Math.round(Math.random() * this.width / this.apple.width) * this.apple.width;
				//this.apple.y = Math.round(Math.random() * this.width / this.apple.height) * this.apple.height;
			}

			this.currentMaxScore = (this.snakes[i].score > this.currentMaxScore) ? this.snakes[i].score : this.currentMaxScore;

			if(this.snakes[i].isDead(this.height, this.width)){
				this.snakes[i].alive = false;
				this.alives--;
				//console.log(i, this.snakes[i].score);
				Neuvol.networkScore(this.gen[i], this.snakes[i].score);
				this.maxScore = (this.snakes[i].score > this.maxScore) ? this.snakes[i].score : this.maxScore;
				if(this.isItEnd()){
					this.start();
				}
			}
		}
	}

	var self = this;

	if(FPS == 0){
		setZeroTimeout(function(){
			self.update();
		});
	}else{
		setTimeout(function(){
			self.update();
		}, 1000/FPS);
	}
}

Game.prototype.display = function(){
	this.ctx.clearRect(0, 0, this.width, this.height);

	this.ctx.fillStyle = "#d3d3d3";

	//Playground
	this.ctx.fillRect(0, 0, this.width, this.height);

	//snakes
	for(var i in this.snakes){
		if(this.snakes[i].alive){
			this.ctx.fillStyle = "#ff2000";
			this.ctx.fillRect(this.snakes[i].head.x, this.snakes[i].head.y, this.snakes[i].head.width, this.snakes[i].head.height);
			for(var j in this.snakes[i].body){
				this.ctx.fillRect(this.snakes[i].body[j].x, this.snakes[i].body[j].y, this.snakes[i].body[j].width, this.snakes[i].body[j].height);
			}
		}
	}

	//Apple
	this.ctx.fillRect(this.apple.x, this.apple.y, this.apple.width, this.apple.height);


	this.ctx.fillStyle = "white";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ this.currentMaxScore, 10, 25);
	this.ctx.fillText("Max Score : "+this.maxScore, 10, 50);
	this.ctx.fillText("Generation : "+this.generation, 10, 75);
	this.ctx.fillText("Alive : "+this.alives+" / "+Neuvol.options.population, 10, 100);


	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}


window.onload = function(){
	console.log("loaded");
	var start = function(){
		Neuvol = new Neuroevolution({
			population:50,
			network:[6, [2], 4],
		});
		game = new Game();
		game.start();
		game.update();
		game.display();

	}

	start();

}
