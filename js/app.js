class FloorPlanner {
    constructor() {
        this.people = [];
        this.placedPeople = new Map(); // Maps person ID to { x, y } coordinates
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.floorPlanLoaded = false;
        this.floorPlanImageData = null; // Store floor plan image as data URL
        this.zoomLevel = 1.0; // Current zoom level (1.0 = 100%)
        this.labelSize = 12; // Current label font size in pixels
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Add person functionality
        const addPersonBtn = document.getElementById('add-person-btn');
        const savePersonBtn = document.getElementById('save-person-btn');
        const cancelPersonBtn = document.getElementById('cancel-person-btn');
        const personNameInput = document.getElementById('person-name-input');
        
        // Bulk add functionality
        const bulkAddBtn = document.getElementById('bulk-add-btn');
        const saveBulkPeopleBtn = document.getElementById('save-bulk-people-btn');
        const cancelBulkBtn = document.getElementById('cancel-bulk-btn');

        addPersonBtn.addEventListener('click', () => this.showPersonInput());
        savePersonBtn.addEventListener('click', () => this.savePerson());
        cancelPersonBtn.addEventListener('click', () => this.hidePersonInput());
        
        bulkAddBtn.addEventListener('click', () => this.showBulkPersonInput());
        saveBulkPeopleBtn.addEventListener('click', () => this.saveBulkPeople());
        cancelBulkBtn.addEventListener('click', () => this.hideBulkPersonInput());
        
        // Info button functionality
        const infoBtn = document.getElementById('info-btn');
        infoBtn.addEventListener('click', () => this.toggleInstructions());
        
        personNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.savePerson();
            if (e.key === 'Escape') this.hidePersonInput();
        });

        // Floor plan upload
        const floorPlanUpload = document.getElementById('floor-plan-upload');
        floorPlanUpload.addEventListener('change', (e) => this.handleFloorPlanUpload(e));

        // Export functionality
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => this.exportFloorPlan());

        // Save/Load state functionality
        const saveStateBtn = document.getElementById('save-state-btn');
        const loadStateInput = document.getElementById('load-state-input');
        saveStateBtn.addEventListener('click', () => this.saveStateToFile());
        loadStateInput.addEventListener('change', (e) => this.loadStateFromFile(e));

        // Clear all functionality
        const clearAllBtn = document.getElementById('clear-all-btn');
        clearAllBtn.addEventListener('click', () => this.clearAll());

        // Drag and drop for floor plan container
        const floorPlanContainer = document.getElementById('floor-plan-container');
        floorPlanContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
        floorPlanContainer.addEventListener('drop', (e) => this.handleDrop(e));
        floorPlanContainer.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const zoomSlider = document.getElementById('zoom-slider');
        
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());
        zoomSlider.addEventListener('input', (e) => this.setZoomLevel(parseInt(e.target.value) / 100));

        // Label size controls
        const labelSizeSlider = document.getElementById('label-size-slider');
        labelSizeSlider.addEventListener('input', (e) => this.setLabelSize(parseInt(e.target.value)));
        
        // Close color editors when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.person-color-editor') && 
                !e.target.closest('.person-color-indicator') && 
                !e.target.closest('.edit-color-btn')) {
                document.querySelectorAll('.person-color-editor').forEach(editor => {
                    editor.style.display = 'none';
                });
            }
        });
    }

    showPersonInput() {
        const personInput = document.getElementById('person-input');
        const personNameInput = document.getElementById('person-name-input');
        personInput.style.display = 'block';
        personNameInput.focus();
    }

    hidePersonInput() {
        const personInput = document.getElementById('person-input');
        const personNameInput = document.getElementById('person-name-input');
        const blueColorInput = document.getElementById('color-blue');
        personInput.style.display = 'none';
        personNameInput.value = '';
        if (blueColorInput) {
            blueColorInput.checked = true;
        }
    }
    
    showBulkPersonInput() {
        const bulkPersonInput = document.getElementById('bulk-person-input');
        const personInput = document.getElementById('person-input');
        const bulkPersonNames = document.getElementById('bulk-person-names');
        
        // Hide single person input if open
        personInput.style.display = 'none';
        
        bulkPersonInput.style.display = 'block';
        bulkPersonNames.focus();
    }
    
    hideBulkPersonInput() {
        const bulkPersonInput = document.getElementById('bulk-person-input');
        const bulkPersonNames = document.getElementById('bulk-person-names');
        const bulkBlueColorInput = document.getElementById('bulk-color-blue');
        
        bulkPersonInput.style.display = 'none';
        bulkPersonNames.value = '';
        if (bulkBlueColorInput) {
            bulkBlueColorInput.checked = true;
        }
    }
    
    saveBulkPeople() {
        const bulkPersonNames = document.getElementById('bulk-person-names');
        const selectedColorInput = document.querySelector('input[name="bulk-person-color"]:checked');
        const namesText = bulkPersonNames.value.trim();
        const color = selectedColorInput ? selectedColorInput.value : '#3498db';
        
        if (!namesText) {
            alert('Please enter at least one person name.');
            return;
        }
        
        const names = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
            
        if (names.length === 0) {
            alert('Please enter at least one valid person name.');
            return;
        }
        
        // Add all people with the selected color
        names.forEach(name => {
            const person = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Ensure unique IDs
                name: name,
                color: color,
                placed: false
            };
            this.people.push(person);
        });
        
        this.renderPeopleList();
        this.hideBulkPersonInput();
        this.saveToStorage();
        
        alert(`Added ${names.length} people successfully!`);
    }
    
    toggleInstructions() {
        const tooltip = document.getElementById('instructions-tooltip');
        const overlay = document.getElementById('tooltip-overlay');
        
        if (tooltip.style.display === 'none' || !tooltip.style.display) {
            // Show tooltip
            if (!overlay) {
                const newOverlay = document.createElement('div');
                newOverlay.id = 'tooltip-overlay';
                newOverlay.className = 'tooltip-overlay';
                newOverlay.addEventListener('click', () => this.hideInstructions());
                document.body.appendChild(newOverlay);
            }
            tooltip.style.display = 'block';
        } else {
            this.hideInstructions();
        }
    }
    
    hideInstructions() {
        const tooltip = document.getElementById('instructions-tooltip');
        const overlay = document.getElementById('tooltip-overlay');
        
        tooltip.style.display = 'none';
        if (overlay) {
            overlay.remove();
        }
    }

    savePerson() {
        const personNameInput = document.getElementById('person-name-input');
        const selectedColorInput = document.querySelector('input[name="person-color"]:checked');
        const name = personNameInput.value.trim();
        const color = selectedColorInput ? selectedColorInput.value : '#3498db';
        
        if (name) {
            const person = {
                id: Date.now().toString(),
                name: name,
                color: color,
                placed: false
            };
            
            this.people.push(person);
            this.renderPeopleList();
            this.hidePersonInput();
            this.saveToStorage();
        }
    }

    deletePerson(personId) {
        this.people = this.people.filter(p => p.id !== personId);
        this.placedPeople.delete(personId);
        this.renderPeopleList();
        this.renderPlacedPeople();
        this.saveToStorage();
    }

    toggleColorEditor(personId) {
        const colorEditor = document.getElementById(`color-editor-${personId}`);
        const isVisible = colorEditor.style.display !== 'none';
        
        // Hide all other color editors first
        document.querySelectorAll('.person-color-editor').forEach(editor => {
            editor.style.display = 'none';
        });
        
        // Toggle the clicked editor
        colorEditor.style.display = isVisible ? 'none' : 'block';
    }

    savePersonColor(personId) {
        const selectedColorInput = document.querySelector(`input[name="edit-person-color-${personId}"]:checked`);
        if (!selectedColorInput) return;
        
        const newColor = selectedColorInput.value;
        const person = this.people.find(p => p.id === personId);
        
        if (person) {
            person.color = newColor;
            this.renderPeopleList();
            this.renderPlacedPeople();
            this.saveToStorage();
        }
        
        // Hide the color editor
        document.getElementById(`color-editor-${personId}`).style.display = 'none';
    }

    cancelColorEdit(personId) {
        // Hide the color editor without saving changes
        document.getElementById(`color-editor-${personId}`).style.display = 'none';
    }

    renderPeopleList() {
        const peopleList = document.getElementById('people-list');
        peopleList.innerHTML = '';

        this.people.forEach(person => {
            const personItem = document.createElement('div');
            personItem.className = 'person-item';
            personItem.draggable = true;
            personItem.dataset.personId = person.id;

            const isPlaced = this.placedPeople.has(person.id);
            const personColor = person.color || '#3498db';

            personItem.innerHTML = `
                <div class="person-item-row">
                    <div class="person-info">
                        <div class="person-color-indicator" style="background-color: ${personColor}" onclick="floorPlanner.toggleColorEditor('${person.id}')" title="Click to change color"></div>
                        <div class="person-details">
                            <div class="person-name">${person.name}</div>
                            <div class="person-status ${isPlaced ? 'placed' : ''}">${isPlaced ? 'Placed' : 'Available'}</div>
                        </div>
                    </div>
                    <div class="person-controls">
                        <button class="edit-color-btn" onclick="floorPlanner.toggleColorEditor('${person.id}')" title="Edit Color">🎨</button>
                        <button class="delete-person-btn" onclick="floorPlanner.deletePerson('${person.id}')">×</button>
                    </div>
                </div>
                <div class="person-color-editor" id="color-editor-${person.id}" style="display: none;">
                    <div class="color-options">
                        <input type="radio" id="edit-color-blue-${person.id}" name="edit-person-color-${person.id}" value="#3498db" ${personColor === '#3498db' ? 'checked' : ''}>
                        <label for="edit-color-blue-${person.id}" class="color-option" style="background-color: #3498db;" title="Blue"></label>
                        
                        <input type="radio" id="edit-color-green-${person.id}" name="edit-person-color-${person.id}" value="#27ae60" ${personColor === '#27ae60' ? 'checked' : ''}>
                        <label for="edit-color-green-${person.id}" class="color-option" style="background-color: #27ae60;" title="Green"></label>
                        
                        <input type="radio" id="edit-color-red-${person.id}" name="edit-person-color-${person.id}" value="#e74c3c" ${personColor === '#e74c3c' ? 'checked' : ''}>
                        <label for="edit-color-red-${person.id}" class="color-option" style="background-color: #e74c3c;" title="Red"></label>
                        
                        <input type="radio" id="edit-color-orange-${person.id}" name="edit-person-color-${person.id}" value="#f39c12" ${personColor === '#f39c12' ? 'checked' : ''}>
                        <label for="edit-color-orange-${person.id}" class="color-option" style="background-color: #f39c12;" title="Orange"></label>
                        
                        <input type="radio" id="edit-color-purple-${person.id}" name="edit-person-color-${person.id}" value="#9b59b6" ${personColor === '#9b59b6' ? 'checked' : ''}>
                        <label for="edit-color-purple-${person.id}" class="color-option" style="background-color: #9b59b6;" title="Purple"></label>
                        
                        <input type="radio" id="edit-color-teal-${person.id}" name="edit-person-color-${person.id}" value="#1abc9c" ${personColor === '#1abc9c' ? 'checked' : ''}>
                        <label for="edit-color-teal-${person.id}" class="color-option" style="background-color: #1abc9c;" title="Teal"></label>
                        
                        <input type="radio" id="edit-color-yellow-${person.id}" name="edit-person-color-${person.id}" value="#f1c40f" ${personColor === '#f1c40f' ? 'checked' : ''}>
                        <label for="edit-color-yellow-${person.id}" class="color-option" style="background-color: #f1c40f;" title="Yellow"></label>
                        
                        <input type="radio" id="edit-color-pink-${person.id}" name="edit-person-color-${person.id}" value="#e91e63" ${personColor === '#e91e63' ? 'checked' : ''}>
                        <label for="edit-color-pink-${person.id}" class="color-option" style="background-color: #e91e63;" title="Pink"></label>
                        
                        <input type="radio" id="edit-color-brown-${person.id}" name="edit-person-color-${person.id}" value="#8d6e63" ${personColor === '#8d6e63' ? 'checked' : ''}>
                        <label for="edit-color-brown-${person.id}" class="color-option" style="background-color: #8d6e63;" title="Brown"></label>
                        
                        <input type="radio" id="edit-color-gray-${person.id}" name="edit-person-color-${person.id}" value="#607d8b" ${personColor === '#607d8b' ? 'checked' : ''}>
                        <label for="edit-color-gray-${person.id}" class="color-option" style="background-color: #607d8b;" title="Gray"></label>
                    </div>
                    <div class="color-editor-actions">
                        <button class="btn btn-small" onclick="floorPlanner.savePersonColor('${person.id}')">Save</button>
                        <button class="btn btn-small btn-secondary" onclick="floorPlanner.cancelColorEdit('${person.id}')">Cancel</button>
                    </div>
                </div>
            `;

            // Add drag event listeners
            personItem.addEventListener('dragstart', (e) => this.handlePersonDragStart(e));
            personItem.addEventListener('dragend', (e) => this.handlePersonDragEnd(e));

            peopleList.appendChild(personItem);
        });
    }

    handlePersonDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', ''); // For compatibility
        
        // Make floor plan a drop zone if it's loaded
        if (this.floorPlanLoaded) {
            const floorPlanCanvas = document.getElementById('floor-plan-canvas');
            floorPlanCanvas.classList.add('drop-zone');
        }
    }

    handlePersonDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        
        // Remove drop zone styling
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        floorPlanCanvas.classList.remove('drop-zone', 'drag-over');
    }

    handleDragOver(e) {
        if (!this.floorPlanLoaded || !this.draggedElement) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        floorPlanCanvas.classList.add('drag-over');
    }

    handleDragLeave(e) {
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        if (!floorPlanCanvas.contains(e.relatedTarget)) {
            floorPlanCanvas.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        if (!this.floorPlanLoaded || !this.draggedElement) return;
        
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        floorPlanCanvas.classList.remove('drag-over', 'drop-zone');
        
        const personId = this.draggedElement.dataset.personId;
        const rect = floorPlanCanvas.getBoundingClientRect();
        
        // Calculate coordinates accounting for zoom level
        const x = (e.clientX - rect.left) / this.zoomLevel;
        const y = (e.clientY - rect.top) / this.zoomLevel;
        
        this.placePerson(personId, x, y);
    }

    placePerson(personId, x, y) {
        this.placedPeople.set(personId, { x, y });
        this.renderPeopleList();
        this.renderPlacedPeople();
        this.saveToStorage();
    }

    renderPlacedPeople() {
        if (!this.floorPlanLoaded) return;
        
        const personLabels = document.getElementById('person-labels');
        personLabels.innerHTML = '';

        this.placedPeople.forEach((position, personId) => {
            const person = this.people.find(p => p.id === personId);
            if (!person) return;

            const label = document.createElement('div');
            label.className = 'person-label';
            label.textContent = person.name;
            label.style.left = `${position.x}px`;
            label.style.top = `${position.y}px`;
            label.style.fontSize = `${this.labelSize}px`;
            label.style.backgroundColor = person.color || '#3498db';
            label.dataset.personId = personId;

            // Make labels draggable for repositioning
            label.draggable = true;
            label.addEventListener('dragstart', (e) => this.handleLabelDragStart(e));
            label.addEventListener('dragend', (e) => this.handleLabelDragEnd(e));
            label.addEventListener('dblclick', (e) => this.removePerson(personId));

            personLabels.appendChild(label);
        });
    }

    handleLabelDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        
        const rect = e.target.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }

    handleLabelDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    removePerson(personId) {
        this.placedPeople.delete(personId);
        this.renderPeopleList();
        this.renderPlacedPeople();
        this.saveToStorage();
    }

    handleFloorPlanUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            this.loadImageFile(file);
        } else if (file.type === 'application/pdf') {
            alert('PDF support requires additional libraries. Please convert your PDF to an image format (PNG, JPG) for now.');
        } else {
            alert('Please upload an image file (PNG, JPG, GIF) or PDF.');
        }
    }

    loadImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.floorPlanImageData = e.target.result;
            const img = document.getElementById('floor-plan-image');
            img.src = e.target.result;
            img.onload = () => {
                this.showFloorPlan();
                this.renderPlacedPeople();
                this.saveToStorage();
            };
        };
        reader.readAsDataURL(file);
    }

    showFloorPlan() {
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        const zoomControls = document.getElementById('zoom-controls');
        const labelSizeControls = document.getElementById('label-size-controls');
        
        uploadPlaceholder.style.display = 'none';
        floorPlanCanvas.style.display = 'block';
        zoomControls.style.display = 'flex';
        labelSizeControls.style.display = 'flex';
        this.floorPlanLoaded = true;
        
        // Apply current zoom and label size
        this.applyZoom();
        this.applyLabelSize();
    }

    // Zoom functionality methods
    zoomIn() {
        const newZoom = Math.min(this.zoomLevel + 0.25, 3.0); // Max 300%
        this.setZoomLevel(newZoom);
    }

    zoomOut() {
        const newZoom = Math.max(this.zoomLevel - 0.25, 0.25); // Min 25%
        this.setZoomLevel(newZoom);
    }

    setZoomLevel(zoomLevel) {
        this.zoomLevel = zoomLevel;
        this.applyZoom();
        this.updateZoomDisplay();
        this.saveToStorage();
    }

    applyZoom() {
        if (!this.floorPlanLoaded) return;
        
        const floorPlanContent = document.getElementById('floor-plan-content');
        floorPlanContent.style.transform = `scale(${this.zoomLevel})`;
    }

    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoom-display');
        const zoomSlider = document.getElementById('zoom-slider');
        
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
        if (zoomSlider) {
            zoomSlider.value = Math.round(this.zoomLevel * 100);
        }
    }

    // Label size functionality methods
    setLabelSize(fontSize) {
        this.labelSize = fontSize;
        this.applyLabelSize();
        this.updateLabelSizeDisplay();
        this.saveToStorage();
    }

    applyLabelSize() {
        const personLabels = document.querySelectorAll('.person-label');
        personLabels.forEach(label => {
            label.style.fontSize = `${this.labelSize}px`;
        });
    }

    updateLabelSizeDisplay() {
        const labelSizeDisplay = document.getElementById('label-size-display');
        const labelSizeSlider = document.getElementById('label-size-slider');
        
        if (labelSizeDisplay) {
            labelSizeDisplay.textContent = `${this.labelSize}px`;
        }
        if (labelSizeSlider) {
            labelSizeSlider.value = this.labelSize;
        }
    }

    exportFloorPlan() {
        if (!this.floorPlanLoaded) {
            alert('Please upload a floor plan first.');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.getElementById('floor-plan-image');
        const personLabels = document.getElementById('person-labels');

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Draw the floor plan image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Calculate scale factors
        const scaleX = canvas.width / img.offsetWidth;
        const scaleY = canvas.height / img.offsetHeight;

        // Draw person labels
        ctx.font = `${this.labelSize}px Arial`;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.placedPeople.forEach((position, personId) => {
            const person = this.people.find(p => p.id === personId);
            if (!person) return;

            const x = position.x * scaleX;
            const y = position.y * scaleY;
            const personColor = person.color || '#3498db';

            // Draw label background (rounded rectangle)
            const text = person.name;
            const textMetrics = ctx.measureText(text);
            const padding = 8;
            const labelWidth = textMetrics.width + padding * 2;
            const labelHeight = 20;

            ctx.fillStyle = personColor;
            ctx.fillRect(x - labelWidth/2, y - labelHeight/2, labelWidth, labelHeight);
            
            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);
        });

        // Download the image
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `floor-plan-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all people and the floor plan?')) {
            this.people = [];
            this.placedPeople.clear();
            this.floorPlanLoaded = false;
            this.floorPlanImageData = null;
            
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const floorPlanCanvas = document.getElementById('floor-plan-canvas');
            const floorPlanUpload = document.getElementById('floor-plan-upload');
            const zoomControls = document.getElementById('zoom-controls');
            const labelSizeControls = document.getElementById('label-size-controls');
            
            uploadPlaceholder.style.display = 'flex';
            floorPlanCanvas.style.display = 'none';
            zoomControls.style.display = 'none';
            labelSizeControls.style.display = 'none';
            floorPlanUpload.value = '';
            
            // Reset zoom and label size to defaults
            this.zoomLevel = 1.0;
            this.labelSize = 12;
            this.updateZoomDisplay();
            this.updateLabelSizeDisplay();
            
            this.renderPeopleList();
            this.saveToStorage();
        }
    }

    saveToStorage() {
        const data = {
            people: this.people,
            placedPeople: Array.from(this.placedPeople.entries()),
            zoomLevel: this.zoomLevel,
            labelSize: this.labelSize,
            floorPlanImageData: this.floorPlanImageData,
            floorPlanLoaded: this.floorPlanLoaded
        };
        localStorage.setItem('floor-planner-data', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('floor-planner-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.loadStateData(data);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    loadStateData(data) {
        this.people = data.people || [];
        this.placedPeople = new Map(data.placedPeople || []);
        this.zoomLevel = data.zoomLevel || 1.0;
        this.labelSize = data.labelSize || 12;
        this.floorPlanImageData = data.floorPlanImageData || null;
        this.floorPlanLoaded = data.floorPlanLoaded || false;
        
        // Restore floor plan if it exists
        if (this.floorPlanImageData && this.floorPlanLoaded) {
            const img = document.getElementById('floor-plan-image');
            img.src = this.floorPlanImageData;
            img.onload = () => {
                this.showFloorPlan();
                this.renderPlacedPeople();
            };
        }
        
        this.renderPeopleList();
        this.updateZoomDisplay();
        this.updateLabelSizeDisplay();
    }

    saveStateToFile() {
        const data = {
            people: this.people,
            placedPeople: Array.from(this.placedPeople.entries()),
            zoomLevel: this.zoomLevel,
            labelSize: this.labelSize,
            floorPlanImageData: this.floorPlanImageData,
            floorPlanLoaded: this.floorPlanLoaded,
            savedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `floor-planner-state-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadStateFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            alert('Please select a valid JSON state file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Loading this state will replace all current data. Are you sure you want to continue?')) {
                    this.loadStateData(data);
                    this.saveToStorage(); // Also save to localStorage
                    alert('State loaded successfully!');
                }
            } catch (error) {
                console.error('Error loading state file:', error);
                alert('Error loading state file. Please make sure it\'s a valid Floor Planner state file.');
            }
        };
        reader.readAsText(file);
        
        // Reset the file input
        event.target.value = '';
    }
}

