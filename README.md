# js_game_svg

A modern JavaScript 2D platformer game built with SVG graphics, designed for cross-platform compatibility and responsive gameplay.

## Overview

This project is a modern experiment toward adapting SVG editor workflows (e.g. Inkscape) to 2D game level design for jump-and-run style games. The game combines web technologies to create a responsive, cross-browser gaming experience.

## Technology Stack

- **HTML5**: Game container and responsive layout
- **CSS3**: Styling, responsive design, and visual keyboard
- **JavaScript (ES6+)**: Game logic, physics, and collision detection
- **SVG**: Level design and game graphics (created with Inkscape)
- **Fetch API**: Modern asynchronous level loading

## Key Features

### Cross-Platform Compatibility
- **Universal browser support**: Firefox, Chrome, Edge, Safari
- **Mobile-responsive**: Touch controls and adaptive layouts
- **Cross-browser collision detection**: Robust SVG-based physics engine
- **Viewport-independent behavior**: Consistent gameplay across screen sizes

### Game Mechanics
- **Gravity and jumping**: Realistic physics simulation
- **Moving platforms (elevators)**: Automated collision-based movement
- **Collision detection**: Precise SVG-native boundary detection
- **Smooth camera following**: Auto-scrolling viewport
- **Responsive controls**: Keyboard and touch input support

### Level Design
- **SVG-based levels**: Design levels using Inkscape or similar tools
- **Pattern-based textures**: Reusable graphic patterns
- **Traversable/non-traversable objects**: Flexible collision properties
- **Multiple elevators**: Independent platform systems

## Game Controls

### Desktop
- **Arrow Keys**: Move left/right, jump up
- **F11 or browser fullscreen**: Immersive gameplay mode

### Mobile/Touch
- **On-screen keyboard**: Touch-friendly arrow controls
- **Responsive design**: Adapts to device orientation
- **Touch optimization**: Prevents text selection during gameplay

## Architecture

### Core Systems

#### Physics Engine (`jsgame.script.js`)
- **move()**: Universal movement and collision system
- **collision()**: SVG-native boundary detection
- **gravity simulation**: Continuous downward force
- **jump mechanics**: Temporary upward velocity

#### Elevator System
```javascript
// Automated platform movement with collision reversal
for (const elevator of document.querySelectorAll(".elevator")) {
    // Move elevator and handle boundary collisions
    move(elevator, "y", elevator.elevator_vel, (collided_with) => {
        elevator.elevator_vel = -elevator.elevator_vel; // Reverse direction
    });
}
```

#### Camera System
- **Auto-follow**: Smooth tracking of player character
- **Boundary detection**: Prevents camera from leaving level bounds
- **Smooth scrolling**: Configurable easing and timing

### File Structure
```
js_game_svg/
├── game.html              # Main game file and UI
├── jsgame.script.js       # Game logic and physics engine
├── level01.svg            # Game level (Inkscape-created)
├── images/                # Game assets
│   ├── bush.png          # Platform textures
│   ├── movable.png       # Player character (right-facing)
│   └── movable2.png      # Player character (left-facing)
├── README.md             # This documentation
└── CROSS_BROWSER_FIX.md  # Technical fix documentation
```

## Development History

### Major Milestones
- **2020**: Initial elevator system and cross-browser challenges
- **2022**: Collision detection improvements and optimizations
- **2025**: Complete cross-browser compatibility resolution

### Cross-Browser Compatibility Journey
This project faced significant cross-browser compatibility challenges, particularly with elevator collision detection in Chrome/Edge browsers. The issue was resolved in October 2025 with a comprehensive fix that addresses viewport-dependent coordinate system mismatches.

See [`CROSS_BROWSER_FIX.md`](./CROSS_BROWSER_FIX.md) for detailed technical documentation of the resolution.

## Getting Started

### Prerequisites
- Modern web browser (Firefox, Chrome, Edge, Safari)
- Local web server (for proper CORS handling)

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/arkenidar/js_game_svg.git
   cd js_game_svg
   ```

2. **Start a local server**:
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

3. **Open the game**:
   Navigate to `http://localhost:8000/game.html`

### Development Setup
For active development with auto-reload:
1. Install VS Code with Live Server extension, or
2. Use any local development server with file watching

## Level Design

### Creating Levels with Inkscape
1. **Create SVG file** with game elements
2. **Use CSS classes** for object behavior:
   - `.elevator`: Moving platforms
   - `.traversable`: Non-solid objects
3. **Set dimensions** appropriate for gameplay
4. **Export as plain SVG** (no Inkscape-specific elements)

### Element Types
- **`<rect>`**: Solid platforms and walls
- **`<image>`**: Textured objects (players, elevators)
- **`<pattern>`**: Repeating background textures

## Performance Considerations

- **SVG optimization**: Clean SVG files for better performance
- **Collision detection**: Optimized with early exits and caching
- **Frame rate**: Consistent 10 FPS for predictable physics
- **Memory usage**: Efficient DOM queries and object reuse

## Contributing

### Code Style
- ES6+ JavaScript features
- Consistent indentation and naming
- Comprehensive error handling
- Cross-browser compatibility focus

### Testing
- Test across multiple browsers
- Verify mobile responsiveness
- Check various viewport sizes
- Validate level loading and collision detection

## Browser Support

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Firefox | 60+ | ✅ Full support |
| Chrome | 70+ | ✅ Full support |
| Edge | 79+ | ✅ Full support |
| Safari | 12+ | ✅ Full support |
| Mobile Safari | 12+ | ✅ Touch optimized |
| Chrome Mobile | 70+ | ✅ Touch optimized |

## License

This project is open source. See repository for license details.

## Acknowledgments

- **Inkscape**: SVG level design tool
- **Fetch API**: Modern asynchronous loading
- **Community**: Contributors and testers who helped identify cross-browser issues

---

**Enjoy the game!** 🎮

For technical issues or contributions, please see the GitHub repository.
