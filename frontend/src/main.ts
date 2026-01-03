import './style.css'

const uploadArea = document.getElementById('uploadArea')!;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const preview = document.getElementById('preview')!;
const previewImage = document.getElementById('previewImage') as HTMLImageElement;
const filenameInput = document.getElementById('filenameInput') as HTMLInputElement;
const filenameExtension = document.getElementById('filenameExtension')!;
const filenameWrapper = document.getElementById('filenameWrapper')!;
const filenameError = document.getElementById('filenameError')!;
const uploadBtn = document.getElementById('uploadBtn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancelBtn')!;
const message = document.getElementById('message')!;

let originalFile: File | null = null;
let fileExtension = '';

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragging');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragging');

    const files = e.dataTransfer!.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        handleFileSelect(target.files[0]);
    }
});

filenameInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    validateFilename(target.value);
});

cancelBtn.addEventListener('click', () => {
    resetForm();
});

function validateFilename(filename: string): boolean {
    const valid = /^[a-zA-Z0-9_-]+$/.test(filename);

    if (filename === '') {
        filenameWrapper.classList.remove('error');
        filenameError.style.display = 'none';
        uploadBtn.disabled = true;
        return false;
    }

    if (!valid) {
        filenameWrapper.classList.add('error');
        filenameError.style.display = 'block';
        uploadBtn.disabled = true;
        return false;
    }

    filenameWrapper.classList.remove('error');
    filenameError.style.display = 'none';
    uploadBtn.disabled = false;
    return true;
}

function handleFileSelect(file: File) {
    originalFile = file;

    // Get file extension
    const nameParts = file.name.split('.');
    fileExtension = nameParts.length > 1 ? '.' + nameParts.pop()!.toLowerCase() : '.jpg';

    // Auto-populate filename (remove extension and keep allowed characters)
    const baseName = nameParts.join('.').replace(/[^a-zA-Z0-9_-]/g, '');
    filenameInput.value = baseName || 'image';
    filenameExtension.textContent = fileExtension;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target!.result as string;
        uploadArea.style.display = 'none';
        preview.style.display = 'block';
        message.style.display = 'none';
        validateFilename(filenameInput.value);
    };
    reader.readAsDataURL(file);
}

uploadBtn.addEventListener('click', async () => {
    if (!originalFile || !validateFilename(filenameInput.value)) return;

    // Lowercase the filename when saving
    const finalFilename = filenameInput.value.toLowerCase() + fileExtension;
    const renamedFile = new File([originalFile], finalFilename, { type: originalFile.type });

    const formData = new FormData();
    formData.append('image', renamedFile);

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('success', `Image uploaded successfully: ${data.filename}`);

            // Reload images to update the count and list
            await loadImages();

            setTimeout(() => {
                resetForm();
            }, 2000);
        } else {
            showMessage('error', 'Upload failed. Please try again.');
        }
    } catch (error) {
        showMessage('error', 'Upload failed. Please try again.');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Image';
    }
});

function showMessage(type: string, text: string) {
    message.className = `message ${type}`;
    message.textContent = text;
    message.style.display = 'block';
}

function resetForm() {
    originalFile = null;
    fileExtension = '';
    fileInput.value = '';
    filenameInput.value = '';
    uploadArea.style.display = 'block';
    preview.style.display = 'none';
    previewImage.src = '';
    message.style.display = 'none';
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload Image';
    filenameWrapper.classList.remove('error');
    filenameError.style.display = 'none';
}

// Image list management
const imageListToggle = document.getElementById('imageListToggle')!;
const imageListContent = document.getElementById('imageListContent')!;
const expandIcon = document.getElementById('expandIcon')!;
const imageItems = document.getElementById('imageItems')!;
const imageCount = document.getElementById('imageCount')!;
const noImages = document.getElementById('noImages')!;
const selectAll = document.getElementById('selectAll') as HTMLInputElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;

interface Image {
    filename: string;
    url: string;
    uploadedAt: string;
    size: number;
}

let allImages: Image[] = [];
let isExpanded = false;