// Initialize the application
const floorPlanner = new FloorPlanner();

// Handle mouse dragging for repositioning labels on the floor plan
let isDragging = false;
let draggedLabel = null;

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('person-label')) {
        isDragging = true;
        draggedLabel = e.target;
        draggedLabel.classList.add('dragging');
        
        const rect = draggedLabel.getBoundingClientRect();
        const containerRect = document.getElementById('floor-plan-canvas').getBoundingClientRect();
        
        floorPlanner.dragOffset.x = e.clientX - rect.left;
        floorPlanner.dragOffset.y = e.clientY - rect.top;
        
        e.preventDefault();
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && draggedLabel) {
        const containerRect = document.getElementById('floor-plan-canvas').getBoundingClientRect();
        
        // Calculate coordinates accounting for zoom level
        let x = (e.clientX - containerRect.left - floorPlanner.dragOffset.x) / floorPlanner.zoomLevel;
        let y = (e.clientY - containerRect.top - floorPlanner.dragOffset.y) / floorPlanner.zoomLevel;
        
        // Keep label within bounds (considering the unscaled container size)
        const maxX = (containerRect.width / floorPlanner.zoomLevel) - (draggedLabel.offsetWidth / floorPlanner.zoomLevel);
        const maxY = (containerRect.height / floorPlanner.zoomLevel) - (draggedLabel.offsetHeight / floorPlanner.zoomLevel);
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        draggedLabel.style.left = x + 'px';
        draggedLabel.style.top = y + 'px';
        
        e.preventDefault();
    }
});

document.addEventListener('mouseup', (e) => {
    if (isDragging && draggedLabel) {
        isDragging = false;
        draggedLabel.classList.remove('dragging');
        
        // Update the stored position
        const personId = draggedLabel.dataset.personId;
        const x = parseInt(draggedLabel.style.left);
        const y = parseInt(draggedLabel.style.top);
        
        floorPlanner.placedPeople.set(personId, { x, y });
        floorPlanner.saveToStorage();
        
        draggedLabel = null;
    }
});