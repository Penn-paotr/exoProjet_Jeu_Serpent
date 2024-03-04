window.onload = function()  // attention bien écrire window et non windows
{
    let canvasWidth = 900;
    let canvasHeight = 600;
    let blockSize = 30;
    let ctx;
    let delay = 150;  // tps donnée en millisecondes
    let snakee;  // snakee sera un array, mais est déclaré en-dehors de init, donc pas const mais let
    let applee;
    let widthInBlocks = canvasWidth / blockSize;
    let heightInBlocks = canvasHeight / blockSize;
    let score;
    let timeOut;


    function init() {
        let canvas = document.createElement('canvas');       //  method
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid grey";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);                //  method
        ctx = canvas.getContext('2d'); // méthode pour définir le contexte du canvas pour pouvoir dessiner  
        snakee = new drawSnake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right");
        applee = new drawApple([10,10]);
        score = 0;
        refreshCanvas();
    };    
    function refreshCanvas() {
        snakee.advance();
        if(snakee.checkCollision()) {
            gameOver();
        } else {
            if(snakee.isEatingApple(applee)) {
                score ++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while(applee.isOnSnake(snakee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            timeOut = setTimeout(refreshCanvas,delay);       //  method pour indexer refreshCanvas sur un timing
        };
    };

    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.strokeText("Game Over",centreX, centreY -180);
        ctx.fillText("Game Over",centreX, centreY -180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer",centreX, centreY -120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer",centreX, centreY -120);
        ctx.restore();
    };
    
    function restart() {
        snakee = new drawSnake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right");
        applee = new drawApple([10,10]);
        score = 0;
        clearTimeout(timeOut);  // pour éviter "bug" si press backSpace alors que pas game over, il faut empêcher la multiplication des refreshcanvas dans un même temps
        refreshCanvas();
    };
    function drawScore(){
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "grey";
        ctx.texAlign = "center";
        ctx.textBaseline = "middle";
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    };

    function drawBlock(ctx, position) {
        let x = position[0] * blockSize;
        let y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);       //  method
    };

    function drawSnake(littleBody, direction) {
        this.littleBody = littleBody;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function() {                                // constructor
            ctx.save();                                         //  method
            ctx.fillStyle = "#ff0000";
            for(let i = 0; i < this.littleBody.length; i++){
                drawBlock(ctx, this.littleBody[i]);
            };
            ctx.restore();                                      //  method
        };
        this.advance = function() {                             // constructor
            let nextPosition = this.littleBody[0].slice();
            switch(this.direction) {
                case "left":
                    nextPosition[0] -= 1; 
                    break;
                case "right":
                    nextPosition[0] += 1;  // <=> nextPosition[0] ++;
                    break;
                case "down":
                    nextPosition[1] -= 1;                 
                    break;                        
                case "up":
                    nextPosition[1] += 1; 
                    break;
                default:
                    throw("Invalid Direction");
            };       
            this.littleBody.unshift(nextPosition);
            if(!this.ateApple) {
            this.littleBody.pop();
            } else {
                this.ateApple = false;
            }
        };
        this.setDirection = function(newDirection) {              // constructor 
            let allowedDirections;
            switch(this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];         //  array à 2 valeurs, donc que 2 index = 0 et 1;  en-dessous et au-delà index = -1
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];      //  array à 2 valeurs, donc que 2 index = 0 et 1;  en-dessous et au-delà index = -1        
                    break;  
                default:
                    throw("Invalid Direction");      
            };
            if(allowedDirections.indexOf(newDirection) > -1) {        //  si la valeur de la direction est hors cas prévu dans array, alors l'index retourné sera -1
                this.direction = newDirection;
            };
        };
        this.checkCollision = function() {
            let wallCollision = false;    // initialisation à false évite retour de la variable par une fonction sans avoir été manipulée
            let snakeCollision = false;
            let head = this.littleBody[0];
            let rest = this.littleBody.slice(1);      // slice va copier les valeurs des index [1] et [2] de l'array littleBody 
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            };
            for(let i = 0; i < rest.length; i++) {
                if(snakeX === rest[i][0] && snakeY === rest[i][1]) {  // <=> si le X de head === le X du iblock de rest && si idem pour Y
                    snakeCollision = true;
                } 
            };
            return wallCollision || snakeCollision   // implicitement seul le boolean true sera retrouné. d'où initialisation à false.
        }; 
        this.isEatingApple = function(appleToEat) {
            let head = this.littleBody[0];
            if(head[0] === appleToEat.position[0]  && head[1] === appleToEat.position[1]) {
                return true;
            } else {
                return false;
            };
        };

    }; 

    function drawApple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            let radius = blockSize / 2;
            let x = this.position[0] * blockSize + radius;
            let y = this.position[1] * blockSize + radius;
            ctx.arc(x,y,radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function() {
            let newX = Math.round(Math.random() * (widthInBlocks - 1));
            let newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck) {
            let isOnSnake = false;
            for( let i= 0; i< snakeToCheck.littleBody.length; i++) {
                if(this.position[0] === snakeToCheck.littleBody[i][0] && this.position[1] === snakeToCheck.littleBody[i][1]) {
                    isOnSnake = true;
                };
                return isOnSnake;
            };
        };
    };
    
    
    init();
 
    document.onkeydown = function handleKeyDown(e) {  // method onkeydown
        let key = e.key;
        let newDirection;
        switch(key) {            // analyse des sous-possibilités d'événements lors de l'événement document.onkeydown
            case "ArrowLeft":
                newDirection = "left"; 
                break;
            case "ArrowRight":
                newDirection = "right"; 
                break;
            case "ArrowUp":
                newDirection = "down";  // avec clavier Logitech inversion
                break;
            case "ArrowDown":
                newDirection = "up";   // avec clavier Logitech inversion
                break;
            case "Backspace":  // avec clavier Logitech, Spacebar ne fonctionne pas
                restart();
                return;
            default:
                return;             // si return, alors pas de valeur dans newDirection, et donc pas d'éxécution avec param newDirection
        };
        snakee.setDirection(newDirection);  // 
    };
}
