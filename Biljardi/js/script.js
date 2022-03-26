// Billiards "Game"
// Generated with the help of GitHub Copilot!
// Seriously, it's amazing.
// ^ That one it generated itself lol

let canvas;
let balls = [];
let holes = [];
let ctx;
let background;

// Array of 6 billiard ball positions shaped like a triangle
const ballPositions = [
    { x: 550, y: 221 },
    { x: 550 + 25, y: 221 + 15 },
    { x: 550 + 25, y: 221 - 15 },
    { x: 550 + 50, y: 221 + 30 },
    { x: 550 + 50, y: 221 - 30 },
    { x: 550 + 50, y: 221 }
];

// Array with hole positions
const holePositions = [
    { x: 45, y: 45 },
    { x: 400, y: 30 },
    { x: 755, y: 45 },
    { x: 45, y: 442 - 45 },
    { x: 400, y: 442 - 30 },
    { x: 755, y: 442 - 45 }
];

// Variable for edge collision padding
const edgePadding = 35;

window.addEventListener("load", function () {
    // Get canvas element
    canvas = document.getElementById("canvas");
    // Get the canvas context
    ctx = canvas.getContext("2d");

    // Add png image to canvas as background
    background = new Image();
    background.src = "https://upload.wikimedia.org/wikipedia/commons/5/5e/American-style_pool_table_diagram_%28empty%29.png";

    // Add a single white billiard ball to the left of the canvas
    balls.push(new Ball(220, 221, 10, "white"));

    // Add billiard balls according to ballPositions array
    for (let i = 0; i < ballPositions.length; i++) {
        balls.push(new Ball(ballPositions[i].x, ballPositions[i].y, 10, "red"));
    }

    // Add hole objects according to holePositions array
    for (let i = 0; i < holePositions.length; i++) {
        holes.push(new Hole(holePositions[i].x, holePositions[i].y, 10));
    }

    // Give the white ball velocity heading right
    balls[0].velocity.x = 5;

    // Render the balls
    render();
});

// Implement hole class
class Hole {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    // Draw the hole
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
}

// Implement ball class with simple collisions and movement
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
        this.mass = 1;
    }

    // Draw the ball
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Update the ball position
    update() {
        // Calculate the new ball position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Check for collisions with the walls
        this.checkEdgeCollisions();

        // Check for collisions with other balls
        this.checkBallCollisions();

        // Check for collisions with holes
        this.checkHoleCollisions();

        // Slowly decrease the balls' velocity
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
    }

    // Check for collisions with holes
    checkHoleCollisions() {
        // Loop through all holes
        for (let i = 0; i < holes.length; i++) {
            // Calculate distance between ball and hole
            let distance = Math.sqrt(Math.pow(this.x - holes[i].x, 2) + Math.pow(this.y - holes[i].y, 2));

            // If the distance is less than the radius of the hole, the ball is in the hole
            if (distance < holes[i].radius) {
                // Remove the ball from the balls array
                balls.splice(balls.indexOf(this), 1);
            }
        }
    }

    // Check for collisions with canvas edges and bounce accordingly
    checkEdgeCollisions() {
        // Check for collisions with the left edge
        if (this.x - this.radius <= edgePadding) {
            this.x = edgePadding + this.radius;
            this.velocity.x *= -1;
        }

        // Check for collisions with the right edge
        if (this.x + this.radius >= canvas.width - edgePadding) {
            this.x = canvas.width - edgePadding - this.radius;
            this.velocity.x *= -1;
        }

        // Check for collisions with the top edge
        if (this.y - this.radius <= edgePadding) {
            this.y = edgePadding + this.radius;
            this.velocity.y *= -1;
        }

        // Check for collisions with the bottom edge
        if (this.y + this.radius >= canvas.height - edgePadding) {
            this.y = canvas.height - edgePadding - this.radius;
            this.velocity.y *= -1;
        }
    }

    // Check for collisions with other balls
    checkBallCollisions() {
        // Loop through all balls
        for (let i = 0; i < balls.length; i++) {
            // Skip the current ball
            if (this === balls[i]) {
                continue;
            }

            // Calculate the distance between the balls
            let distance = Math.sqrt(
                Math.pow(this.x - balls[i].x, 2) + Math.pow(this.y - balls[i].y, 2)
            );

            // Check if the distance is less than the sum of the balls' radii
            if (distance < this.radius + balls[i].radius) {
                // Calculate the angle between the balls
                let angle = Math.atan2(balls[i].y - this.y, balls[i].x - this.x);

                // Calculate the normal vector of the collision
                let normal = {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                };

                // Calculate the relative velocity of the balls
                let relativeVelocity = {
                    x: this.velocity.x - balls[i].velocity.x,
                    y: this.velocity.y - balls[i].velocity.y
                };

                // Calculate the scalar product of the normal and relative velocity
                let scalarProduct = normal.x * relativeVelocity.x + normal.y * relativeVelocity.y;

                // Calculate the impulse vector
                let impulse = {
                    x: normal.x * scalarProduct,
                    y: normal.y * scalarProduct
                };

                // Apply the impulse to the balls
                this.velocity.x -= impulse.x / this.mass;
                this.velocity.y -= impulse.y / this.mass;
                balls[i].velocity.x += impulse.x / balls[i].mass;
                balls[i].velocity.y += impulse.y / balls[i].mass;
            }
        }
    }
}

let lastTime = Date.now();

// Implement render function for canvas
function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw the holes
    for (let i = 0; i < holes.length; i++) {
        holes[i].draw();
    }

    // Draw the balls
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].update();
    }

    // Every 3 seconds, add random velocity to the balls
    if (Date.now() - lastTime > 3000) {
        for (let i = 0; i < balls.length; i++) {
            balls[i].velocity.x += Math.random() * 5;
            balls[i].velocity.y += Math.random() * 5;
        }

        lastTime = Date.now();
    }

    // Call the render function again
    requestAnimationFrame(render);
}