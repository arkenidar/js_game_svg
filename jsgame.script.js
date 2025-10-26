/**
 * JS Game SVG - Cross-Browser Compatible 2D Platformer
 * 
 * This file contains the core game logic, physics engine, and collision detection
 * for a SVG-based 2D platformer game. The code has been optimized for cross-browser
 * compatibility, particularly addressing Chrome/Edge viewport-dependent issues.
 * 
 * Key Features:
 * - Viewport-independent collision detection using SVG coordinates
 * - Cross-browser compatible attribute handling
 * - Automated elevator/platform movement system
 * - Gravity and jump physics simulation
 * - Smooth camera following system
 * 
 * Browser Compatibility: Firefox 60+, Chrome 70+, Edge 79+, Safari 12+
 * 
 * @author Dario Cangialosi
 * @version 2.0 (Cross-browser compatibility fix - October 2025)
 */

/**
 * Cross-browser compatible collision detection for SVG elements
 * 
 * This function uses SVG-native coordinate systems instead of viewport-relative
 * coordinates to ensure consistent behavior across different browsers and viewport sizes.
 * 
 * CRITICAL FIX (October 2025): Replaced getBoundingClientRect() with getBBox()
 * to eliminate viewport-size dependency that caused elevator cycling in Chrome/Edge.
 * 
 * @param {SVGElement} firstElement - First element to check collision
 * @param {SVGElement} secondElement - Second element to check collision  
 * @returns {boolean} True if elements are colliding, false otherwise
 */
function collision(firstElement, secondElement) {
    // Ensure elements exist and have proper dimensions
    if (!firstElement || !secondElement) return false;
    
    // Get SVG-relative coordinates instead of viewport-relative
    // This fixes viewport-size dependency issues in Chrome
    const getSVGRect = (elem) => {
        try {
            // Try to get SVG bounding box first (most accurate for SVG elements)
            if (elem.getBBox) {
                const bbox = elem.getBBox();
                return {
                    left: bbox.x,
                    right: bbox.x + bbox.width,
                    top: bbox.y,
                    bottom: bbox.y + bbox.height
                };
            }
            
            // Fallback to attribute-based calculation
            const x = parseFloat(elem.getAttribute('x') || 0);
            const y = parseFloat(elem.getAttribute('y') || 0);
            const width = parseFloat(elem.getAttribute('width') || 0);
            const height = parseFloat(elem.getAttribute('height') || 0);
            
            return {
                left: x,
                right: x + width,
                top: y,
                bottom: y + height
            };
        } catch (e) {
            console.warn('Error getting SVG rect:', e);
            return { left: 0, right: 0, top: 0, bottom: 0 };
        }
    };
    
    const first = getSVGRect(firstElement);
    const second = getSVGRect(secondElement);
    
    // Add small tolerance for floating point precision issues
    const tolerance = 0.1;
    return (
        first.left <= second.right + tolerance &&
        first.right >= second.left - tolerance &&
        first.top <= second.bottom + tolerance &&
        first.bottom >= second.top - tolerance);
}

/**
 * SVG attribute cleanup and normalization for cross-browser compatibility
 * 
 * Ensures all SVG elements have properly formatted numeric attributes by
 * converting them to integers and setting them using multiple methods for
 * maximum browser compatibility.
 * 
 * @function svg_clean
 */
function svg_clean() {
    for (const r of document.querySelectorAll("rect, image")) {
        for (const attributeName of ["x", "y", "width", "height"]) {
            const value = parseInt(r.getAttribute(attributeName) || r.attributes[attributeName]?.value || 0);
            // Set using both methods for cross-browser compatibility
            r.setAttribute(attributeName, value);
            if (r.attributes[attributeName]) {
                r.attributes[attributeName].value = value;
            }
        }
        // Force layout recalculation
        r.getBBox();
    }
}

/**
 * Fullscreen API wrapper with cross-browser support
 * 
 * Handles browser-specific prefixes for fullscreen functionality.
 * Supports Chrome, Firefox, Safari, and IE/Edge implementations.
 * 
 * @param {HTMLElement} elem - Element to make fullscreen
 * @see https://www.w3schools.com/howto/howto_js_fullscreen.asp
 */
function open_fullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/**
 * Universal movement and collision system for SVG elements
 * 
 * This is the core physics function that handles movement, collision detection,
 * and collision resolution for all game objects including the player and elevators.
 * 
 * MAJOR IMPROVEMENTS (October 2025):
 * - SVG-coordinate based collision detection (viewport-independent)
 * - Robust cross-browser attribute handling with multiple fallbacks
 * - Improved precision with floating-point calculations
 * - Enhanced error handling and logging
 * 
 * @param {SVGElement} movable - The element to move
 * @param {string} axis - Movement axis: "x" for horizontal, "y" for vertical
 * @param {number} vel - Velocity (positive or negative)
 * @param {Function} [stopped] - Callback function when movement is blocked by collision
 * @returns {number} Actual distance moved (may be less than vel due to collisions)
 */
