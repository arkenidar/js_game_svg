
function collision(firstElement, secondElement) {
    const first = firstElement.getBoundingClientRect();
    const second = secondElement.getBoundingClientRect();
    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top);
}

function move(axis, vel, stopped = null) {
    const otherAxis = axis == "x" ? "y" : "x";
    const sizeName = axis == "x" ? "width" : "height";

    const e = document.querySelector("#movable");
    // for stopped
    const before = e.attributes[axis].value;
    e.attributes[axis].value = parseFloat(e.attributes[axis].value) + vel;
    for (const r of document.querySelectorAll("rect")) {
        // prevent self-collision
        if (r == e) continue;
        if (collision(r, e)) {
            const size = vel < 0 ? parseFloat(r.attributes[sizeName].value) : 0;
            const edge = parseFloat(r.attributes[axis].value) + size;
            if (vel < 0)
                e.attributes[axis].value = 1 + edge;
            else
                e.attributes[axis].value = -1 + parseFloat(r.attributes[axis].value) - parseFloat(e.attributes[sizeName].value);
        }
    }
    // for stopped
    const after = e.attributes[axis].value;
    if (stopped != null && Math.round(after - before) == 0)
        stopped();
}

// main loop
function initialize(){
    setInterval(main, 100);
}

function main(){
    if (left && right) {
        running = 0;
    } else if (left) {
        running = -1;
    } else if (right) {
        running = +1;
    } else {
        running = 0;
    }

    move("y", 3); // gravity
    move("x", 3 * running); // run

    if(location.hash=="#camera-off") {
        // camera off
        
        // scrollbars on
        level_svg.style.overflow="scroll";
    }else{
        // camera on (scroll)
        camera();
        
        // no scrollbars: scroll overflow hidden (disabled)
        level_svg.style.overflow="hidden";
    }
}

function camera() {
    const top = movable.getBoundingClientRect().top + level_svg.scrollTop - level_svg.getBoundingClientRect().height / 2;
    const left = movable.getBoundingClientRect().left + level_svg.scrollLeft - level_svg.getBoundingClientRect().width / 2;
    level_svg.scroll({top,left,behavior:"smooth"})
}

/////////////////////////////////////////

let running = 0;
let left = false;
let right = false;
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
    }
    ///event.preventDefault()
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
            jump();
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
            left = 0;
            event.preventDefault();
            break;
        case "ArrowRight":
            right = 0;
            event.preventDefault();
            break;
        case " ":
            fire = false;
            event.preventDefault();
            break;
    }
};
