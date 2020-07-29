function collision(firstElement, secondElement) {
    const first = firstElement.getBoundingClientRect();
    const second = secondElement.getBoundingClientRect();
    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top);
}

function svg_clean() {
    for (const r of document.querySelectorAll("rect, image")) {
        for (const attributeName of ["x", "y", "width", "height"])
            r.attributes[attributeName].value = parseInt(r.attributes[attributeName].value) + ""
    }
}

/*
https://www.w3schools.com/howto/howto_js_fullscreen.asp
When the openFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
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

function move(movable, axis, vel, stopped = null) {
    const sizeName = axis === "x" ? "width" : "height";

    const e = movable;
    // for stopped
    const before = parseInt(e.attributes[axis].value);
    e.attributes[axis].value = before + vel + "";
    let collided_with = null;
    for (const r of document.querySelectorAll("rect, image")) {
        // prevent self-collision
        if (r === e) continue;
        if ($(r).hasClass("traversable")) continue;
        if ($(r).parent()[0].nodeName==="pattern") continue;
        if (collision(r, e)) {
            collided_with = r;

            let new_position = before;

            if (vel < 0) {
                //console.log("vel < 0");

                const new_position_lt = parseInt(r.attributes[axis].value) + parseInt(r.attributes[sizeName].value);
                const valid = Math.abs(new_position_lt - before) <= Math.abs(vel);

                //new_position = Math.min(new_position_lt, new_position);
                if (valid) new_position = new_position_lt;
            } else if (vel > 0) {
                //console.log("vel > 0");

                const new_position_gt = parseInt(r.attributes[axis].value) - parseInt(e.attributes[sizeName].value);

                const valid = Math.abs(new_position_gt - before) <= Math.abs(vel);
                //new_position = Math.min(new_position_gt, new_position);
                if (valid) new_position = new_position_gt;
            }

            e.attributes[axis].value = new_position + "";
        }
    }
    // for stopped
    const after = parseInt(e.attributes[axis].value);
    const difference = after - before;
    if (stopped != null && difference === 0)
        stopped(collided_with);
    return difference;
}

// main loop
function initialize() {
    svg_clean();
    setInterval(main, 100);
}

let jumping_previous = false;
let jump_counter = 0;
let ground_previous = false;

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

    for (const elevator of document.querySelectorAll(".elevator")) {
        if (!elevator.elevator_vel) elevator.elevator_vel = +1; // default velocity

        const is_on_elevator = ground === elevator;
        if (is_on_elevator && !elevator.is_on_elevator_previous) console.info("is on elevator", elevator.id);
        elevator.is_on_elevator_previous = is_on_elevator;

        if (elevator.elevator_vel < 0 && is_on_elevator)
            move(m, "y", elevator.elevator_vel, () => {
                console.info("elevator stopped. #movable may suffer damage.");
            });
        move(elevator, "y", elevator.elevator_vel, (collided_with) => {
            if (collided_with === m) return
            elevator.elevator_vel = -elevator.elevator_vel;
            console.info("elevator: direction inverted", elevator.id);
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