function move(movable, axis, vel, stopped = null) {
    const sizeName = axis === "x" ? "width" : "height";

    const e = movable;
    
    // More robust cross-browser SVG attribute handling
    const getAttrValue = (elem, attr) => {
        try {
            // Primary method: getAttribute (most reliable and consistent)
            let value = elem.getAttribute(attr);
            if (value !== null && value !== undefined) {
                return parseFloat(value) || 0;
            }
            
            // Fallback: direct attribute access
            if (elem.attributes && elem.attributes[attr]) {
                return parseFloat(elem.attributes[attr].value) || 0;
            }
            
            return 0;
        } catch (e) {
            console.warn('Error getting attribute:', attr, e);
            return 0;
        }
    };
    
    const setAttrValue = (elem, attr, value) => {
        try {
            // Round to avoid floating point precision issues
            const roundedValue = Math.round(value * 10) / 10; // Round to 1 decimal
            const valueStr = String(roundedValue);
            
            // Set using getAttribute/setAttribute for consistency
            elem.setAttribute(attr, valueStr);
            
            // Also set using direct access as fallback
            if (elem.attributes && elem.attributes[attr]) {
                elem.attributes[attr].value = valueStr;
            }
            
        } catch (e) {
            console.warn('Error setting attribute:', attr, e);
        }
    };

    // Store original position
    const before = getAttrValue(e, axis);
    
    // Apply movement
    setAttrValue(e, axis, before + vel);
    
    let collided_with = null;
    
    for (const r of document.querySelectorAll("rect, image")) {
        // prevent self-collision
        if (r === e) continue;
        if ($(r).hasClass("traversable")) continue;
        if ($(r).parent()[0].nodeName === "pattern") continue;

        if (collision(r, e)) {
            collided_with = r;

            let new_position = before;

            if (vel < 0) {
                // Moving up/left: position element just below/right of the obstacle
                const obstacle_bottom = getAttrValue(r, axis) + getAttrValue(r, sizeName);
                new_position = obstacle_bottom + 1; // Small gap to prevent immediate re-collision
            } else if (vel > 0) {
                // Moving down/right: position element just above/left of the obstacle
                const obstacle_top = getAttrValue(r, axis);
                const element_size = getAttrValue(e, sizeName);
                new_position = obstacle_top - element_size - 1; // Small gap to prevent immediate re-collision
            }

            setAttrValue(e, axis, new_position);
            break; // Handle only first collision
        }
    }
    
    // Check if movement was actually blocked
    const after = getAttrValue(e, axis);
    const difference = after - before;
    if (stopped != null && difference === 0 && collided_with) {
        stopped(collided_with);
    }
    
    return difference;
}

/**
 * Game initialization with cross-browser frame timing
 * 
 * Sets up the main game loop using requestAnimationFrame for optimal performance
 * and consistent timing across browsers, with fallback to setInterval for older browsers.
 * 
 * @function initialize
 */
// main loop
function initialize() {
    svg_clean();
    
    // Cross-browser frame synchronization
    // Use requestAnimationFrame for smoother, more consistent timing
    let lastTime = 0;
    const targetFrameTime = 100; // 100ms = 10 FPS
    
    function gameLoop(currentTime) {
        if (currentTime - lastTime >= targetFrameTime) {
            main();
            lastTime = currentTime;
        }
        requestAnimationFrame(gameLoop);
    }
    
    // Fallback for older browsers
    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(gameLoop);
    } else {
        setInterval(main, targetFrameTime);
    }
}

let jumping_previous = false;
let jump_counter = 0;
let ground_previous = false;

/**
 * Main game loop - handles all game physics and logic
 * 
 * Executed every frame (10 FPS) to update:
 * - Player gravity and ground detection
 * - Elevator movement and collision
 * - Jump mechanics
 * - Horizontal player movement
 * 
 * The order of operations is critical for proper physics simulation.
 */
