# Floor Planner

A simple, interactive web application for creating floor plan seating arrangements. Upload your floor plan image and drag-and-drop people to arrange seating.

## Features

- 📋 **Floor Plan Upload**: Upload floor plan images (PNG, JPG, GIF)
- 👥 **People Management**: Add, edit, and delete people in your seating list
- 🖱️ **Drag & Drop**: Intuitive drag-and-drop interface for placing people
- 📍 **Repositioning**: Drag placed people around to rearrange seating
- 💾 **Auto-save**: Automatically saves your work to browser local storage
- 📤 **Export**: Export the final seating arrangement as a PNG image
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server) or any other local server

### Installation

1. **Clone or download this project** to your local machine
2. **Navigate to the project directory** in your terminal
3. **Start a local server** using one of these methods:

   **Option 1: Python (recommended)**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option 2: Node.js (if you have it installed)**
   ```bash
   npx serve .
   ```
   
   **Option 3: PHP (if you have it installed)**
   ```bash
   php -S localhost:8000
   ```

4. **Open your browser** and go to `http://localhost:8000`

### Quick Start with npm

If you have Node.js installed, you can use the provided npm scripts:

```bash
npm start
# or
npm run serve
```

## How to Use

### 1. Upload a Floor Plan
- Click the "Upload Floor Plan" button
- Select an image file (PNG, JPG, GIF) of your floor plan
- The image will appear in the center panel

### 2. Add People
- Click the "+ Add Person" button in the left panel
- Enter the person's name and click "Save"
- The person will appear in the people list

### 3. Place People on the Floor Plan
- **Method 1**: Drag a person from the left panel directly onto the floor plan
- **Method 2**: The person will be positioned where you drop them

### 4. Rearrange Seating
- Drag any placed person label around the floor plan to reposition them
- Double-click a person label to remove them from the floor plan

### 5. Export Your Work
- Click the "Export as Image" button to download your seating arrangement
- The exported image includes both the floor plan and all person labels

### 6. Manage Your Data
- Your work is automatically saved to your browser's local storage
- Use "Clear All" to reset everything and start over
- Delete individual people using the "×" button next to their name

## File Structure

```
floor-planner/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling and responsive design
├── js/
│   └── app.js          # Application logic and interactions
├── assets/             # Directory for additional assets (currently empty)
├── package.json        # Project configuration and scripts
└── README.md          # This file
```

## Browser Compatibility

- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 11+ ✅
- **Edge**: 79+ ✅
- **Mobile browsers**: iOS Safari 11+, Chrome Mobile 60+ ✅

## Features in Detail

### Drag and Drop
- **From List to Floor Plan**: Drag people from the left panel to place them
- **Repositioning**: Drag placed labels to move them around
- **Visual Feedback**: Clear indicators show where you can drop people

### Auto-save
- All changes are automatically saved to browser local storage
- Your work persists between browser sessions
- No need to manually save your progress

### Export Functionality
- Exports a high-quality PNG image
- Maintains the original floor plan resolution
- Person labels are properly scaled and positioned
- Downloads automatically with a timestamp

### Responsive Design
- Optimized for desktop, tablet, and mobile devices
- Touch-friendly interface for mobile users
- Adaptive layout that works on different screen sizes

## Tips for Best Results

1. **Use clear, high-resolution floor plan images** for the best visual results
2. **Standard image formats work best**: PNG, JPG, and GIF are supported
3. **For PDF floor plans**: Convert to image format first (many free online converters available)
4. **Person names should be reasonably short** for better label appearance
5. **Zoom in your browser** if you need more precision when placing people

## Troubleshooting

### The app won't load
- Make sure you're running a local server (not opening the HTML file directly)
- Check that you're using a modern browser
- Try refreshing the page

### Images won't upload
- Check that your image file is in PNG, JPG, or GIF format
- Ensure the file size isn't too large (most browsers handle up to 50MB)
- Try a different image if one isn't working

### Drag and drop not working
- Make sure you've uploaded a floor plan first
- Try refreshing the page
- Check that JavaScript is enabled in your browser

### Export not working
- Ensure you have a floor plan loaded and at least one person placed
- Make sure your browser allows downloads
- Try using a different browser if issues persist

## Development

### Making Changes
1. Edit the HTML, CSS, or JavaScript files as needed
2. Refresh your browser to see changes
3. No build process is required

### Adding Features
The code is organized into a single FloorPlanner class in `js/app.js` with clear methods for each feature. Key areas:

- **Person Management**: `savePerson()`, `deletePerson()`, `renderPeopleList()`
- **Drag & Drop**: `handlePersonDragStart()`, `handleDrop()`, `placePerson()`
- **Storage**: `saveToStorage()`, `loadFromStorage()`
- **Export**: `exportFloorPlan()`

## License

This project is licensed under the MIT License - see the `package.json` file for details.

## Future Enhancements

Potential features that could be added:

- [ ] PDF floor plan support (requires PDF.js library)
- [ ] Multiple floor plans/rooms
- [ ] Color coding for different types of people/roles
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Print functionality
- [ ] Import/export project files
- [ ] Grid snap for precise positioning
- [ ] Measurement tools

## Support

If you encounter any issues or have suggestions for improvements, please:
1. Check the troubleshooting section above
2. Try the tips for best results
3. Test with a different browser or image file