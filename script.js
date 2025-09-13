   // DOM Elements
        const urlForm = document.getElementById('urlForm');
        const urlInput = document.getElementById('urlInput');
        const shortenBtn = document.getElementById('shortenBtn');
        const errorMessage = document.getElementById('errorMessage');
        const resultsSection = document.getElementById('resultsSection');

        // State
        let shortenedUrls = [];
        let isLoading = false;

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadShortenedUrls();
            setupEventListeners();
            setupMobileMenu();  /*added*/
        });

        // Event Listeners
        function setupEventListeners() {
            urlForm.addEventListener('submit', handleFormSubmit);
            urlInput.addEventListener('input', handleInputChange);
        }
       // Setup mobile menu functionality
        function setupMobileMenu() {
            const mobileMenuToggle = document.getElementById('header');
                const screenWidth = window.innerWidth;
                console.log(screenWidth);
                if (screenWidth < 767) {
                    mobileMenuToggle.innerHTML = `
                    <img src="images/logo.svg" alt="Shortly Logo" class="logo-image">
                    <img src="images/menu.png" alt="menu Logo" id="menu-image">`;
                     menuContainer = document.createElement("div");
                     menuContainer.id = "mobile-menu";
                    menuContainer.innerHTML = `
                        <ul class="nav-links">
                        <li><a href="#" id="features-link">Features</a></li>
                        <li><a href="#" id="pricing-link">Pricing</a></li>
                        <li><a href="#" id="resources-link">Resources</a></li>
                        </ul>
                        <div class="divider"></div>
                        <div class="header-buttons">
                        <button class="login-btn" id="login-btn">Login</button>
                        <button class="signup-btn" id="signup-btn">Sign Up</button>
                        </div>`; 
                    mobileMenuToggle.insertAdjacentElement("afterend", menuContainer);
                     }
                     else {
                            // 👉 Desktop Header
                            header.innerHTML = `
                            <img src="images/logo.svg" alt="Shortly Logo" class="logo-image">
                            <nav class="nav-links">
                                <a href="#">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Resources</a>
                            </nav>
                            <div class="header-buttons">
                                <button class="login-btn">Login</button>
                                <button class="signup-btn">Sign Up</button>
                            </div>
                            `;

                            // Remove mobile menu if it exists
                            const menuContainer = document.getElementById("mobile-menu");
                            if (menuContainer) menuContainer.remove();
                        }
                document.getElementById('menu-image').addEventListener('click', function () {
                   menuContainer.classList.toggle("active");
                    });
                   
        }
        window.addEventListener("resize", setupMobileMenu);
        // Load shortened URLs from memory (since localStorage is not available)
        function loadShortenedUrls() {
            renderUrlsList();
        }

        // Handle form submission
        async function handleFormSubmit(event) {
            event.preventDefault();
            
            if (isLoading) return;
            
            const url = urlInput.value.trim();
            
            // Clear previous errors
            hideError();
            
            // Validate URL
            if (!validateUrl(url)) {
                return;
            }
            
            // Start loading state
            setLoadingState(true);
            
            try {
                const shortenedUrl = await shortenUrlWithAPI(url);
                
                // Create new shortened URL object
                const newShortenedUrl = {
                    id: Date.now().toString(),
                    originalUrl: shortenedUrl.originalUrl,
                    shortUrl: shortenedUrl.shortUrl,
                    createdAt: new Date().toISOString()
                };
                
                // Add to beginning of array
                shortenedUrls.unshift(newShortenedUrl);
                
                // Update UI
                renderUrlsList();
                
                // Clear input
                urlInput.value = '';
                
            } catch (error) {
                showError(error.message || 'Failed to shorten URL. Please try again.');
            } finally {
                setLoadingState(false);
            }
        }

        // Handle input changes
        function handleInputChange() {
            hideError();
            urlInput.classList.remove('error');
        }

        // URL validation function
        function validateUrl(url) {
            if (!url) {
                showError('Please add a link');
                return false;
            }
            
            try {
                let testUrl;
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    testUrl = new URL('https://' + url);
                } else {
                    testUrl = new URL(url);
                }
                
                if (!testUrl.hostname || testUrl.hostname.length < 3) {
                    showError('Please add a valid link');
                    return false;
                }
                
                if (!testUrl.hostname.includes('.')) {
                    showError('Please add a valid link');
                    return false;
                }
                
                return true;
            } catch (error) {
                showError('Please add a valid link');
                return false;
            }
        }

        // Shorten URL using backend API
        async function shortenUrlWithAPI(url) {
            const urlToShorten = url.startsWith('http') ? url : `https://${url}`;
            
            try {
                const response = await fetch("http://localhost:3000/shorten", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: urlToShorten })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to shorten URL');
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                return {
                    originalUrl: urlToShorten,
                    shortUrl: data.result_url
                };
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }

        // Show error message
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            urlInput.classList.add('error');
        }

        // Hide error message
        function hideError() {
            errorMessage.classList.add('hidden');
            urlInput.classList.remove('error');
        }

        // Set loading state
        function setLoadingState(loading) {
            isLoading = loading;
            
            const btnText = shortenBtn.querySelector('.btn-text');
            const loadingSpinner = shortenBtn.querySelector('.loading-spinner');
            
            if (loading) {
                btnText.classList.add('hidden');
                loadingSpinner.classList.remove('hidden');
                shortenBtn.disabled = true;
            } else {
                btnText.classList.remove('hidden');
                loadingSpinner.classList.add('hidden');
                shortenBtn.disabled = false;
            }
        }

        // Render URLs list
        function renderUrlsList() {
            if (shortenedUrls.length === 0) {
                resultsSection.innerHTML = '';
                return;
            }
            
            resultsSection.innerHTML = shortenedUrls.map(url => createUrlItemHTML(url)).join('');
            
            // Add event listeners for copy buttons
            addCopyButtonListeners();
        }

        // Create HTML for URL item
        function createUrlItemHTML(urlItem) {
            return `
                <div class="result-item">
                    <div class="result-row">
                        <span class="original-url" title="${urlItem.originalUrl}">${urlItem.originalUrl}</span>
                        <a href="${urlItem.shortUrl}" target="_blank" rel="noopener noreferrer" class="short-url">${urlItem.shortUrl}</a>
                        <button class="copy-btn" data-url="${urlItem.shortUrl}" data-id="${urlItem.id}">Copy</button>
                    </div>
                </div>
            `;
        }

        // Add event listeners for copy buttons
        function addCopyButtonListeners() {
            const copyButtons = document.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
                button.addEventListener('click', handleCopyClick);
            });
        }

        // Handle copy button click
        async function handleCopyClick(event) {
            const button = event.currentTarget;
            const url = button.dataset.url;
            
            try {
                await navigator.clipboard.writeText(url);
                
                // Update button to show success
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('copied');
                }, 2000);
                
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                
                // Fallback for older browsers
                fallbackCopyToClipboard(url);
            }
        }

        // Fallback copy method for older browsers
        function fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                console.log('Fallback: Text copied to clipboard');
            } catch (error) {
                console.error('Fallback: Unable to copy to clipboard', error);
            }
            
            document.body.removeChild(textArea);
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            // Ctrl/Cmd + Enter to submit form
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                if (document.activeElement === urlInput) {
                    urlForm.dispatchEvent(new Event('submit'));
                }
            }
            
            // Escape to clear input
            if (event.key === 'Escape') {
                if (document.activeElement === urlInput) {
                    urlInput.value = '';
                    hideError();
                }
            }
        });
        