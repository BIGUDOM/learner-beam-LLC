        // DOM Elements
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const submitProofBtn = document.getElementById('submitProofBtn');
        const successMessage = document.getElementById('successMessage');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropZone.classList.add('drag-over');
        }
        
        function unhighlight() {
            dropZone.classList.remove('drag-over');
        }
        
        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                handleFiles(files);
            }
        }
        
        // Handle file selection via button
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFiles(e.target.files);
            }
        });
        
        // Handle files
        function handleFiles(files) {
            const file = files[0];
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a JPG, PNG, or GIF image.');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please upload a smaller image.');
                return;
            }
            
            // Display preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.classList.add('active');
                dropZone.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
        
        // Remove image
        removeBtn.addEventListener('click', () => {
            imagePreview.src = '';
            previewContainer.classList.remove('active');
            dropZone.style.display = 'block';
            fileInput.value = '';
        });
        
        // Retake photo
        retakeBtn.addEventListener('click', () => {
            previewContainer.classList.remove('active');
            dropZone.style.display = 'block';
            fileInput.value = '';
            fileInput.click();
        });
        
        // Submit proof
        submitProofBtn.addEventListener('click', () => {
            if (!imagePreview.src) {
                alert('Please upload a payment proof screenshot first.');
                return;
            }
            
            // Show loading state
            submitProofBtn.disabled = true;
            submitProofBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Simulate submission delay
            setTimeout(() => {
                // Show success message
                successMessage.classList.add('active');
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Hide submit button after delay
                setTimeout(() => {
                    submitProofBtn.style.display = 'none';
                }, 1000);
            }, 1500);
        });
        
        // WhatsApp support
        document.querySelector('.whatsapp-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Do you need help with uploading your payment proof? Click OK to chat with our support team on WhatsApp.')) {
                window.open('https://wa.me/18312668653?text=Hello%20I%20need%20help%20with%20my%20payment%20proof', '_blank');
            }
        });