imageListToggle.addEventListener('click', () => {
    isExpanded = !isExpanded;
    imageListContent.classList.toggle('expanded', isExpanded);
    expandIcon.classList.toggle('expanded', isExpanded);
});

async function loadImages() {
    try {
        const response = await fetch('/images');
        if (!response.ok) throw new Error('Failed to load images');

        const data = await response.json();
        allImages = data.images;
        renderImages();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function renderImages() {
    imageCount.textContent = `${allImages.length} image${allImages.length !== 1 ? 's' : ''}`;

    // Clear existing items (except select-all controls)
    const selectAllControls = imageItems.querySelector('.select-all-controls')!;
    imageItems.innerHTML = '';
    imageItems.appendChild(selectAllControls);

    if (allImages.length === 0) {
        noImages.style.display = 'block';
        imageItems.appendChild(noImages);
        (selectAllControls as HTMLElement).style.display = 'none';
        return;
    }

    (selectAllControls as HTMLElement).style.display = 'flex';
    noImages.style.display = 'none';

    allImages.forEach((image) => {
        const item = document.createElement('div');
        item.className = 'image-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'image-checkbox';
        checkbox.dataset.filename = image.filename;
        checkbox.addEventListener('change', updateDeleteButton);

        const thumbnail = document.createElement('img');
        thumbnail.className = 'image-thumbnail';
        thumbnail.src = image.url;
        thumbnail.alt = image.filename;

        const info = document.createElement('div');
        info.className = 'image-info';

        const name = document.createElement('div');
        name.className = 'image-name';
        name.textContent = image.filename;
        name.title = image.filename; // Show full filename on hover

        const meta = document.createElement('div');
        meta.className = 'image-meta';
        const uploadDate = new Date(image.uploadedAt);
        const formattedDate = uploadDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const sizeKB = (image.size / 1024).toFixed(1);
        meta.textContent = `${formattedDate} • ${sizeKB} KB`;

        info.appendChild(name);
        info.appendChild(meta);
        item.appendChild(checkbox);
        item.appendChild(thumbnail);
        item.appendChild(info);
        imageItems.appendChild(item);
    });
}

function updateDeleteButton() {
    const checkboxes = imageItems.querySelectorAll('.image-checkbox:not(#selectAll)') as NodeListOf<HTMLInputElement>;
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

    deleteBtn.disabled = checkedCount === 0;
    deleteBtn.textContent = checkedCount > 0 ? `Delete ${checkedCount} Selected` : 'Delete Selected';

    // Update select all checkbox
    const allChecked = checkedCount === checkboxes.length && checkboxes.length > 0;
    selectAll.checked = allChecked;
}

selectAll.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const checkboxes = imageItems.querySelectorAll('.image-checkbox:not(#selectAll)') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = target.checked);
    updateDeleteButton();
});

deleteBtn.addEventListener('click', async () => {
    const checkboxes = imageItems.querySelectorAll('.image-checkbox:not(#selectAll):checked') as NodeListOf<HTMLInputElement>;
    const filenames = Array.from(checkboxes).map(cb => cb.dataset.filename!);

    if (filenames.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${filenames.length} image${filenames.length !== 1 ? 's' : ''}?`)) {
        return;
    }

    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filenames })
        });

        if (response.ok) {
            showMessage('success', `Successfully deleted ${filenames.length} image${filenames.length !== 1 ? 's' : ''}`);
            setTimeout(() => {
                message.style.display = 'none';
            }, 3000);
            loadImages();
        } else {
            showMessage('error', 'Delete failed. Please try again.');
        }
    } catch (error) {
        showMessage('error', 'Delete failed. Please try again.');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Delete Selected';
        selectAll.checked = false;
    }
});

// Load images on page load
loadImages();

// Handle shared images from PWA Share Target API
async function handleSharedFiles() {
    const url = new URL(window.location.href);

    // Check if we have a success parameter from share redirect
    if (url.searchParams.get('shared') === 'success') {
        showMessage('success', 'Image shared successfully!');

        // Reload images to show the newly shared image
        await loadImages();

        // Clean up the URL without reloading the page
        window.history.replaceState({}, '', '/');

        // Auto-hide the message after 3 seconds
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
}

// Check for shared files on page load
handleSharedFiles();
