function collision(firstElement, secondElement) {
    const first = firstElement.getBoundingClientRect();
    const second = secondElement.getBoundingClientRect();
    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top);
}

function move(movable, axis, vel, stopped = null) {
    const sizeName = axis === "x" ? "width" : "height";

    const e = movable;
    // for stopped
    const before = parseInt(e.attributes[axis].value);
    e.attributes[axis].value = parseInt(e.attributes[axis].value) + vel;
    let collided_with = null;
    for (const r of document.querySelectorAll("rect")) {
        // prevent self-collision
        if (r === e) continue;
        if (collision(r, e)) {
            collided_with = r;
            const size = vel < 0 ? parseInt(r.attributes[sizeName].value) : 0;
            const edge = parseInt(r.attributes[axis].value) + size;
            if (vel < 0)
                e.attributes[axis].value = 1 + edge + "";
            else
                e.attributes[axis].value = -1 + parseInt(r.attributes[axis].value) - parseInt(e.attributes[sizeName].value) + "";
        }
    }
    // for stopped
    const after = e.attributes[axis].value;
    const difference = after - before;
    if (stopped != null && difference === 0)
        stopped(collided_with);
    return difference;
}

// main loop
function initialize() {
    setInterval(main, 100);
}

let jumping_previous = false;
let jump_counter = 0;
let ground_previous = false;
let is_on_elevator_previous = false;

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

    const elevator = document.querySelector("#elevator");
    if (!elevator.elevator_vel) elevator.elevator_vel = +1; // default velocity

    const is_on_elevator = ground != null && ground.id === "elevator";
    if (is_on_elevator && !is_on_elevator_previous) console.info("is on elevator");
    is_on_elevator_previous = is_on_elevator;

    if (elevator.elevator_vel < 0 && is_on_elevator)
        move(m, "y", elevator.elevator_vel, () => {
            console.info("elevator stopped. #movable may suffer damage.");
        });
    move(elevator, "y", elevator.elevator_vel, (collided_with) => {
        if (collided_with === m) return
        elevator.elevator_vel = -elevator.elevator_vel;
        console.info("elevator: direction inverted");
    });

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
    } else if (right) {
        running = +1;
    } else {
        running = 0;
    }
    move(m, "x", 3 * running); // run

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
    level_svg.scroll({top, left, behavior: "smooth"})
}

//****************************************************

let running = 0;
let left = false;
let right = false;
let jumping = false;
let fire = false;

// mouse and touchscreen
onmousedown = ontouchstart = function (event) {
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