function main() {

    /*
    main() must handle:
    ground & gravity
    walls or horizontal collisions
    jump
    elevator up and down + squeeze
    */
    const m = document.querySelector("#movable");

    //*********************************************

    let y_difference = 0;
    let ground = null;
    y_difference += move(m, "y", 3, (collide_with) => {
        ground = collide_with;
        if (ground && !ground_previous) console.info("hit the ground");
    }); // gravity
    ground_previous = ground;

    //******************************************
    // ELEVATOR SYSTEM - Automated moving platforms
    // Each elevator moves independently and reverses direction on collision
    //******************************************

    for (const elevator of document.querySelectorAll(".elevator")) {
        // Initialize elevator properties
        if (!elevator.elevator_vel) elevator.elevator_vel = +1; // default velocity (downward)

        // Track if player is currently riding this elevator
        const is_on_elevator = ground === elevator;
        if (is_on_elevator && !elevator.is_on_elevator_previous) console.info("is on elevator", elevator.id);
        elevator.is_on_elevator_previous = is_on_elevator;

        // PLAYER-ELEVATOR COUPLING: Move player with elevator when riding
        if (is_on_elevator) {
            move(m, "y", elevator.elevator_vel, () => {
                console.info("elevator stopped while carrying player. Player may suffer damage.");
            });
        }

        // ELEVATOR MOVEMENT: Move elevator and handle collision-based direction reversal
        move(elevator, "y", elevator.elevator_vel, (collided_with) => {
            // If elevator hits player from below/above, stop and reverse
            if (collided_with === m) {
                console.info("elevator collided with player, reversing direction", elevator.id);
                elevator.elevator_vel = -elevator.elevator_vel;
                return;
            }
            // If elevator hits any other obstacle (walls, ceiling, floor), reverse direction
            elevator.elevator_vel = -elevator.elevator_vel;
            console.info("elevator: direction inverted due to obstacle", elevator.id);
        });
    }
    //******************************

    if (jumping && !jumping_previous && ground != null) {
        jump_counter = 15;
        console.info("jumping");
    }
    jumping_previous = jumping;

    if (jump_counter > 0) {
        jump_counter--;
        y_difference += move(m, "y", -5);
    }

    if (y_difference === 0 && jump_counter > 0) {
        jump_counter = 0; // roof hit
        console.info("roof hit");
    }

    //*********************************

    if (left && right) {
        running = 0;
    } else if (left) {
        running = -1;
        // mirror
        movable.href.baseVal = "images/movable2.png";
    } else if (right) {
        running = +1;
        // revert mirror
        movable.href.baseVal = "images/movable.png";
    } else {
        running = 0;
    }

    move(m, "x", 3 * running); // run
}

setInterval(scrolling, 1500);

function scrolling() {
    //*********************************
    if (location.hash === "#camera-off") {
        // camera off

        // scrollbars on
        level_svg.style.overflow = "scroll";
    } else {
        // camera on (scroll)
        camera();

        // no scrollbars: scroll overflow hidden (disabled)
        level_svg.style.overflow = "hidden";
    }
}

function camera() {
    const top = movable.getBoundingClientRect().top + level_svg.scrollTop - level_svg.getBoundingClientRect().height / 2;
    const left = movable.getBoundingClientRect().left + level_svg.scrollLeft - level_svg.getBoundingClientRect().width / 2;
    level_svg.scroll({ top, left, behavior: "smooth" })
}

//****************************************************

let running = 0;
let left = false;
let right = false;
let jumping = false;
let fire = false;

// mouse and touchscreen
onmousedown = ontouchstart = function (event) {

    open_fullscreen(document.body)

    const id = event.target.id;
    switch (id) {
        case "left":
            left = true;
            event.preventDefault();
            break;
        case "right":
            right = true;
            event.preventDefault();
            break;
        case "third":
            jumping = true;
            event.preventDefault();
            break;
    }
};
onmouseup = ontouchend = function (event) {
    const id = event.target.id;
    switch (id) {
        case "left":
            left = false;
            event.preventDefault();
            break;
        case "right":
            right = false;
            event.preventDefault();
            break;
        case "third":
            jumping = false;
            event.preventDefault();
            break;
    }
};
// keyboard
onkeydown = function (event) {
    switch (event.key) {
        case "ArrowLeft":
            left = true;
            event.preventDefault();
            break;
        case "ArrowRight":
            right = true;
            event.preventDefault();
            break;
        case "ArrowUp":
            jumping = true;
            event.preventDefault();
            break;
        case " ":
            fire = true;
            event.preventDefault();
            break;
    }
    //event.preventDefault()
};
onkeyup = function (event) {
    switch (event.key) {
        case "ArrowLeft":
            left = false;
            event.preventDefault();
            break;
        case "ArrowRight":
            right = false;
            event.preventDefault();
            break;
        case "ArrowUp":
            jumping = false;
            event.preventDefault();
            break;
        case " ":
            fire = false;
            event.preventDefault();
            break;
    }
};
