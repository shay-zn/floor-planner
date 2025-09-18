class FloorPlanner {
    constructor() {
        this.people = [];
        this.placedPeople = new Map(); // Maps person ID to { x, y } coordinates
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.floorPlanLoaded = false;
        
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

        addPersonBtn.addEventListener('click', () => this.showPersonInput());
        savePersonBtn.addEventListener('click', () => this.savePerson());
        cancelPersonBtn.addEventListener('click', () => this.hidePersonInput());
        
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

        // Clear all functionality
        const clearAllBtn = document.getElementById('clear-all-btn');
        clearAllBtn.addEventListener('click', () => this.clearAll());

        // Drag and drop for floor plan container
        const floorPlanContainer = document.getElementById('floor-plan-container');
        floorPlanContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
        floorPlanContainer.addEventListener('drop', (e) => this.handleDrop(e));
        floorPlanContainer.addEventListener('dragleave', (e) => this.handleDragLeave(e));
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
        personInput.style.display = 'none';
        personNameInput.value = '';
    }

    savePerson() {
        const personNameInput = document.getElementById('person-name-input');
        const name = personNameInput.value.trim();
        
        if (name) {
            const person = {
                id: Date.now().toString(),
                name: name,
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

    renderPeopleList() {
        const peopleList = document.getElementById('people-list');
        peopleList.innerHTML = '';

        this.people.forEach(person => {
            const personItem = document.createElement('div');
            personItem.className = 'person-item';
            personItem.draggable = true;
            personItem.dataset.personId = person.id;

            const isPlaced = this.placedPeople.has(person.id);

            personItem.innerHTML = `
                <div class="person-name">${person.name}</div>
                <div class="person-status ${isPlaced ? 'placed' : ''}">${isPlaced ? 'Placed' : 'Available'}</div>
                <button class="delete-person-btn" onclick="floorPlanner.deletePerson('${person.id}')">×</button>
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
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
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
            const img = document.getElementById('floor-plan-image');
            img.src = e.target.result;
            img.onload = () => {
                this.showFloorPlan();
                this.renderPlacedPeople();
            };
        };
        reader.readAsDataURL(file);
    }

    showFloorPlan() {
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        const floorPlanCanvas = document.getElementById('floor-plan-canvas');
        
        uploadPlaceholder.style.display = 'none';
        floorPlanCanvas.style.display = 'block';
        this.floorPlanLoaded = true;
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
        ctx.font = '14px Arial';
        ctx.fillStyle = '#3498db';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.placedPeople.forEach((position, personId) => {
            const person = this.people.find(p => p.id === personId);
            if (!person) return;

            const x = position.x * scaleX;
            const y = position.y * scaleY;

            // Draw label background (rounded rectangle)
            const text = person.name;
            const textMetrics = ctx.measureText(text);
            const padding = 8;
            const labelWidth = textMetrics.width + padding * 2;
            const labelHeight = 20;

            ctx.fillStyle = '#3498db';
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
            
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const floorPlanCanvas = document.getElementById('floor-plan-canvas');
            const floorPlanUpload = document.getElementById('floor-plan-upload');
            
            uploadPlaceholder.style.display = 'flex';
            floorPlanCanvas.style.display = 'none';
            floorPlanUpload.value = '';
            
            this.renderPeopleList();
            this.saveToStorage();
        }
    }

    saveToStorage() {
        const data = {
            people: this.people,
            placedPeople: Array.from(this.placedPeople.entries())
        };
        localStorage.setItem('floor-planner-data', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('floor-planner-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.people = data.people || [];
                this.placedPeople = new Map(data.placedPeople || []);
                this.renderPeopleList();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
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
        
        let x = e.clientX - containerRect.left - floorPlanner.dragOffset.x;
        let y = e.clientY - containerRect.top - floorPlanner.dragOffset.y;
        
        // Keep label within bounds
        x = Math.max(0, Math.min(x, containerRect.width - draggedLabel.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.height - draggedLabel.offsetHeight));
        
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