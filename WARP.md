# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Floor Planner is a client-side web application for creating interactive seating arrangements. Users upload floor plan images and drag-and-drop people to arrange seating positions. The application runs entirely in the browser with no backend dependencies.

## Development Commands

### Starting the Development Server
```bash
npm start
# or
npm run serve
# or manually:
python3 -m http.server 8000
```

### Running the Application
1. Start a local server using any of the commands above
2. Open `http://localhost:8000` in a browser
3. No build process or compilation required

### File Serving Requirements
- Must be served via HTTP server (not file:// protocol)
- Any static file server works (Python, Node.js, PHP)
- No backend or database required

## Architecture Overview

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Architecture**: Single-page application with class-based architecture
- **Storage**: Browser localStorage for persistence
- **File Handling**: FileReader API for image uploads
- **Graphics**: HTML5 Canvas for image export

### Core Components

#### FloorPlanner Class (`js/app.js`)
The main application controller that manages the entire application state and user interactions:

- **State Management**: Manages people list, placed positions, drag state
- **Event Handling**: Coordinates all user interactions (drag/drop, clicks, file uploads)
- **Storage**: Handles localStorage persistence and data recovery
- **Export**: Generates downloadable PNG images using Canvas API

#### Key Methods by Functionality:
- **Person Management**: `savePerson()`, `deletePerson()`, `renderPeopleList()`
- **Drag & Drop**: `handlePersonDragStart()`, `handleDrop()`, `placePerson()`
- **Floor Plan**: `handleFloorPlanUpload()`, `loadImageFile()`, `showFloorPlan()`
- **Positioning**: `renderPlacedPeople()`, mouse event handlers for repositioning
- **Persistence**: `saveToStorage()`, `loadFromStorage()`
- **Export**: `exportFloorPlan()` with Canvas-based image generation

### Data Flow Architecture

1. **User Input** → Event handlers in FloorPlanner class
2. **State Update** → Internal arrays/maps (`this.people`, `this.placedPeople`)
3. **DOM Update** → Rendering methods update the UI
4. **Persistence** → localStorage automatically saves state changes

### File Structure
```
floor-planner/
├── index.html          # Single HTML page with semantic structure
├── css/
│   └── styles.css      # Complete styling including responsive design
├── js/
│   └── app.js          # Single JavaScript file with FloorPlanner class
└── package.json        # npm scripts for development server
```

### UI Layout System
- **Three-panel layout**: People list (left), floor plan (center), instructions (right)
- **Responsive design**: Collapses to vertical stack on mobile devices
- **Drag zones**: Visual feedback system for valid drop targets

### Drag and Drop Implementation
- **Dual drag systems**: HTML5 drag API for people-to-floorplan, mouse events for repositioning
- **Visual feedback**: Drop zones, drag shadows, and hover states
- **Coordinate mapping**: Converts browser coordinates to floor plan relative positions
- **Export scaling**: Maps screen coordinates to full-resolution image coordinates

### State Management
- **People array**: List of all people with unique IDs and metadata
- **Placed positions Map**: person ID → {x, y} coordinate mapping
- **localStorage**: Automatic persistence of complete application state
- **File handling**: Images stored as data URLs, not persisted

### Image Processing
- **Upload handling**: FileReader API for local file processing
- **Display**: CSS-based responsive image scaling
- **Export**: Canvas API for high-resolution image generation with overlays
- **Format support**: PNG, JPG, GIF (PDF support mentioned but not implemented)

## Development Patterns

### When Adding New Features
- Extend the FloorPlanner class with new methods
- Follow the pattern: User Event → State Update → DOM Render → Storage Save
- Use the existing event listener setup in `setupEventListeners()`
- Add rendering logic to appropriate render methods

### When Modifying UI
- Update HTML structure in `index.html`
- Extend CSS in `styles.css` following existing BEM-like conventions
- Ensure responsive behavior matches existing patterns

### When Adding Storage
- Extend the `saveToStorage()` and `loadFromStorage()` methods
- Maintain backward compatibility with existing saved data
- Add error handling for data corruption scenarios

## Key Architectural Decisions

### Single-File JavaScript Architecture
- All logic contained in one FloorPlanner class
- Method organization by functional area
- Global instance (`floorPlanner`) for DOM event handlers

### Client-Side Only Design  
- No backend dependencies or API calls
- localStorage for persistence across sessions
- FileReader API for local file processing

### Coordinate System Design
- Relative positioning within floor plan container
- Scaling calculations for export maintain aspect ratio
- Mouse and drag coordinates converted to container-relative positions

### Export Strategy
- Canvas-based rendering for high-quality output
- Preserves original image resolution
- Overlay rendering with proper scaling and styling