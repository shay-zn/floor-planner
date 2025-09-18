# Floor Planner

A simple, interactive web application for creating floor plan seating arrangements. Upload your floor plan image and drag-and-drop people to arrange seating.

## Features

### 🎨 **Color Customization**
- **10 predefined colors**: Blue, Green, Red, Orange, Purple, Teal, Yellow, Pink, Brown, Gray
- **Individual color editing**: Click the colored circle or paint brush icon to change any person's color
- **Bulk color assignment**: Add multiple people with the same color using bulk input

### 👥 **People Management**
- **Individual person input**: Add people one by one with custom names and colors
- **Bulk person input**: Add multiple people at once using textarea (one name per line)
- **Scrollable people list**: Handles large numbers of people with smooth scrolling
- **Drag and drop**: Drag people from the list onto the floor plan
- **Easy repositioning**: Drag placed people around the floor plan to rearrange seating
- **Quick removal**: Double-click placed people to remove them from the floor plan

### 📋 **Floor Plan Support**
- **Image upload**: Support for PNG, JPG, GIF formats
- **Zoom controls**: Zoom in/out with buttons or slider (25% - 300%)
- **Label size control**: Adjust person label font size for better visibility
- **High-quality export**: Export final arrangement as PNG image

### 💾 **State Management**
- **Auto-save**: Automatically saves to browser localStorage
- **File-based persistence**: Save complete state to JSON file for backup/sharing
- **Cross-session recovery**: Load saved states even after browser restart
- **Git-friendly**: JSON state files can be committed to version control

### 🎯 **User Experience**
- **Responsive design**: Works on desktop and mobile devices
- **Intuitive interface**: Clean, modern design with helpful tooltips
- **Space-efficient**: Instructions accessible via info icon (ℹ️) instead of taking up panel space
- **Visual feedback**: Drag zones, hover effects, and smooth animations

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
**Individual:**
- Click the "+ Add Person" button in the left panel
- Enter the person's name and select a color
- Click "Save" and the person will appear in the people list

**Bulk Add:**
- Click the "+ Bulk Add" button for adding multiple people at once
- Enter names (one per line) and select a color for all
- Click "Add All" to create multiple people with the same color

### 3. Place People on the Floor Plan
- **Method 1**: Drag a person from the left panel directly onto the floor plan
- **Method 2**: The person will be positioned where you drop them

### 4. Customize Colors
- Click the colored circle next to any person's name to change their color
- Or click the paint brush (🎨) icon to open the color editor
- Select from 10 predefined colors and click "Save"

### 5. Adjust View
- Use zoom controls to zoom in/out (25% - 300%)
- Adjust label size slider for better readability
- The people list scrolls automatically when you have many people

### 6. Rearrange Seating
- Drag any placed person label around the floor plan to reposition them
- Double-click a person label to remove them from the floor plan

### 7. Export Your Work
- Click the "Export as Image" button to download your seating arrangement
- The exported image includes both the floor plan and all person labels with their colors

### 8. Manage Your Data
- **Auto-save**: Your work is automatically saved to your browser's local storage
- **Save State**: Click "Save State" to download a JSON file with your complete project
- **Load State**: Click "Load State" to restore a previously saved project from JSON file
- **Clear All**: Reset everything and start over
- **Delete people**: Use the "×" button next to their name

### 9. Get Help
- Click the info icon (ℹ️) in the header for detailed instructions and tips

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

## Changelog

### Latest Version (Current)
- ✨ **Added 10 predefined colors** for person labels (Blue, Green, Red, Orange, Purple, Teal, Yellow, Pink, Brown, Gray)
- ✨ **Implemented inline color editing** for existing people with paint brush icon and clickable color indicators
- ✨ **Added bulk person input** functionality to add multiple people with the same color
- ✨ **Replaced instructions panel** with space-saving tooltip accessible via info icon
- ✨ **Added comprehensive file-based state persistence** with JSON save/load functionality
- ✨ **Implemented scrollable people list** for better handling of large numbers of people
- 🎨 **Reduced label padding** for more compact appearance
- 📱 **Enhanced responsive design** for better mobile experience
- 🚀 **Improved overall user experience** with better visual feedback and interactions

## Future Enhancements

Potential features that could be added:

- [ ] PDF floor plan support (requires PDF.js library)
- [ ] Multiple floor plans/rooms
- [ ] Custom color picker beyond predefined colors
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Print functionality
- [ ] Grid snap for precise positioning
- [ ] Measurement tools
- [ ] Person grouping and categories
- [ ] Export to different formats (SVG, PDF)

## Support

If you encounter any issues or have suggestions for improvements, please:
1. Check the troubleshooting section above
2. Try the tips for best results
3. Test with a different browser or image file