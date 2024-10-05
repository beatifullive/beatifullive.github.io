// Model
class GameModel {
    constructor() {
        this.score = 0;
        this.bird = {
            x: 50,
            y: 200,
            width: 30,
            height: 30,
            velocity: 0
        };
        this.pipes = [];
        this.gravity = 0.3; // 降低重力
        this.jumpStrength = -7; // 减小跳跃强度
        this.pipeSpeed = 1.5; // 新增管道移动速度
        this.pipeInterval = 200; // 新增管道生成间隔
        this.gameOver = false;
    }

    update() {
        if (this.gameOver) return;

        // 更新鸟的位置
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        // 生成新的管道
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.pipeInterval) {
            this.addPipe();
        }

        // 更新管道位置
        this.pipes.forEach(pipe => {
            pipe.x -= this.pipeSpeed;
        });

        // 移除屏幕外的管道
        this.pipes = this.pipes.filter(pipe => pipe.x > -pipe.width);

        // 检测碰撞
        if (this.checkCollision()) {
            this.gameOver = true;
        }

        // 更新得分
        this.updateScore();
    }

    addPipe() {
        const gap = 180; // 增加管道间隙
        const minHeight = 80; // 增加最小高度
        const maxHeight = 280; // 减小最大高度
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

        this.pipes.push({
            x: 400,
            y: 0,
            width: 50,
            height: height,
            passed: false
        });

        this.pipes.push({
            x: 400,
            y: height + gap,
            width: 50,
            height: 600 - height - gap,
            passed: false
        });
    }

    checkCollision() {
        // 检查鸟是否碰到地面或天花板
        if (this.bird.y < 0 || this.bird.y + this.bird.height > 600) {
            return true;
        }

        // 检查鸟是否碰到管道
        for (let pipe of this.pipes) {
            if (
                this.bird.x < pipe.x + pipe.width &&
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.y < pipe.y + pipe.height &&
                this.bird.y + this.bird.height > pipe.y
            ) {
                return true;
            }
        }

        return false;
    }

    updateScore() {
        this.pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.score++;
            }
        });
    }

    jump() {
        if (!this.gameOver) {
            this.bird.velocity = this.jumpStrength;
        }
    }

    reset() {
        this.score = 0;
        this.bird = {
            x: 50,
            y: 200,
            width: 30,
            height: 30,
            velocity: 0
        };
        this.pipes = [];
        this.gameOver = false;
    }
}

// View
class GameView {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.scoreElement = document.getElementById('score-value');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
    }

    draw(model) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制鸟
        const birdElement = document.createElement('div');
        birdElement.className = 'bird';
        birdElement.style.left = `${model.bird.x}px`;
        birdElement.style.top = `${model.bird.y}px`;
        birdElement.style.transform = `rotate(${model.bird.velocity * 2}deg)`;
        this.canvas.parentNode.appendChild(birdElement);

        // 绘制管道
        model.pipes.forEach((pipe, index) => {
            const pipeElement = document.createElement('div');
            pipeElement.className = `pipe ${pipe.y === 0 ? 'pipe-top' : 'pipe-bottom'}`;
            pipeElement.style.left = `${pipe.x}px`;
            pipeElement.style.top = `${pipe.y}px`;
            pipeElement.style.height = `${pipe.height}px`;
            this.canvas.parentNode.appendChild(pipeElement);
        });

        // 更新得分
        this.scoreElement.textContent = model.score;

        // 移除旧的元素
        setTimeout(() => {
            const oldElements = document.querySelectorAll('.bird, .pipe');
            oldElements.forEach(el => el.remove());
        }, 0);
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    showGameOverScreen(score) {
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = score;
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
}

// Controller
class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isRunning = false;

        // 事件监听
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.onJump();
            }
        });

        this.view.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onJump();
        });

        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.isRunning = true;
        this.view.hideStartScreen();
        this.gameLoop();
    }

    restartGame() {
        this.model.reset();
        this.view.hideGameOverScreen();
        this.isRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.model.update();
        this.view.draw(this.model);

        if (this.model.gameOver) {
            this.isRunning = false;
            this.view.showGameOverScreen(this.model.score);
        } else {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    onJump() {
        if (this.isRunning) {
            this.model.jump();
        } else if (!this.model.gameOver) {
            this.startGame();
        }
    }
}

// 初始化游戏
const model = new GameModel();
const view = new GameView();
const controller = new GameController(model, view);

// 显示开始屏幕
view.showStartScreen();

// 检测是否在移动设备上运行
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // 如果是移动设备，进一步降低难度
    model.gravity = 0.1;
    model.jumpStrength = -3;
    model.pipeSpeed = 2;
    model.pipeInterval = 250;
}