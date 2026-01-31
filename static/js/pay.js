       // DOM Elements
        const countdownTimer = document.getElementById('countdownTimer');
        const copyBtn = document.getElementById('copyBtn');
        const walletAddress = document.getElementById('walletAddress').textContent.trim();
        const paymentBtn = document.getElementById('paymentBtn');
        const proofSection = document.getElementById('proofSection');
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const submitProofBtn = document.getElementById('submitProofBtn');
        const successMessage = document.getElementById('successMessage');
        
        // Countdown Timer
        let timeLeft = 15 * 60; // 15 minutes in seconds
        
        const timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                countdownTimer.textContent = "Payment time expired";
                countdownTimer.style.background = "rgba(239, 68, 68, 0.2)";
                paymentBtn.disabled = true;
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} minutes remaining`;
            
            // Change color when less than 2 minutes
            if (timeLeft < 120) {
                countdownTimer.style.background = "rgba(245, 158, 11, 0.3)";
            }
            
            timeLeft--;
        }, 1000);
        
        // Copy Wallet Address
        copyBtn.addEventListener('click', () => {
            const address = walletAddress.replace('Copy', '').trim();
            navigator.clipboard.writeText(address).then(() => {
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#10b981';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.style.background = '';
                }, 2000);
            });
        });
        
        // Show Proof Section
        paymentBtn.addEventListener('click', () => {
            proofSection.classList.add('active');
            paymentBtn.style.display = 'none';
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        
        // File Upload Handling
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim();
            dropZone.style.backgroundColor = '#f0f9ff';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#cbd5e1';
            dropZone.style.backgroundColor = '#f8fafc';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#cbd5e1';
            dropZone.style.backgroundColor = '#f8fafc';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });
        
        function handleFileSelect(file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a JPG, PNG, or GIF image.');
                fileInput.value = '';
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please upload a smaller image.');
                fileInput.value = '';
                return;
            }
            
            // Display preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.classList.add('active');
            };
            reader.readAsDataURL(file);
        }
        
        // Submit Proof

        
        // Prevent closing timer on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // Store the time when page is hidden
                localStorage.setItem('paymentPageHiddenTime', Date.now());
            } else if (document.visibilityState === 'visible') {
                // Calculate time difference and adjust timer
                const hiddenTime = localStorage.getItem('paymentPageHiddenTime');
                if (hiddenTime) {
                    const timeDiff = Math.floor((Date.now() - hiddenTime) / 1000);
                    timeLeft = Math.max(0, timeLeft - timeDiff);
                    localStorage.removeItem('paymentPageHiddenTime');
                }
            }
        });

submitProofBtn.addEventListener('click', async () => {
    if (!fileInput.files.length) {
        alert('Please upload a screenshot of your payment transaction.');
        return;
    }

    const formData = new FormData();
    const rawAmount = document
    .querySelector('.payment-card')
    .getAttribute('data-amount');

    // remove commas
    const cleanAmount = rawAmount.replace(/,/g, '');
    console.log("Amount", cleanAmount)
    formData.append('proofImage', fileInput.files[0]);
    formData.append(
        'amount',
         cleanAmount
        
    );

    try {
        const response = await fetch('/payment/upload_proof', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === "success") {
            alert('Proof uploaded successfully!');
        } else {
            alert(result.message || 'Failed to upload proof.');
        }
    } catch (error) {
        console.error('Error uploading proof:', error);
    }
});
