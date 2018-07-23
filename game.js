var Neuvol;
var game;
var FPS = 20;
var maxScore=0;
var size = 10;
var initBody = 20;

var images = {};

var speed = function(fps){
	FPS = parseInt(fps);
}

var isCollision = function(snake){
	//test collision with body
	for (step = 0; step < snake.body.length-1; step++) {
		if (snake.head.x < snake.body[step].x + snake.body[step].width  && snake.head.x + snake.head.width  > snake.body[step].x &&
				snake.head.y < snake.body[step].y + snake.body[step].height && snake.head.y + snake.head.height > snake.body[step].y) {
			return true;
		}
	}
}

var isEatApple = function(game){

	//test head collision with apple
	if (game.snake.head.x < game.apple.x + game.apple.width  && game.snake.head.x + game.snake.head.width  > game.apple.x &&
			game.snake.head.y < game.apple.y +game.apple.height && game.snake.head.y + game.snake.head.height > game.apple.y) {
		console.log("eaten!", game.snake.body.length);
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

	//Update score
	this.score += 1;

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

Snake.prototype.isDead = function(height, width){
	// Die if you go outside the canvas
	if((this.head.y >= height) || (this.head.y + this.head.height <= 0)){
		return true;
	}
	if(this.head.x >= width || this.head.x + this.head.width <= 0){
		return true;
	}
	//Die if you hit your body
	if(isCollision(this)){
		return true;
	}
}

var Game = function(){
	this.snake = new Snake();
	this.canvas = document.querySelector("#playground");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.apple = new Apple();
	this.apple.x = Math.round(Math.random() * this.width / this.apple.width) * this.apple.width;
	this.apple.y = Math.round(Math.random() * this.width / this.apple.height) * this.apple.height;
}


Game.prototype.update = function(){
	if(this.snake.isDead(this.height, this.width)){
			this.snake.alive = false;
			FPS = 0;
			console.log("dead");
	} else {
		this.snake.update();
	}

	//Grow if you eat an apple
	if(isEatApple(this)){
		this.snake.grow();
	}

	var self = this;

	if(FPS == 0){

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

	//Snake
	this.ctx.fillStyle = "#ff2000";
	this.ctx.fillRect(this.snake.head.x, this.snake.head.y, this.snake.head.width, this.snake.head.height);
	for(var i in this.snake.body){
		this.ctx.fillRect(this.snake.body[i].x, this.snake.body[i].y, this.snake.body[i].width, this.snake.body[i].height);
	}

	//Apple
	this.ctx.fillRect(this.apple.x, this.apple.y, this.apple.width, this.apple.height);


	this.ctx.fillStyle = "white";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ this.snake.score, 10, 25);
	this.ctx.fillText("Eaten : "+ (this.snake.eaten), 10, 50);


	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}

window.onload = function(){

	var start = function(){
		console.log("loaded");
		game = new Game();

		// Controler
		window.onkeydown = function(e) {
		   var key = e.keyCode ? e.keyCode : e.which;
			 //console.log(key);
			 if (key == 40) { //down
				 game.snake.yturn(1);
			 } else if (key == 38) {
				 game.snake.yturn(-1);
			 } else if (key == 39) {
				 game.snake.xturn(1);
			 } else if (key == 37) {
				 game.snake.xturn(-1);
			 }
		 }

	 game.update();
	 game.display();

	}

	start();

}
