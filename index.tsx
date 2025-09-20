/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Chat } from "@google/genai";

interface EditableContentState {
    originalHTML: string;
    currentHTML: string;
    element: HTMLElement; // The span holding the text
    controlsContainer: HTMLElement;
    editButton: HTMLButtonElement;
    saveButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
}

interface SiteSettingConfig {
    displayElement: HTMLElement | null;
    inputElement: HTMLInputElement | null;
    originalValue: string;
    currentValue: string;
    isHref?: boolean;
    hrefPrefix?: string;
    displaySuffixElement?: HTMLElement | null; 
    inputSuffixElement?: HTMLInputElement | null;
    originalSuffixValue?: string;
    currentSuffixValue?: string;
}

interface PortfolioItem {
    id: string;
    title: string;
    imageSrc: string;
}

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    category: string;
    imageSrc: string;
}

interface FeaturedWorkItem {
    id: string;
    title: string;
    imageSrc: string;
    description: string;
}

interface GalleryItem {
    id: string;
    type: 'image' | 'video';
    src: string; // data:URL
    title: string;
    fileType: string; // e.g., 'image/jpeg' or 'video/mp4'
    captionSrc?: string; // data:URL for .vtt or .srt file
}

interface SlideshowItem {
    id: string;
    src: string;
}

interface SlideshowManagerConfig {
    containerId: string;
    dotsId: string;
    adminListId: string;
    addFormId: string;
    fileInputId: string;
    statusMessageId: string;
    storageKey: string;
    defaultItems: SlideshowItem[];
}

interface CEOInfo {
    name: string;
    message: string;
    imageSrc: string;
}

document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage Keys
    const LS_KEYS = {
        EDITABLE_CONTENT: 'logan-design-editable-content',
        SITE_SETTINGS: 'logan-design-site-settings',
        SLIDESHOW: 'logan-design-slideshow',
        PORTFOLIO_SLIDESHOW: 'logan-design-portfolio-slideshow',
        ABOUT_SLIDESHOW: 'logan-design-about-slideshow',
        PORTFOLIO: 'logan-design-portfolio',
        GALLERY: 'logan-design-gallery',
        SERVICES: 'logan-design-services',
        FEATURED_WORK: 'logan-design-featured-work',
        SITE_LOGO: 'logan-design-site-logo',
        CEO_INFO: 'logan-design-ceo-info',
    };

    const navLinks = document.querySelectorAll<HTMLAnchorElement>('nav ul li a.nav-link');
    const contentSections = document.querySelectorAll<HTMLElement>('.content-section');
    const quoteForm = document.getElementById('quoteForm') as HTMLFormElement;
    const currentYearSpan = document.getElementById('currentYear');
    const headerElement = document.querySelector('header') as HTMLElement;
    const shareButton = document.getElementById('shareButton') as HTMLButtonElement;
    const headerLogoImage = document.getElementById('headerLogoImage') as HTMLImageElement;

    // Admin Panel Elements
    const adminLoginForm = document.getElementById('adminLoginForm') as HTMLFormElement;
    const adminLoginError = document.getElementById('adminLoginError') as HTMLDivElement;
    const adminUsernameInput = document.getElementById('adminUsername') as HTMLInputElement;
    const adminPasswordInput = document.getElementById('adminPassword') as HTMLInputElement;
    const adminLogoutButton = document.getElementById('adminLogoutButton') as HTMLButtonElement;
    const adminLoginFooterLink = document.getElementById('adminLoginFooterLink') as HTMLAnchorElement;
    const forgotPasswordLink = document.getElementById('forgotPasswordLink') as HTMLAnchorElement;

    // Site Settings Form Elements
    const siteSettingsForm = document.getElementById('siteSettingsForm') as HTMLFormElement;
    const siteSettingsStatusMessage = document.getElementById('siteSettingsStatusMessage') as HTMLDivElement;
    const siteLogoInput = document.getElementById('siteLogoInput') as HTMLInputElement;
    const siteLogoStatusMessage = document.getElementById('siteLogoStatusMessage') as HTMLDivElement;
    
    // Services Management Elements
    const servicesGridElement = document.getElementById('servicesGrid') as HTMLElement;
    const homeServicesGridElement = document.getElementById('homeServicesGrid') as HTMLElement;
    const addServiceForm = document.getElementById('addServiceForm') as HTMLFormElement;
    const serviceImageInput = document.getElementById('serviceImageInput') as HTMLInputElement;
    const serviceTitleInput = document.getElementById('serviceTitleInput') as HTMLInputElement;
    const serviceCategoryInput = document.getElementById('serviceCategoryInput') as HTMLInputElement;
    const serviceDescriptionInput = document.getElementById('serviceDescriptionInput') as HTMLTextAreaElement;
    const addServiceStatusMessage = document.getElementById('addServiceStatusMessage') as HTMLDivElement;
    const adminServicesListElement = document.getElementById('adminServicesList') as HTMLDivElement;

    // Portfolio Management Elements
    const portfolioGridElement = document.querySelector<HTMLElement>('#portfolio .portfolio-grid');
    const addPortfolioItemForm = document.getElementById('addPortfolioItemForm') as HTMLFormElement;
    const portfolioImageInput = document.getElementById('portfolioImageInput') as HTMLInputElement;
    const portfolioTitleInput = document.getElementById('portfolioTitleInput') as HTMLInputElement;
    const addPortfolioStatusMessage = document.getElementById('addPortfolioStatusMessage') as HTMLDivElement;
    const adminPortfolioItemsListElement = document.getElementById('adminPortfolioItemsList') as HTMLDivElement;
    
    // Featured Work Management Elements
    const featuredWorkGridElement = document.getElementById('featuredWorkGrid') as HTMLElement;
    const addFeaturedWorkForm = document.getElementById('addFeaturedWorkForm') as HTMLFormElement;
    const featuredWorkImageInput = document.getElementById('featuredWorkImageInput') as HTMLInputElement;
    const featuredWorkTitleInput = document.getElementById('featuredWorkTitleInput') as HTMLInputElement;
    const featuredWorkDescriptionInput = document.getElementById('featuredWorkDescriptionInput') as HTMLTextAreaElement;
    const addFeaturedWorkStatusMessage = document.getElementById('addFeaturedWorkStatusMessage') as HTMLDivElement;
    const adminFeaturedWorkListElement = document.getElementById('adminFeaturedWorkList') as HTMLDivElement;
    
    // Gallery Management Elements
    const galleryGridElement = document.getElementById('galleryGrid') as HTMLElement;
    const addGalleryItemForm = document.getElementById('addGalleryItemForm') as HTMLFormElement;
    const galleryFileInput = document.getElementById('galleryFileInput') as HTMLInputElement;
    const galleryTitleInput = document.getElementById('galleryTitleInput') as HTMLInputElement;
    const addGalleryStatusMessage = document.getElementById('addGalleryStatusMessage') as HTMLDivElement;
    const adminGalleryItemsListElement = document.getElementById('adminGalleryItemsList') as HTMLDivElement;
    
    // Lightbox Elements
    const lightbox = document.getElementById('lightbox') as HTMLDivElement;
    const lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement;
    const lightboxCaption = document.getElementById('lightboxCaption') as HTMLDivElement;
    const lightboxClose = document.querySelector('.lightbox-close') as HTMLButtonElement;

    // CEO Section Elements
    const ceoInfoForm = document.getElementById('ceoInfoForm') as HTMLFormElement;
    const ceoImageInput = document.getElementById('ceoImageInput') as HTMLInputElement;
    const ceoNameInput = document.getElementById('ceoNameInput') as HTMLInputElement;
    const ceoMessageInput = document.getElementById('ceoMessageInput') as HTMLTextAreaElement;
    const ceoInfoStatusMessage = document.getElementById('ceoInfoStatusMessage') as HTMLDivElement;
    const ceoImageDisplay = document.getElementById('ceoImageDisplay') as HTMLImageElement;
    const ceoNameDisplay = document.getElementById('ceoNameDisplay') as HTMLElement;
    const ceoMessageDisplay = document.getElementById('ceoMessageDisplay') as HTMLElement;

    // AI Chat Widget Elements
    const chatToggleButton = document.getElementById('chatToggleButton') as HTMLButtonElement;
    const chatWindow = document.getElementById('chatWindow') as HTMLDivElement;
    const chatCloseButton = document.getElementById('chatCloseButton') as HTMLButtonElement;
    const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;
    const aiChatForm = document.getElementById('aiChatForm') as HTMLFormElement;
    const aiChatInput = document.getElementById('aiChatInput') as HTMLInputElement;
    const aiChatSendButton = document.getElementById('aiChatSendButton') as HTMLButtonElement;
    const chatWidgetContainer = document.getElementById('chatWidgetContainer') as HTMLDivElement;

    let isAdminLoggedIn = false;
    const ADMIN_USERNAME = "LOGAN'S DESIGN"; 
    const ADMIN_PASSWORD = "LOGAN'S"; 

    const editableElementsState = new Map<string, EditableContentState>();
    const siteSettingsConfig = new Map<string, SiteSettingConfig>();

    let portfolioItems: PortfolioItem[] = [];
    let galleryItems: GalleryItem[] = [];
    let serviceItems: ServiceItem[] = [];
    let featuredWorkItems: FeaturedWorkItem[] = [];
    let ceoInfo: CEOInfo;
    let currentLogoSrc = '';
    let pendingLogoSrc = '';
    let lastFocusedElement: HTMLElement | null = null;
    let currentServiceFilter = 'all';
    let currentGallerySearchTerm = '';
    let aiChat: Chat | null = null;

    // --- Persistence Functions ---
    function safeSaveToLocalStorage(key: string, value: string): boolean {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                const statusElement = document.getElementById('siteSettingsStatusMessage'); 
                const message = 'Storage Error: Browser storage is full. Please delete some items (e.g., gallery, slides) to free up space.';
                if (statusElement) {
                    showAdminStatusMessage(statusElement, message, true, 10000);
                } else {
                    alert(message);
                }
            } else {
                console.error(`Failed to save to localStorage for key "${key}"`, e);
            }
            return false;
        }
    }
    
    function saveEditableContent() {
        const stateToSave: { [key: string]: string } = {};
        editableElementsState.forEach((state, key) => {
            stateToSave[key] = state.currentHTML;
        });
        safeSaveToLocalStorage(LS_KEYS.EDITABLE_CONTENT, JSON.stringify(stateToSave));
    }

    function loadEditableContent() {
        const savedStateJSON = localStorage.getItem(LS_KEYS.EDITABLE_CONTENT);
        if (!savedStateJSON) return;
        try {
            const savedState = JSON.parse(savedStateJSON);
            for (const id in savedState) {
                if (editableElementsState.has(id)) {
                    const state = editableElementsState.get(id)!;
                    state.currentHTML = savedState[id];
                    state.element.innerHTML = savedState[id];
                }
            }
        } catch (e) {
            console.error('Failed to load editable content from storage', e);
        }
    }

    function saveSiteSettings() {
        const settingsToSave: { [key: string]: { currentValue: string; currentSuffixValue?: string } } = {};
        siteSettingsConfig.forEach((config, key) => {
            settingsToSave[key] = {
                currentValue: config.currentValue,
                currentSuffixValue: config.currentSuffixValue,
            };
        });
        safeSaveToLocalStorage(LS_KEYS.SITE_SETTINGS, JSON.stringify(settingsToSave));
    }

    function loadSiteSettings() {
        const savedSettingsJSON = localStorage.getItem(LS_KEYS.SITE_SETTINGS);
        if (!savedSettingsJSON) return;
        try {
            const savedSettings = JSON.parse(savedSettingsJSON);
            for (const key in savedSettings) {
                if (siteSettingsConfig.has(key)) {
                    const config = siteSettingsConfig.get(key)!;
                    config.currentValue = savedSettings[key].currentValue;
                    if (savedSettings[key].currentSuffixValue !== undefined) {
                        config.currentSuffixValue = savedSettings[key].currentSuffixValue;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load site settings from storage', e);
        }
    }

    function savePortfolio() {
        safeSaveToLocalStorage(LS_KEYS.PORTFOLIO, JSON.stringify(portfolioItems));
        updateAdminStats();
    }

    function loadPortfolio() {
        const savedPortfolioJSON = localStorage.getItem(LS_KEYS.PORTFOLIO);
        if (savedPortfolioJSON) {
            try {
                portfolioItems = JSON.parse(savedPortfolioJSON);
            } catch (e) {
                console.error('Failed to load portfolio from storage', e);
                portfolioItems = [];
            }
        }
    }

    function saveGallery() {
        const success = safeSaveToLocalStorage(LS_KEYS.GALLERY, JSON.stringify(galleryItems));
        if (success) updateAdminStats();
        return success;
    }

    function loadGallery() {
        const savedGalleryJSON = localStorage.getItem(LS_KEYS.GALLERY);
        if (savedGalleryJSON) {
            try {
                const parsed = JSON.parse(savedGalleryJSON);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    galleryItems = parsed;
                    return; // Exit if we successfully loaded items
                }
            } catch (e) {
                console.error('Failed to load gallery from storage', e);
            }
        }
        // If storage was empty or invalid, load defaults
        galleryItems = [
             { 
                id: 'gallery-default-1', 
                type: 'image', 
                src: 'https://images.unsplash.com/photo-1512295767273-b684ac7658fa?q=80&w=1974&auto=format&fit=crop', 
                title: 'Modern Workspace Design',
                fileType: 'image/jpeg' 
            },
            { 
                id: 'gallery-default-2', 
                type: 'image', 
                src: 'https://images.unsplash.com/photo-1516116216624-53e6973bea12?q=80&w=2070&auto=format&fit=crop', 
                title: 'Creative Tools & Branding',
                fileType: 'image/jpeg' 
            },
            { 
                id: 'gallery-default-3', 
                type: 'video', 
                src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                title: 'Design Process Reel',
                fileType: 'video/mp4' 
            },
             { 
                id: 'gallery-default-4', 
                type: 'image', 
                src: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop', 
                title: 'Digital Branding Mockup',
                fileType: 'image/jpeg' 
            }
        ];
        saveGallery();
    }
    
    function saveServices() {
        safeSaveToLocalStorage(LS_KEYS.SERVICES, JSON.stringify(serviceItems));
        updateSeoAndSocialTags();
        updateAdminStats();
    }

    function loadServices() {
        const savedServicesJSON = localStorage.getItem(LS_KEYS.SERVICES);
        if (savedServicesJSON) {
            try {
                serviceItems = JSON.parse(savedServicesJSON);
            } catch (e) {
                console.error('Failed to load services from storage', e);
                serviceItems = [];
            }
        } else {
            // Default services if none are in storage
            serviceItems = [
                { id: 'service-1', title: 'Graphic Design', category: 'Branding', imageSrc: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop', description: 'Logos, brochures, business cards, posters, and all your marketing material needs. We create visually stunning graphics that capture attention.' },
                { id: 'service-7', title: '3D LOGO Design', category: 'Branding', imageSrc: 'https://images.unsplash.com/photo-1611162617213-6d22e4f13374?q=80&w=1974&auto=format&fit=crop', description: 'Bring your brand to life with stunning 3D logos that stand out. We create dynamic and modern logos with depth and dimension.' },
                { id: 'service-2', title: 'Branding Strategy', category: 'Branding', imageSrc: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop', description: 'Comprehensive brand identity development, including strategy, guidelines, and visual assets to build a strong and memorable brand presence.' },
                { id: 'service-3', title: 'Printing Services', category: 'Print', imageSrc: 'https://images.unsplash.com/photo-1506485338023-6ce5f38de033?q=80&w=2070&auto=format&fit=crop', description: 'High-quality printing for business cards, flyers, banners, and other promotional materials. We ensure your designs look great on paper.' },
                { id: 'service-4', title: 'Interior Decoration', category: 'Environment', imageSrc: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1974&auto=format&fit=crop', description: 'Transforming residential and commercial spaces with creative and functional interior design solutions that reflect your style.' },
                { id: 'service-5', title: 'Fashion Design', category: 'Fashion', imageSrc: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', description: 'Innovative fashion design services, from concept development and sketching to pattern making and collection creation.' },
                { id: 'service-6', title: 'Web Design', category: 'Digital', imageSrc: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', description: 'User-friendly, responsive, and aesthetically pleasing website design and development. We build engaging digital experiences.' }
            ];
            saveServices();
        }
    }

    function saveFeaturedWork() {
        safeSaveToLocalStorage(LS_KEYS.FEATURED_WORK, JSON.stringify(featuredWorkItems));
        updateAdminStats();
    }

    function loadFeaturedWork() {
        const savedFeaturedWorkJSON = localStorage.getItem(LS_KEYS.FEATURED_WORK);
        if (savedFeaturedWorkJSON) {
            try {
                featuredWorkItems = JSON.parse(savedFeaturedWorkJSON);
            } catch (e) {
                console.error('Failed to load featured work from storage', e);
                featuredWorkItems = [];
            }
        } else {
            // Default featured work items if none are in storage
            featuredWorkItems = [
                { 
                    id: 'featured-1', 
                    title: 'Corporate Branding Overhaul', 
                    imageSrc: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop', 
                    description: 'A complete redesign of a major corporation\'s brand identity, including logo, color palette, and marketing materials.' 
                },
                { 
                    id: 'featured-2', 
                    title: 'E-Commerce Web Platform', 
                    imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
                    description: 'Developed a fully responsive and user-friendly e-commerce website that resulted in a 40% increase in online sales.'
                },
                { 
                    id: 'featured-3', 
                    title: 'Boutique Hotel Interior Design', 
                    imageSrc: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
                    description: 'Conceptualized and executed the interior design for a luxury boutique hotel, creating a unique and memorable guest experience.'
                }
            ];
            saveFeaturedWork();
        }
    }

    function saveLogo() {
        if (currentLogoSrc) {
            safeSaveToLocalStorage(LS_KEYS.SITE_LOGO, currentLogoSrc);
        }
    }

    function loadLogo() {
        const savedSrc = localStorage.getItem(LS_KEYS.SITE_LOGO);
        if (savedSrc && headerLogoImage) {
            currentLogoSrc = savedSrc;
            headerLogoImage.src = savedSrc;
        }
    }

    // --- Helper Functions ---
    function showAdminStatusMessage(element: HTMLElement | null, message: string, isError: boolean = false, duration: number = 3000) {
        if (!element) return;
        element.textContent = message;
        element.className = 'form-status-message'; // Reset classes
        if (isError) {
            element.classList.add('visible'); 
            element.style.color = 'var(--error-color)';
            element.style.backgroundColor = '#fdd';
            element.style.borderColor = 'var(--error-color)';
        } else {
            element.classList.add('visible');
            element.style.color = 'var(--success-color)';
            element.style.backgroundColor = '#e6ffed';
            element.style.borderColor = 'var(--success-color)';
        }
        
        setTimeout(() => {
            element.classList.remove('visible');
            element.textContent = '';
            element.style.color = ''; 
            element.style.backgroundColor = '';
            element.style.borderColor = '';
        }, duration);
    }

    function handleDownload(src: string, title: string, fileType: string, price: string) {
        if (window.confirm(`You are about to download "${title}" for ${price}. To complete your purchase, please send payment to mobile money accounts 0775909199 / 0881285299. Do you want to proceed?`)) {
            const link = document.createElement('a');
            link.href = src;
            
            const extension = fileType.split('/')[1] || 'bin';
            const sanitizedTitle = title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
            link.download = `${sanitizedTitle}.${extension}`;
        
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    // --- SEO & Social Tags ---
    function updateSeoAndSocialTags() {
        // 1. Gather data
        const siteTitle = siteSettingsConfig.get('siteTitle')?.currentValue || "LOGAN'S DESIGN - Creative Solutions";
        const siteDescriptionElement = document.getElementById('metaDescription') as HTMLMetaElement;
        const siteDescription = siteDescriptionElement ? siteDescriptionElement.content : '';
        const siteUrl = window.location.origin || 'https://logans.design';
    
        let ogImageUrl = currentLogoSrc;
        if (!ogImageUrl && ceoInfo) {
            ogImageUrl = ceoInfo.imageSrc;
        }
        // Fallback to a default, high-quality banner from the slideshow defaults
        if (!ogImageUrl) {
            ogImageUrl = 'https://images.unsplash.com/photo-1558655146-364ada1fcc9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
        }
    
        // 2. Update DOM meta tags
        document.title = siteTitle;
        siteDescriptionElement.content = siteDescription;
    
        (document.getElementById('ogUrl') as HTMLMetaElement).content = siteUrl;
        (document.getElementById('ogTitle') as HTMLMetaElement).content = siteTitle;
        (document.getElementById('ogDescription') as HTMLMetaElement).content = siteDescription;
        (document.getElementById('ogImage') as HTMLMetaElement).content = ogImageUrl;
    
        // 3. Construct and inject JSON-LD
        const primaryEmail = siteSettingsConfig.get('contactEmail')?.currentValue;
        const primaryPhone = siteSettingsConfig.get('primaryPhone')?.currentValue;
        
        const schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "name": "LOGAN'S DESIGN",
                    "url": siteUrl,
                    "logo": currentLogoSrc || ogImageUrl,
                    "contactPoint": [] as any[]
                },
                {
                    "@type": "WebSite",
                    "url": siteUrl,
                    "name": siteTitle,
                    "description": siteDescription,
                    "publisher": {
                        "@type": "Organization",
                        "name": "LOGAN'S DESIGN",
                        "logo": {
                            "@type": "ImageObject",
                            "url": currentLogoSrc || ogImageUrl
                        }
                    }
                },
                // Services will be pushed here
            ]
        };
    
        if (primaryEmail) {
            schema['@graph'][0].contactPoint.push({
                "@type": "ContactPoint",
                "telephone": primaryPhone || '',
                "contactType": "customer support",
                "email": primaryEmail,
                "areaServed": "LR", // Liberia
                "availableLanguage": "en"
            });
        }
    
        serviceItems.forEach(service => {
            (schema['@graph'] as any[]).push({
                "@type": "Service",
                "serviceType": service.title,
                "description": service.description,
                "provider": {
                    "@type": "Organization",
                    "name": "LOGAN'S DESIGN"
                }
            });
        });
    
        const schemaScript = document.getElementById('schemaOrgMarkup');
        if(schemaScript) {
            schemaScript.textContent = JSON.stringify(schema);
        }
    }


    // --- Site Settings & Logo---
    function initializeSiteSettings() {
        const settingsToTrack: Array<{
            key: string, 
            displayId: string, 
            inputId: string, 
            isHref?: boolean, 
            hrefPrefix?: string,
            displaySuffixId?: string,
            inputSuffixId?: string  
        }> = [
            { key: 'siteTitle', displayId: 'siteTitleDisplay', inputId: 'adminSiteTitleInput' },
            { key: 'contactEmail', displayId: 'contactEmailDisplay', inputId: 'adminContactEmailInput', isHref: true, hrefPrefix: 'mailto:' },
            { key: 'contactEmailSecondary', displayId: 'contactEmailSecondaryDisplay', inputId: 'adminContactEmailSecondaryInput', isHref: true, hrefPrefix: 'mailto:' },
            { 
                key: 'primaryPhone', 
                displayId: 'contactPrimaryPhoneDisplay', 
                inputId: 'adminPrimaryPhoneInput', 
                isHref: true, 
                hrefPrefix: 'tel:',
                displaySuffixId: 'contactPrimaryPhoneSuffixDisplay',
                inputSuffixId: 'adminPrimaryPhoneSuffixInput'
            },
            { key: 'facebookUrl', displayId: 'facebookLink', inputId: 'adminFacebookUrlInput', isHref: true },
            { key: 'instagramUrl', displayId: 'instagramLink', inputId: 'adminInstagramUrlInput', isHref: true },
            { key: 'linkedInUrl', displayId: 'linkedInLink', inputId: 'adminLinkedInUrlInput', isHref: true },
            { key: 'twitterUrl', displayId: 'twitterLink', inputId: 'adminTwitterUrlInput', isHref: true },
        ];

        settingsToTrack.forEach(setting => {
            const displayElement = document.getElementById(setting.displayId) as HTMLElement;
            const inputElement = document.getElementById(setting.inputId) as HTMLInputElement;
            let displaySuffixElement = null;
            let inputSuffixElement = null;

            if (setting.displaySuffixId && setting.inputSuffixId) {
                displaySuffixElement = document.getElementById(setting.displaySuffixId) as HTMLElement;
                inputSuffixElement = document.getElementById(setting.inputSuffixId) as HTMLInputElement;
            }

            if (displayElement && inputElement) {
                const originalValue = displayElement.textContent || '';
                const originalSuffixValue = displaySuffixElement ? (displaySuffixElement.textContent || '') : undefined;
                
                siteSettingsConfig.set(setting.key, {
                    displayElement,
                    inputElement,
                    originalValue,
                    currentValue: originalValue,
                    isHref: setting.isHref,
                    hrefPrefix: setting.hrefPrefix,
                    displaySuffixElement: displaySuffixElement || undefined,
                    inputSuffixElement: inputSuffixElement || undefined,
                    originalSuffixValue: originalSuffixValue,
                    currentSuffixValue: originalSuffixValue,
                });
            } else {
                console.warn(`Site setting elements not found for key: ${setting.key}`);
            }
        });
        loadSiteSettings();
        loadAdminFormFromState(); 
        updateSiteDisplayFromState(); 
    }

    function loadAdminFormFromState() {
        siteSettingsConfig.forEach(config => {
            if (config.inputElement) {
                 if (config.isHref && (config.displayElement as HTMLAnchorElement).href.startsWith('http')) {
                    config.inputElement.value = (config.displayElement as HTMLAnchorElement).href;
                } else {
                    config.inputElement.value = config.currentValue;
                }
            }
            if (config.inputSuffixElement && typeof config.currentSuffixValue === 'string') {
                config.inputSuffixElement.value = config.currentSuffixValue;
            }
        });
    }

    function updateSiteDisplayFromState() {
        siteSettingsConfig.forEach(config => {
            if (config.displayElement) {
                if (config.isHref) {
                    (config.displayElement as HTMLAnchorElement).href = config.hrefPrefix ? config.hrefPrefix + config.currentValue : config.currentValue;
                    if (!config.hrefPrefix) { // For social links, don't change text content
                        return;
                    }
                }
                config.displayElement.textContent = config.currentValue;
            }
            if (config.displaySuffixElement && typeof config.currentSuffixValue === 'string') {
                config.displaySuffixElement.textContent = config.currentSuffixValue;
            }
        });
    }

    function handleSaveSiteSettings(event: Event) {
        event.preventDefault();
        if (!isAdminLoggedIn) return;
    
        // Save text-based settings
        siteSettingsConfig.forEach(config => {
            if (config.inputElement) {
                config.currentValue = config.inputElement.value;
            }
            if (config.inputSuffixElement && typeof config.currentSuffixValue === 'string') {
                config.currentSuffixValue = config.inputSuffixElement.value;
            }
        });
        updateSiteDisplayFromState();
        saveSiteSettings();
    
        // Save the logo if a new one is pending
        if (pendingLogoSrc) {
            currentLogoSrc = pendingLogoSrc;
            saveLogo();
            pendingLogoSrc = ''; // Clear pending src
            if (siteLogoInput) {
                siteLogoInput.value = ''; // Clear file input visually
            }
            // Clear the specific logo status message now that it's saved
            if (siteLogoStatusMessage) {
                siteLogoStatusMessage.classList.remove('visible');
                siteLogoStatusMessage.textContent = '';
            }
        }

        updateSeoAndSocialTags();
        showAdminStatusMessage(siteSettingsStatusMessage, 'Site settings saved successfully!');
    }
    
    function handleLogoUpdate(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!isAdminLoggedIn || !input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && headerLogoImage) {
                // Set the pending source and update the preview, but don't save yet
                pendingLogoSrc = e.target.result as string;
                headerLogoImage.src = pendingLogoSrc;
                showAdminStatusMessage(siteLogoStatusMessage, 'Logo preview updated. Click "Save Site Settings" to apply.', false, 5000);
            }
        };
        reader.onerror = () => {
             showAdminStatusMessage(siteLogoStatusMessage, 'Error reading file.', true);
        };
        reader.readAsDataURL(file);
    }

    function initializeLogo() {
        loadLogo();
        if (siteLogoInput) {
            siteLogoInput.addEventListener('change', handleLogoUpdate);
        }
    }

    // --- Content Editable Spans ---
    function createEditControlButton(text: string, className: string, editableId: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = text;
        button.type = 'button'; 
        button.classList.add('edit-control-button', className);
        button.dataset.editableId = editableId;
        return button;
    }
    
    function initializeEditableElements() {
        const editableSpans = document.querySelectorAll<HTMLElement>('span[data-editable-content-id]');
        editableSpans.forEach(span => {
            const editableId = span.dataset.editableContentId;
            if (!editableId) return;

            const controlsContainer = document.querySelector<HTMLElement>(`.edit-controls-container[data-controls-for="${editableId}"]`);
            if (!controlsContainer) {
                console.warn(`No controls container found for ${editableId}`);
                return;
            }

            const editButton = createEditControlButton('Edit', 'edit-button', editableId);
            const saveButton = createEditControlButton('Save', 'save-button', editableId);
            const cancelButton = createEditControlButton('Cancel', 'cancel-button', editableId);

            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';

            controlsContainer.innerHTML = ''; 
            controlsContainer.append(editButton, saveButton, cancelButton);
            
            editableElementsState.set(editableId, {
                originalHTML: span.innerHTML,
                currentHTML: span.innerHTML,
                element: span,
                controlsContainer,
                editButton,
                saveButton,
                cancelButton,
            });

            editButton.addEventListener('click', () => startEdit(editableId));
            saveButton.addEventListener('click', () => saveEdit(editableId));
            cancelButton.addEventListener('click', () => cancelEdit(editableId));
        });
        loadEditableContent();
        updateEditControlsVisibility(); 
    }

    function updateEditControlsVisibility() {
        editableElementsState.forEach(state => {
            if (isAdminLoggedIn) {
                state.controlsContainer.style.display = 'flex';
                state.controlsContainer.classList.add('visible-for-admin');
            } else {
                state.controlsContainer.style.display = 'none';
                state.controlsContainer.classList.remove('visible-for-admin');
                if (state.element.isContentEditable) {
                    state.element.contentEditable = 'false';
                    state.editButton.style.display = 'inline-block';
                    state.saveButton.style.display = 'none';
                    state.cancelButton.style.display = 'none';
                }
            }
        });
    }
    
    function startEdit(editableId: string) {
        const state = editableElementsState.get(editableId);
        if (!state || !isAdminLoggedIn) return;
        state.element.contentEditable = 'true';
        state.element.focus();
        state.editButton.style.display = 'none';
        state.saveButton.style.display = 'inline-block';
        state.cancelButton.style.display = 'inline-block';
    }

    function saveEdit(editableId: string) {
        const state = editableElementsState.get(editableId);
        if (!state || !isAdminLoggedIn) return;
        state.currentHTML = state.element.innerHTML;
        state.element.contentEditable = 'false';
        state.editButton.style.display = 'inline-block';
        state.saveButton.style.display = 'none';
        state.cancelButton.style.display = 'none';
        saveEditableContent();
    }

    function cancelEdit(editableId: string) {
        const state = editableElementsState.get(editableId);
        if (!state || !isAdminLoggedIn) return;
        state.element.innerHTML = state.currentHTML; 
        state.element.contentEditable = 'false';
        state.editButton.style.display = 'inline-block';
        state.saveButton.style.display = 'none';
        state.cancelButton.style.display = 'none';
    }

    // --- Slideshow Management Factory ---
    function createSlideshowManager(config: SlideshowManagerConfig) {
        let items: SlideshowItem[] = [];
        let slideIndex = 1;
        let slideTimeout: ReturnType<typeof setTimeout> | undefined;

        const container = document.getElementById(config.containerId) as HTMLDivElement;
        const dotsContainer = document.getElementById(config.dotsId) as HTMLDivElement;
        const adminList = document.getElementById(config.adminListId) as HTMLDivElement;
        const addForm = document.getElementById(config.addFormId) as HTMLFormElement;
        const fileInput = document.getElementById(config.fileInputId) as HTMLInputElement;
        const statusMessage = document.getElementById(config.statusMessageId) as HTMLDivElement;

        function save(): boolean {
            return safeSaveToLocalStorage(config.storageKey, JSON.stringify(items));
        }

        function load() {
            const savedJSON = localStorage.getItem(config.storageKey);
            if (savedJSON) {
                try {
                    const parsed = JSON.parse(savedJSON);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        items = parsed;
                        return;
                    }
                } catch (e) {
                    console.error(`Failed to load slideshow from storage key "${config.storageKey}"`, e);
                }
            }
            items = config.defaultItems;
            save();
        }
        
        function render() {
            // Render public slideshow
            if (container && dotsContainer) {
                const prevArrow = container.querySelector('.prev');
                const nextArrow = container.querySelector('.next');
                container.innerHTML = '';
                if (prevArrow && nextArrow) {
                    container.append(prevArrow, nextArrow);
                }
                dotsContainer.innerHTML = '';

                if (items.length === 0) {
                    const p = document.createElement('p');
                    p.textContent = 'No slides to display.';
                    p.style.textAlign = 'center';
                    p.style.padding = '2rem';
                    container.insertBefore(p, prevArrow);
                } else {
                    items.forEach((item, index) => {
                        const slideDiv = document.createElement('div');
                        slideDiv.className = 'slide-item';
                        const img = document.createElement('img');
                        img.src = item.src;
                        img.alt = `Slideshow image ${index + 1}`;
                        img.loading = 'lazy';
                        slideDiv.appendChild(img);
                        container.insertBefore(slideDiv, prevArrow);
        
                        const dotSpan = document.createElement('span');
                        dotSpan.className = 'dot';
                        dotSpan.setAttribute('aria-label', `Go to slide ${index + 1}`);
                        dotSpan.addEventListener('click', () => currentSlide(index + 1));
                        dotsContainer.appendChild(dotSpan);
                    });
                }
            }
        
            // Render admin list
            if (adminList) {
                adminList.innerHTML = '';
                if (items.length === 0) {
                    adminList.innerHTML = '<p>No slides added yet.</p>';
                } else {
                    items.forEach(item => {
                        const entryDiv = document.createElement('div');
                        entryDiv.className = 'admin-slideshow-list-entry';
                        
                        const img = document.createElement('img');
                        img.src = item.src;
                        img.alt = 'Slide preview';
                        img.className = 'admin-slide-preview';
                        img.loading = 'lazy';
        
                        const idSpan = document.createElement('span');
                        idSpan.textContent = `...${item.id.slice(-12)}`;
                        idSpan.title = item.id;

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-slide-btn';
                        deleteButton.addEventListener('click', () => handleDelete(item.id));
        
                        entryDiv.append(img, idSpan, deleteButton);
                        adminList.appendChild(entryDiv);
                    });
                }
            }
        }

        function showSlides(n?: number) {
            if (n !== undefined) {
                slideIndex = n;
            }
            if (!container) return;
        
            const slides = container.querySelectorAll<HTMLElement>('.slide-item');
            const dots = dotsContainer?.querySelectorAll<HTMLElement>('.dot');
        
            if (slides.length === 0) return;
        
            if (slideIndex > slides.length) { slideIndex = 1; }
            if (slideIndex < 1) { slideIndex = slides.length; }
        
            slides.forEach(slide => slide.classList.remove('active-slide'));
            dots?.forEach(dot => dot.classList.remove('active'));
        
            slides[slideIndex - 1].classList.add('active-slide');
            if (dots) {
                dots[slideIndex - 1].classList.add('active');
            }
        
            clearTimeout(slideTimeout);
            slideTimeout = setTimeout(() => showSlides(slideIndex + 1), 5000);
        }

        function plusSlides(n: number) {
            showSlides(slideIndex + n);
        }
        
        function currentSlide(n: number) {
            showSlides(n);
        }

        function handleAdd(event: Event) {
            event.preventDefault();
            const submitButton = addForm?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        
            if (!isAdminLoggedIn || !fileInput.files || fileInput.files.length === 0) {
                showAdminStatusMessage(statusMessage, 'Please select an image file.', true);
                return;
            }
        
            const file = fileInput.files[0];
            const MAX_FILE_SIZE_MB = 2; // Keep images small for localStorage
            const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
        
            if (!file.type.startsWith('image/')) {
                showAdminStatusMessage(statusMessage, 'Invalid file type. Please upload an image.', true);
                if (addForm) addForm.reset();
                return;
            }
        
            if (file.size > MAX_FILE_SIZE_BYTES) {
                showAdminStatusMessage(statusMessage, `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`, true);
                if (addForm) addForm.reset();
                return;
            }
        
            const originalButtonText = submitButton ? submitButton.textContent : 'Upload Slide';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
            }
        
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const newItem: SlideshowItem = {
                        id: `slide-${Date.now()}`,
                        src: e.target.result as string,
                    };
                    items.push(newItem);
                    if (save()) { // Only proceed if save was successful
                        render();
                        showSlides(items.length);
                        showAdminStatusMessage(statusMessage, 'Slide added successfully!');
                        if (addForm) addForm.reset();
                    }
                    // Error message for failed save is handled by safeSaveToLocalStorage
                }
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            };
            reader.onerror = () => {
                 showAdminStatusMessage(statusMessage, 'Error reading file.', true);
                 if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            };
            reader.readAsDataURL(file);
        }

        function handleDelete(slideId: string) {
            if (!isAdminLoggedIn) return;
            items = items.filter(item => item.id !== slideId);
            save();
            render();
            if(slideIndex > items.length && items.length > 0) {
                slideIndex = items.length;
            } else if (items.length === 0) {
                slideIndex = 1;
            }
            showSlides(); 
            showAdminStatusMessage(statusMessage, 'Slide deleted.');
        }

        function init() {
            if (!container) return; // Don't initialize if the main container isn't on the page

            load();
            render();
            if (items.length > 0) {
                showSlides(slideIndex);
            }

            const prevArrow = container.querySelector<HTMLAnchorElement>('.prev');
            const nextArrow = container.querySelector<HTMLAnchorElement>('.next');
            if(prevArrow) prevArrow.addEventListener('click', () => plusSlides(-1));
            if(nextArrow) nextArrow.addEventListener('click', () => plusSlides(1));

            container.addEventListener('mouseenter', () => clearTimeout(slideTimeout));
            container.addEventListener('mouseleave', () => {
                clearTimeout(slideTimeout);
                slideTimeout = setTimeout(() => showSlides(slideIndex + 1), 5000);
            });
            
            if (addForm) {
                addForm.addEventListener('submit', handleAdd);
            }
        }

        return { init };
    }
    
    // --- Services Management ---
    function renderServices() {
        const serviceFiltersElement = document.getElementById('serviceFilters');
        const gridsToUpdate = [servicesGridElement, homeServicesGridElement];
    
        // Render filter buttons
        if (serviceFiltersElement) {
            const categories = ['all', ...new Set(serviceItems.map(item => item.category))];
            serviceFiltersElement.innerHTML = categories.map(category => 
                `<button class="filter-btn ${currentServiceFilter === category ? 'active' : ''}" data-filter="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</button>`
            ).join('');
        }

        const filteredServices = currentServiceFilter === 'all' 
            ? serviceItems 
            : serviceItems.filter(item => item.category === currentServiceFilter);

        gridsToUpdate.forEach(grid => {
            if (grid) {
                grid.innerHTML = '';
                const itemsToRender = grid.id === 'homeServicesGrid' ? serviceItems.slice(0, 6) : filteredServices;

                if (itemsToRender.length === 0) {
                    grid.innerHTML = '<p>No services found for this category.</p>';
                } else {
                    itemsToRender.forEach(item => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'service-item';
                        itemDiv.innerHTML = `
                            <img src="${item.imageSrc}" alt="${item.title}" loading="lazy">
                            <div class="service-item-content">
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                                <a href="#contact" class="service-contact-btn">Contact Us</a>
                            </div>
                        `;
                        grid.appendChild(itemDiv);
                    });
                }
            }
        });
        
        // Render admin services list
        if (adminServicesListElement) {
            adminServicesListElement.innerHTML = '';
            if (serviceItems.length === 0) {
                adminServicesListElement.innerHTML = '<p>No services added yet.</p>';
            } else {
                serviceItems.forEach(item => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'admin-service-item-entry';
                    entryDiv.dataset.serviceId = item.id;

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'service-content admin-item-with-preview';
                    contentDiv.innerHTML = `
                        <img src="${item.imageSrc}" alt="preview" class="admin-preview-image" loading="lazy">
                        <div>
                            <h5>${item.title}</h5>
                            <p>${item.description}</p>
                            <span class="service-category-display">${item.category}</span>
                        </div>
                    `;
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'service-actions';
                    
                    const editButton = createEditControlButton('Edit', 'edit-service-btn', item.id);
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete-service-item-btn';
                    
                    actionsDiv.append(editButton, deleteButton);
                    entryDiv.append(contentDiv, actionsDiv);
                    adminServicesListElement.appendChild(entryDiv);

                    deleteButton.addEventListener('click', () => handleDeleteService(item.id));
                    editButton.addEventListener('click', () => startServiceEdit(item.id));
                });
            }
        }
    }

    async function handleAddService(event: Event) {
        event.preventDefault();
        const title = serviceTitleInput.value.trim();
        const category = serviceCategoryInput.value.trim();
        const description = serviceDescriptionInput.value.trim();
        const file = serviceImageInput.files?.[0];
        
        if (!title || !description || !category || !file) {
            showAdminStatusMessage(addServiceStatusMessage, 'Please fill all fields and select an image.', true);
            return;
        }

        const reader = new FileReader();
        const imageSrcPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(file);

        try {
            const imageSrc = await imageSrcPromise;
            const newService: ServiceItem = {
                id: `service-${Date.now()}`,
                title,
                description,
                category,
                imageSrc
            };
    
            serviceItems.push(newService);
            saveServices();
            renderServices();
            showAdminStatusMessage(addServiceStatusMessage, 'Service added successfully!');
            addServiceForm.reset();
        } catch (error) {
            showAdminStatusMessage(addServiceStatusMessage, 'Error reading image file.', true);
        }
    }

    function handleDeleteService(serviceId: string) {
        if (!isAdminLoggedIn) return;
        serviceItems = serviceItems.filter(item => item.id !== serviceId);
        saveServices();
        renderServices();
        showAdminStatusMessage(addServiceStatusMessage, 'Service deleted.');
    }
    
    function startServiceEdit(serviceId: string) {
        const item = serviceItems.find(s => s.id === serviceId);
        const entryDiv = adminServicesListElement.querySelector(`[data-service-id="${serviceId}"]`);
        if (!item || !entryDiv) return;

        const contentDiv = entryDiv.querySelector('.service-content') as HTMLDivElement;
        const actionsDiv = entryDiv.querySelector('.service-actions') as HTMLDivElement;
        
        contentDiv.innerHTML = `
            <div class="form-group">
                <label>Image (optional: choose a new one to replace)</label>
                <input type="file" class="edit-service-image" accept="image/*">
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="edit-service-title" value="${item.title}">
            </div>
             <div class="form-group">
                <label>Category</label>
                <input type="text" class="edit-service-category" value="${item.category}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="edit-service-desc" rows="4">${item.description}</textarea>
            </div>
        `;
        
        actionsDiv.innerHTML = '';
        const saveButton = createEditControlButton('Save', 'save-button', serviceId);
        const cancelButton = createEditControlButton('Cancel', 'cancel-button', serviceId);
        
        actionsDiv.append(saveButton, cancelButton);

        saveButton.addEventListener('click', () => saveServiceEdit(serviceId));
        cancelButton.addEventListener('click', () => renderServices()); // Just re-render to cancel
    }

    async function saveServiceEdit(serviceId: string) {
        const entryDiv = adminServicesListElement.querySelector(`[data-service-id="${serviceId}"]`);
        if (!entryDiv) return;
        
        const newTitle = (entryDiv.querySelector('.edit-service-title') as HTMLInputElement).value.trim();
        const newCategory = (entryDiv.querySelector('.edit-service-category') as HTMLInputElement).value.trim();
        const newDescription = (entryDiv.querySelector('.edit-service-desc') as HTMLTextAreaElement).value.trim();
        const imageFile = (entryDiv.querySelector('.edit-service-image') as HTMLInputElement).files?.[0];

        if (!newTitle || !newDescription || !newCategory) {
            showAdminStatusMessage(addServiceStatusMessage, 'Title, category, and description cannot be empty.', true);
            return;
        }

        const itemIndex = serviceItems.findIndex(s => s.id === serviceId);
        if (itemIndex > -1) {
            serviceItems[itemIndex].title = newTitle;
            serviceItems[itemIndex].category = newCategory;
            serviceItems[itemIndex].description = newDescription;

            if (imageFile) {
                const reader = new FileReader();
                const imageSrcPromise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });
                reader.readAsDataURL(imageFile);

                try {
                    serviceItems[itemIndex].imageSrc = await imageSrcPromise;
                } catch (error) {
                    showAdminStatusMessage(addServiceStatusMessage, 'Could not update image, but other fields were saved.', true);
                    saveServices();
                    renderServices();
                    return;
                }
            }
            
            saveServices();
            renderServices();
            showAdminStatusMessage(addServiceStatusMessage, 'Service updated successfully!');
        }
    }
    
    function initializeServices() {
        loadServices();
        renderServices();
        if (addServiceForm) {
            addServiceForm.addEventListener('submit', handleAddService);
        }

        const serviceFiltersElement = document.getElementById('serviceFilters');
        if (serviceFiltersElement) {
            serviceFiltersElement.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                if (target.matches('.filter-btn')) {
                    const filter = target.dataset.filter;
                    if (filter && filter !== currentServiceFilter) {
                        currentServiceFilter = filter;
                        renderServices(); // Re-render will handle the 'active' class
                    }
                }
            });
        }
    }


    // --- Portfolio Management ---
    function renderPortfolioItems() {
        if (portfolioGridElement) {
            portfolioGridElement.innerHTML = ''; 
            if (portfolioItems.length === 0) {
                const placeholder = document.createElement('p');
                placeholder.textContent = 'No portfolio items yet. Add some from the admin panel!';
                placeholder.style.fontStyle = 'italic';
                placeholder.style.textAlign = 'center';
                 placeholder.style.gridColumn = '1 / -1'; // Span across all columns
                portfolioGridElement.appendChild(placeholder);
            } else {
                portfolioItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'portfolio-item';
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'portfolio-item-content';
                    contentDiv.innerHTML = `<h4>${item.title}</h4>`;
                    
                    const img = document.createElement('img');
                    img.src = item.imageSrc;
                    img.alt = item.title;
                    img.loading = 'lazy';
                    itemDiv.append(img, contentDiv);

                    portfolioGridElement.appendChild(itemDiv);
                });
            }
        }

        if (adminPortfolioItemsListElement) {
            adminPortfolioItemsListElement.innerHTML = ''; 
            if (portfolioItems.length === 0) {
                adminPortfolioItemsListElement.innerHTML = '<p>No portfolio items added yet.</p>';
            } else {
                portfolioItems.forEach(item => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'admin-portfolio-item-entry';
                    entryDiv.innerHTML = `
                        <img src="${item.imageSrc}" alt="${item.title} preview" class="admin-preview" loading="lazy">
                        <span>${item.title}</span>
                        <button class="delete-portfolio-item-btn" data-item-id="${item.id}">Delete</button>
                    `;
                    adminPortfolioItemsListElement.appendChild(entryDiv);

                    const deleteButton = entryDiv.querySelector('.delete-portfolio-item-btn') as HTMLButtonElement;
                    deleteButton.addEventListener('click', () => handleDeletePortfolioItem(item.id));
                });
            }
        }
    }

    function handleAddPortfolioItem(event: Event) {
        event.preventDefault();
        if (!isAdminLoggedIn || !portfolioImageInput.files || portfolioImageInput.files.length === 0 || !portfolioTitleInput.value.trim()) {
            showAdminStatusMessage(addPortfolioStatusMessage, 'Please select an image and enter a title.', true);
            return;
        }

        const file = portfolioImageInput.files[0];
        const title = portfolioTitleInput.value.trim();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                const newItem: PortfolioItem = {
                    id: `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    title: title,
                    imageSrc: e.target.result as string,
                };
                portfolioItems.push(newItem);
                savePortfolio();
                renderPortfolioItems();
                showAdminStatusMessage(addPortfolioStatusMessage, 'Portfolio item added successfully!');
                if (addPortfolioItemForm) addPortfolioItemForm.reset();
            }
        };
         reader.onerror = () => {
             showAdminStatusMessage(addPortfolioStatusMessage, 'Error reading image file.', true);
        };
        reader.readAsDataURL(file);
    }

    function handleDeletePortfolioItem(itemId: string) {
        if (!isAdminLoggedIn) return;
        portfolioItems = portfolioItems.filter(item => item.id !== itemId);
        savePortfolio();
        renderPortfolioItems();
        showAdminStatusMessage(addPortfolioStatusMessage, 'Portfolio item deleted.'); 
    }

    // --- Featured Work Management ---
    function renderFeaturedWork() {
        // Render homepage grid
        if (featuredWorkGridElement) {
            featuredWorkGridElement.innerHTML = '';
            if (featuredWorkItems.length === 0) {
                featuredWorkGridElement.innerHTML = '<p>No featured projects are currently listed. Check back soon!</p>';
            } else {
                // Show a maximum of 3 items on the homepage
                const itemsToDisplay = featuredWorkItems.slice(0, 3);
                itemsToDisplay.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'featured-work-item';
                    const img = document.createElement('img');
                    img.src = item.imageSrc;
                    img.alt = item.title;
                    img.loading = 'lazy';
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'featured-work-item-content';
                    contentDiv.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    `;
                    itemDiv.append(img, contentDiv);
                    featuredWorkGridElement.appendChild(itemDiv);
                });
            }
        }

        // Render admin list
        if (adminFeaturedWorkListElement) {
            adminFeaturedWorkListElement.innerHTML = '';
            if (featuredWorkItems.length === 0) {
                adminFeaturedWorkListElement.innerHTML = '<p>No featured projects added yet.</p>';
            } else {
                featuredWorkItems.forEach((item, index) => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'admin-service-item-entry'; // Reuse class for consistent layout
                    entryDiv.dataset.itemId = item.id;
                    entryDiv.setAttribute('draggable', 'true');

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'service-content'; // Reuse class
                    contentDiv.innerHTML = `
                        <div class="admin-item-with-preview">
                            <img src="${item.imageSrc}" alt="preview" class="admin-preview-image" loading="lazy">
                            <div>
                                <h5>${item.title}</h5>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    `;
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'service-actions'; // Reuse class
                    
                    const reorderActionsDiv = document.createElement('div');
                    reorderActionsDiv.className = 'reorder-actions';

                    const upButton = document.createElement('button');
                    upButton.textContent = '↑';
                    upButton.className = 'reorder-btn';
                    upButton.type = 'button';
                    upButton.setAttribute('aria-label', `Move '${item.title}' up`);
                    upButton.addEventListener('click', () => handleMoveFeaturedWork(item.id, 'up'));
                    if (index === 0) {
                        upButton.disabled = true;
                    }

                    const downButton = document.createElement('button');
                    downButton.textContent = '↓';
                    downButton.className = 'reorder-btn';
                    downButton.type = 'button';
                    downButton.setAttribute('aria-label', `Move '${item.title}' down`);
                    downButton.addEventListener('click', () => handleMoveFeaturedWork(item.id, 'down'));
                    if (index === featuredWorkItems.length - 1) {
                        downButton.disabled = true;
                    }

                    reorderActionsDiv.append(upButton, downButton);

                    const mainActionsDiv = document.createElement('div');
                    mainActionsDiv.className = 'main-actions';

                    const editButton = createEditControlButton('Edit', 'edit-featured-work-btn', item.id);
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete-featured-work-item-btn';
                    
                    mainActionsDiv.append(editButton, deleteButton);
                    actionsDiv.append(reorderActionsDiv, mainActionsDiv);
                    entryDiv.append(contentDiv, actionsDiv);
                    adminFeaturedWorkListElement.appendChild(entryDiv);

                    deleteButton.addEventListener('click', () => handleDeleteFeaturedWork(item.id));
                    editButton.addEventListener('click', () => startFeaturedWorkEdit(item.id));

                    // Add drag and drop event listeners
                    entryDiv.addEventListener('dragstart', handleFeaturedWorkDragStart);
                    entryDiv.addEventListener('dragend', handleFeaturedWorkDragEnd);
                });
            }
        }
    }

    function handleAddFeaturedWork(event: Event) {
        event.preventDefault();
        const title = featuredWorkTitleInput.value.trim();
        const description = featuredWorkDescriptionInput.value.trim();
        
        if (!title || !description || !featuredWorkImageInput.files || featuredWorkImageInput.files.length === 0) {
            showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Please fill all fields and select an image.', true);
            return;
        }

        const file = featuredWorkImageInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                const newWorkItem: FeaturedWorkItem = {
                    id: `featured-${Date.now()}`,
                    title,
                    description,
                    imageSrc: e.target.result as string
                };

                featuredWorkItems.unshift(newWorkItem); // Add to the beginning
                saveFeaturedWork();
                renderFeaturedWork();
                showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Featured project added successfully!');
                addFeaturedWorkForm.reset();
            }
        };
        reader.onerror = () => {
             showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Error reading image file.', true);
        };
        reader.readAsDataURL(file);
    }

    function handleDeleteFeaturedWork(itemId: string) {
        if (!isAdminLoggedIn) return;
        featuredWorkItems = featuredWorkItems.filter(item => item.id !== itemId);
        saveFeaturedWork();
        renderFeaturedWork();
        showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Featured project deleted.');
    }
    
    function startFeaturedWorkEdit(itemId: string) {
        const item = featuredWorkItems.find(s => s.id === itemId);
        const entryDiv = adminFeaturedWorkListElement.querySelector(`[data-item-id="${itemId}"]`);
        if (!item || !entryDiv) return;

        // Note: Reusing service item classes for consistency
        const contentDiv = entryDiv.querySelector('.service-content') as HTMLDivElement;
        const actionsDiv = entryDiv.querySelector('.service-actions') as HTMLDivElement;
        
        contentDiv.innerHTML = `
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="edit-featured-work-title" value="${item.title}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="edit-featured-work-desc" rows="4">${item.description}</textarea>
            </div>
        `;
        
        actionsDiv.innerHTML = '';
        const saveButton = createEditControlButton('Save', 'save-button', itemId);
        const cancelButton = createEditControlButton('Cancel', 'cancel-button', itemId);
        
        actionsDiv.append(saveButton, cancelButton);

        saveButton.addEventListener('click', () => saveFeaturedWorkEdit(itemId));
        cancelButton.addEventListener('click', () => renderFeaturedWork()); // Just re-render to cancel
    }

    function saveFeaturedWorkEdit(itemId: string) {
        const entryDiv = adminFeaturedWorkListElement.querySelector(`[data-item-id="${itemId}"]`);
        if (!entryDiv) return;
        
        const newTitle = (entryDiv.querySelector('.edit-featured-work-title') as HTMLInputElement).value.trim();
        const newDescription = (entryDiv.querySelector('.edit-featured-work-desc') as HTMLTextAreaElement).value.trim();

        if (!newTitle || !newDescription) {
            showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Title and description cannot be empty.', true);
            return;
        }

        const itemIndex = featuredWorkItems.findIndex(s => s.id === itemId);
        if (itemIndex > -1) {
            featuredWorkItems[itemIndex].title = newTitle;
            featuredWorkItems[itemIndex].description = newDescription;
            saveFeaturedWork();
            renderFeaturedWork();
            showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Featured project updated successfully!');
        }
    }

    // Reordering Handlers for Featured Work
    function handleMoveFeaturedWork(itemId: string, direction: 'up' | 'down') {
        const index = featuredWorkItems.findIndex(item => item.id === itemId);
    
        if (index === -1) return; 
    
        if (direction === 'up' && index > 0) {
            [featuredWorkItems[index - 1], featuredWorkItems[index]] = [featuredWorkItems[index], featuredWorkItems[index - 1]];
        } else if (direction === 'down' && index < featuredWorkItems.length - 1) {
            [featuredWorkItems[index + 1], featuredWorkItems[index]] = [featuredWorkItems[index], featuredWorkItems[index + 1]];
        } else {
            return; // Invalid move
        }
    
        saveFeaturedWork();
        renderFeaturedWork();
        showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Project order updated.');
    }

    // FIX: Fix `dataset` does not exist on `Element` type.
    // The `currentTarget` of a `DragEvent` is an `EventTarget`, which we can safely check if it is an `HTMLElement`.
    function handleFeaturedWorkDragStart(e: DragEvent) {
        const target = e.currentTarget;
        if (target instanceof HTMLElement && target.dataset.itemId) {
            e.dataTransfer?.setData('text/plain', target.dataset.itemId);
            target.classList.add('dragging');
        }
    }

    function handleFeaturedWorkDragEnd(e: DragEvent) {
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('dragging');
    }

    function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
        const draggableElements = [...container.querySelectorAll<HTMLElement>('.admin-service-item-entry:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }).element;
    }

    function handleFeaturedWorkDrop(e: DragEvent) {
        e.preventDefault();
        const draggedItemId = e.dataTransfer?.getData('text/plain');
        if (!draggedItemId || !adminFeaturedWorkListElement) return;

        const afterElement = getDragAfterElement(adminFeaturedWorkListElement, e.clientY);
        
        const draggedItemIndex = featuredWorkItems.findIndex(item => item.id === draggedItemId);
        if (draggedItemIndex === -1) return;

        // Remove the item from its original position
        const [draggedItem] = featuredWorkItems.splice(draggedItemIndex, 1);
        
        if (afterElement === null) {
            // Drop at the end
            featuredWorkItems.push(draggedItem);
        } else {
            // Drop before the `afterElement`
            const afterElementId = afterElement.dataset.itemId;
            const dropIndex = featuredWorkItems.findIndex(item => item.id === afterElementId);
            if (dropIndex !== -1) {
                featuredWorkItems.splice(dropIndex, 0, draggedItem);
            } else {
                // Failsafe: if drop target not found in data, add to end
                featuredWorkItems.push(draggedItem);
            }
        }

        saveFeaturedWork();
        renderFeaturedWork(); // Re-render to show new order
        showAdminStatusMessage(addFeaturedWorkStatusMessage, 'Project order updated successfully!');
    }

    function handleFeaturedWorkDragOver(e: DragEvent) {
        e.preventDefault(); // Necessary to allow dropping
    }
    
    function initializeFeaturedWork() {
        loadFeaturedWork();
        renderFeaturedWork();
        if (addFeaturedWorkForm) {
            addFeaturedWorkForm.addEventListener('submit', handleAddFeaturedWork);
        }
        if (adminFeaturedWorkListElement) {
            adminFeaturedWorkListElement.addEventListener('dragover', handleFeaturedWorkDragOver);
            adminFeaturedWorkListElement.addEventListener('drop', handleFeaturedWorkDrop);
        }
    }


    // --- Gallery Management ---
    let currentGalleryFilter: 'all' | 'image' | 'video' = 'all';
    let currentImageFilter: 'none' | 'bw' | 'sepia' | 'vintage' = 'none';

    function renderGallery() {
        const imageEffectFiltersElement = document.getElementById('imageEffectFilters') as HTMLDivElement;

        // Render PUBLIC gallery (filtered)
        if (galleryGridElement) {
            galleryGridElement.innerHTML = '';

            let filteredItems = galleryItems.filter(item => {
                if (currentGalleryFilter === 'all') return true;
                return item.type === currentGalleryFilter;
            });

            if (currentGallerySearchTerm) {
                filteredItems = filteredItems.filter(item => 
                    item.title.toLowerCase().includes(currentGallerySearchTerm)
                );
            }

            // Control visibility of image effect filters
            if (imageEffectFiltersElement) {
                const hasImagesInView = filteredItems.some(item => item.type === 'image');
                imageEffectFiltersElement.style.display = hasImagesInView ? 'block' : 'none';
            }

            if (filteredItems.length === 0) {
                const placeholder = document.createElement('p');
                placeholder.textContent = 'No gallery items found matching your criteria.';
                placeholder.style.fontStyle = 'italic';
                placeholder.style.textAlign = 'center';
                placeholder.style.gridColumn = '1 / -1';
                galleryGridElement.appendChild(placeholder);
            } else {
                filteredItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'gallery-item';
                    itemDiv.dataset.itemId = item.id;
                    
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'gallery-item-content';

                    if (item.type === 'image') {
                        const button = document.createElement('button');
                        button.className = 'gallery-image-button';
                        button.setAttribute('aria-label', `View image: ${item.title}`);

                        const img = document.createElement('img');
                        img.src = item.src;
                        img.alt = ''; // Decorative, as button has aria-label
                        img.setAttribute('aria-hidden', 'true');
                        img.loading = 'lazy';

                        if (currentImageFilter !== 'none') {
                            img.classList.add(`filter-${currentImageFilter}`);
                        }
                        
                        button.appendChild(img);
                        button.addEventListener('click', () => openLightbox(item.src, item.title, button));
                        
                        const price = '$100 LD';
                        contentDiv.innerHTML = `
                            <h4>${item.title}</h4>
                            <div class="gallery-item-actions">
                                <span class="gallery-item-price">${price}</span>
                                <button class="download-btn" aria-label="Download ${item.title} for ${price}">Download</button>
                            </div>
                        `;
                        
                        itemDiv.append(button, contentDiv);

                    } else { // video
                        itemDiv.classList.add('video-item');
                        const video = document.createElement('video');
                        video.controls = true;
                        video.preload = 'metadata';
                        video.setAttribute('aria-label', `Video: ${item.title}`);
                        
                        const source = document.createElement('source');
                        source.src = item.src;
                        source.type = item.fileType;
                        video.appendChild(source);

                        if (item.captionSrc) {
                            const track = document.createElement('track');
                            track.kind = 'captions';
                            track.srclang = 'en';
                            track.src = item.captionSrc;
                            track.label = 'English';
                            track.default = true;
                            video.appendChild(track);
                        }

                        video.append('Your browser does not support the video tag.');
                        
                        // Add play/pause event listeners for better UI feedback
                        video.addEventListener('play', () => {
                            itemDiv.classList.add('is-playing');
                        });
                        video.addEventListener('pause', () => {
                            itemDiv.classList.remove('is-playing');
                        });

                        const price = '$150 LD';
                        contentDiv.innerHTML = `
                            <h4>${item.title}</h4>
                            <div class="gallery-item-actions">
                                <span class="gallery-item-price">${price}</span>
                                <button class="download-btn" aria-label="Download ${item.title} for ${price}">Download</button>
                            </div>
                        `;
                        
                        itemDiv.append(video, contentDiv);
                    }
                    galleryGridElement.appendChild(itemDiv);
                });
            }
        }

        // Render ADMIN gallery list (unfiltered)
        if (adminGalleryItemsListElement) {
            adminGalleryItemsListElement.innerHTML = '';
            if (galleryItems.length === 0) {
                adminGalleryItemsListElement.innerHTML = '<p>No gallery items added yet.</p>';
            } else {
                galleryItems.forEach(item => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'admin-gallery-item-entry';

                    let previewElement: HTMLImageElement | HTMLVideoElement;
                    if (item.type === 'image') {
                        previewElement = document.createElement('img');
                        previewElement.alt = `${item.title} preview`;
                        previewElement.loading = 'lazy';
                    } else {
                        previewElement = document.createElement('video');
                        previewElement.muted = true; // Mute video previews in admin list
                    }
                    previewElement.src = item.src;
                    previewElement.className = 'admin-preview';

                    const titleSpan = document.createElement('span');
                    titleSpan.textContent = item.title;

                    if (item.type === 'video' && item.captionSrc) {
                        const captionIndicator = document.createElement('span');
                        captionIndicator.textContent = '(Has Captions)';
                        captionIndicator.className = 'admin-caption-indicator';
                        titleSpan.appendChild(captionIndicator);
                    }

                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-gallery-item-btn';
                    deleteButton.textContent = 'Delete';
                    deleteButton.dataset.itemId = item.id;
                    deleteButton.addEventListener('click', () => handleDeleteGalleryItem(item.id));

                    entryDiv.append(previewElement, titleSpan, deleteButton);
                    adminGalleryItemsListElement.appendChild(entryDiv);
                });
            }
        }
    }

    function handleAddGalleryItem(event: Event) {
        event.preventDefault();
        if (!addGalleryItemForm) return;
        const submitButton = addGalleryItemForm.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        const captionInput = document.getElementById('galleryCaptionInput') as HTMLInputElement;
    
        if (!isAdminLoggedIn || !galleryFileInput.files || galleryFileInput.files.length === 0 || !galleryTitleInput.value.trim()) {
            showAdminStatusMessage(addGalleryStatusMessage, 'Please select a file and enter a title.', true);
            return;
        }
    
        const file = galleryFileInput.files[0];
        const captionFile = captionInput.files?.[0];
        const title = galleryTitleInput.value.trim();
    
        const MAX_FILE_SIZE_MB = 50;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE_BYTES) {
            showAdminStatusMessage(addGalleryStatusMessage, `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`, true);
            if (addGalleryItemForm) addGalleryItemForm.reset();
            return;
        }
    
        if (captionFile && !captionFile.name.toLowerCase().endsWith('.vtt') && !captionFile.name.toLowerCase().endsWith('.srt')) {
            showAdminStatusMessage(addGalleryStatusMessage, 'Invalid caption file type. Please use .vtt or .srt.', true);
            captionInput.value = ''; // Clear invalid file
            return;
        }
    
        const originalButtonText = submitButton ? submitButton.textContent : 'Add Gallery Item';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
        }
    
        const reader = new FileReader();
    
        reader.onload = (e) => {
            if (e.target?.result) {
                const fileSrc = e.target.result as string;
                const fileType = file.type;
                let itemType: 'image' | 'video' | null = null;
    
                if (fileType.startsWith('image/')) {
                    itemType = 'image';
                } else if (fileType.startsWith('video/')) {
                    itemType = 'video';
                }
    
                if (itemType) {
                    const newItem: GalleryItem = {
                        id: `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        title,
                        src: fileSrc,
                        type: itemType,
                        fileType
                    };
    
                    const finalizeAddItem = () => {
                        galleryItems.push(newItem);
                        if (saveGallery()) {
                            renderGallery();
                            showAdminStatusMessage(addGalleryStatusMessage, 'Gallery item added successfully!');
                            if (addGalleryItemForm) addGalleryItemForm.reset();
                        }
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.textContent = originalButtonText;
                        }
                    };
    
                    if (itemType === 'video' && captionFile) {
                        const captionReader = new FileReader();
                        captionReader.onload = (captionEvent) => {
                            if (captionEvent.target?.result) {
                                newItem.captionSrc = captionEvent.target.result as string;
                            }
                            finalizeAddItem();
                        };
                        captionReader.onerror = () => {
                            showAdminStatusMessage(addGalleryStatusMessage, 'Video added, but caption file could not be read.', true, 5000);
                            finalizeAddItem();
                        };
                        captionReader.readAsDataURL(captionFile);
                    } else {
                        finalizeAddItem();
                    }
                } else {
                    showAdminStatusMessage(addGalleryStatusMessage, 'Unsupported file type.', true);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                }
            } else {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        };
        reader.onerror = () => {
            showAdminStatusMessage(addGalleryStatusMessage, 'Error reading file.', true);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        };
        reader.readAsDataURL(file);
    }
    
    function handleDeleteGalleryItem(itemId: string) {
        if (!isAdminLoggedIn) return;
        galleryItems = galleryItems.filter(item => item.id !== itemId);
        saveGallery();
        renderGallery();
        showAdminStatusMessage(addGalleryStatusMessage, 'Gallery item deleted.');
    }

    function handleLightboxKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeLightbox();
        }
        // Trap focus inside the lightbox
        if (event.key === 'Tab') {
            // Since the only focusable element is the close button, we prevent tabbing away.
            event.preventDefault();
        }
    }

    function openLightbox(src: string, caption: string, triggerElement: HTMLElement) {
        if (!lightbox || !lightboxImage || !lightboxCaption) return;
        lastFocusedElement = triggerElement;
        lightboxImage.src = src;
        lightboxImage.alt = caption; // Set descriptive alt text
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'block';
        lightbox.addEventListener('keydown', handleLightboxKeydown);
        lightboxClose?.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        lightbox.removeEventListener('keydown', handleLightboxKeydown);
        lastFocusedElement?.focus();
        lastFocusedElement = null;
    }

    function initializeGallery() {
        loadGallery();
        renderGallery();

        if (addGalleryItemForm) {
            addGalleryItemForm.addEventListener('submit', handleAddGalleryItem);

            const galleryFileInput = document.getElementById('galleryFileInput') as HTMLInputElement;
            const galleryCaptionContainer = document.getElementById('galleryCaptionContainer') as HTMLDivElement;
            const captionInput = document.getElementById('galleryCaptionInput') as HTMLInputElement;

            if (galleryFileInput && galleryCaptionContainer && captionInput) {
                galleryFileInput.addEventListener('change', () => {
                    const file = galleryFileInput.files?.[0];
                    if (file && file.type.startsWith('video/')) {
                        galleryCaptionContainer.style.display = 'block';
                    } else {
                        galleryCaptionContainer.style.display = 'none';
                        captionInput.value = ''; // Clear caption if file is no longer a video
                    }
                });
            }
            
            addGalleryItemForm.addEventListener('reset', () => {
                 if (galleryCaptionContainer) {
                    galleryCaptionContainer.style.display = 'none';
                }
            });
        }
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        if(lightbox) {
            lightbox.addEventListener('click', (event) => {
                if (event.target === lightbox) {
                    closeLightbox();
                }
            });
        }
        
        if (galleryGridElement) {
            galleryGridElement.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                const downloadButton = target.closest('.download-btn');
    
                if (downloadButton) {
                    const galleryItemDiv = downloadButton.closest('.gallery-item');
                    if (galleryItemDiv instanceof HTMLElement && galleryItemDiv.dataset.itemId) {
                        const itemId = galleryItemDiv.dataset.itemId;
                        const item = galleryItems.find(i => i.id === itemId);
                        if (item) {
                            const price = item.type === 'image' ? '$100 LD' : '$150 LD';
                            handleDownload(item.src, item.title, item.fileType, price);
                        }
                    }
                }
            });
        }

        const galleryFiltersElement = document.getElementById('galleryFilters');
        if (galleryFiltersElement) {
            galleryFiltersElement.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                if (target.matches('.filter-btn')) {
                    const filter = target.dataset.filter as 'all' | 'image' | 'video';
                    if (filter && filter !== currentGalleryFilter) {
                        currentGalleryFilter = filter;
                        galleryFiltersElement.querySelector('.filter-btn.active')?.classList.remove('active');
                        target.classList.add('active');
                        renderGallery();
                    }
                }
            });
        }

        const imageEffectFiltersElement = document.getElementById('imageEffectFilters');
        if (imageEffectFiltersElement) {
            imageEffectFiltersElement.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                if (target.matches('.effect-btn')) {
                    const effect = target.dataset.effect as typeof currentImageFilter;
                     if (effect && effect !== currentImageFilter) {
                        currentImageFilter = effect;
                        imageEffectFiltersElement.querySelector('.effect-btn.active')?.classList.remove('active');
                        target.classList.add('active');
                        renderGallery();
                     }
                }
            });
        }

        const gallerySearchInput = document.getElementById('gallerySearchInput') as HTMLInputElement;
        if (gallerySearchInput) {
            gallerySearchInput.addEventListener('input', (event) => {
                currentGallerySearchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
                renderGallery();
            });
        }
    }

    // --- CEO Section Management ---
    function saveCEOInfo() {
        if (ceoInfo) {
            safeSaveToLocalStorage(LS_KEYS.CEO_INFO, JSON.stringify(ceoInfo));
            updateSeoAndSocialTags();
        }
    }

    function loadCEOInfo() {
        const savedCEOInfoJSON = localStorage.getItem(LS_KEYS.CEO_INFO);
        if (savedCEOInfoJSON) {
            try {
                ceoInfo = JSON.parse(savedCEOInfoJSON);
            } catch (e) {
                console.error('Failed to load CEO info from storage', e);
                loadDefaultCEOInfo();
            }
        } else {
            loadDefaultCEOInfo();
        }
    }

    function loadDefaultCEOInfo() {
        ceoInfo = {
            name: "Logan Thomas Jr.",
            message: "Leading with a vision for creativity and excellence, our team is dedicated to bringing your ideas to life with unparalleled design solutions.",
            imageSrc: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop'
        };
        saveCEOInfo(); // Save the defaults so they persist
    }

    function renderCEOInfo() {
        if (ceoImageDisplay) ceoImageDisplay.src = ceoInfo.imageSrc;
        if (ceoNameDisplay) ceoNameDisplay.textContent = ceoInfo.name;
        if (ceoMessageDisplay) ceoMessageDisplay.textContent = ceoInfo.message;

        // Update admin form
        if (ceoImageInput) ceoImageInput.value = ''; // Clear file input
        if (ceoNameInput) ceoNameInput.value = ceoInfo.name;
        if (ceoMessageInput) ceoMessageInput.value = ceoInfo.message;
    }

    async function handleCEOInfoUpdate(event: Event) {
        event.preventDefault();
        if (!isAdminLoggedIn) return;

        const newName = ceoNameInput.value.trim();
        const newMessage = ceoMessageInput.value.trim();
        const imageFile = ceoImageInput.files?.[0];

        if (!newName || !newMessage) {
            showAdminStatusMessage(ceoInfoStatusMessage, 'Name and message cannot be empty.', true);
            return;
        }

        ceoInfo.name = newName;
        ceoInfo.message = newMessage;

        if (imageFile) {
            const reader = new FileReader();
            const imageSrcPromise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });
            reader.readAsDataURL(imageFile);

            try {
                ceoInfo.imageSrc = await imageSrcPromise;
            } catch (error) {
                showAdminStatusMessage(ceoInfoStatusMessage, 'Could not update image, but text fields were saved.', true);
                saveCEOInfo();
                renderCEOInfo();
                return;
            }
        }
        
        saveCEOInfo();
        renderCEOInfo();
        showAdminStatusMessage(ceoInfoStatusMessage, 'CEO information updated successfully!');
    }

    function initializeCEOInfo() {
        loadCEOInfo();
        renderCEOInfo();
        if (ceoInfoForm) {
            ceoInfoForm.addEventListener('submit', handleCEOInfoUpdate);
        }
    }
    
    // --- Admin Authentication ---
    function handleAdminLogin(event: Event) {
        event.preventDefault();
        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value;
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            document.body.classList.add('admin-view-active');
            navigateToSection('admin-dashboard');
            updateEditControlsVisibility();
            showAdminPanel('admin-view-dashboard');
        } else {
            if (adminLoginError) {
                adminLoginError.textContent = 'Invalid username or password.';
                adminLoginError.classList.add('visible');
            }
        }
    }

    function handleAdminLogout() {
        isAdminLoggedIn = false;
        document.body.classList.remove('admin-view-active');
        navigateToSection('home');
        updateEditControlsVisibility();
        if (adminLoginForm) adminLoginForm.reset();
        if (adminLoginError) adminLoginError.classList.remove('visible');
    }

    // --- Navigation ---
    function navigateToSection(sectionId: string, pushState: boolean = true) {
        contentSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });

        navLinks.forEach(link => {
            if (link.dataset.section === sectionId) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });
        
        if (pushState) {
            // The original history.pushState call can cause a SecurityError in certain
            // sandboxed environments. Switching to a hash-based routing approach is safer
            // and achieves the same single-page application navigation behavior.
            const newHash = `#${sectionId}`;
            if (window.location.hash !== newHash) {
                window.location.hash = newHash;
            }
        }
        window.scrollTo(0, 0); // Scroll to top on navigation
    }

    function handleNavLinkClick(event: MouseEvent) {
        event.preventDefault();
        const target = event.currentTarget as HTMLAnchorElement;
        const sectionId = target.dataset.section;
        if (sectionId) {
            navigateToSection(sectionId);
        }
    }

    function handlePopState(event: PopStateEvent) {
        // When using hash-based navigation, the event.state object may not be present.
        // The most reliable way to determine the correct section is to read it directly
        // from the URL's hash.
        const sectionId = window.location.hash.substring(1) || 'home';
        navigateToSection(sectionId, false);
    }
    
    // --- Quote Form Validation ---
    function validateField(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
        const errorElement = document.getElementById(`${input.id}Error`);
        let isValid = true;
        let errorMessage = '';

        if (input.validity.valueMissing) {
            errorMessage = 'This field is required.';
            isValid = false;
        } else if (input.type === 'email' && input.validity.typeMismatch) {
            errorMessage = 'Please enter a valid email address.';
            isValid = false;
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }
        
        if (isValid) {
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    function handleQuoteFormSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const statusElement = document.getElementById('quoteFormStatus');
        
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const serviceInput = document.getElementById('serviceType') as HTMLSelectElement;
        const messageInput = document.getElementById('message') as HTMLTextAreaElement;

        const isNameValid = validateField(nameInput);
        const isEmailValid = validateField(emailInput);
        const isServiceValid = validateField(serviceInput);
        const isMessageValid = validateField(messageInput);

        if (isNameValid && isEmailValid && isServiceValid && isMessageValid) {
            if (statusElement) {
                statusElement.innerHTML = `Thank you, ${nameInput.value}! Your quote request has been sent. We'll get back to you shortly. You can also <a href="#contact">contact us directly</a>.`;
                statusElement.classList.add('visible');
            }
            form.reset();
            form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        } else {
             if (statusElement) {
                statusElement.textContent = 'Please correct the errors before submitting.';
                statusElement.classList.add('visible');
                statusElement.style.color = 'var(--error-color)';
                statusElement.style.backgroundColor = '#fdd';
                statusElement.style.borderColor = 'var(--error-color)';
             }
        }
    }

    // --- Admin Panel Navigation ---
    function showAdminPanel(viewId: string) {
        document.querySelectorAll('.admin-view').forEach(view => {
            view.classList.toggle('active-admin-view', view.id === viewId);
        });

        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.toggle('active-admin-nav', link.getAttribute('data-view') === viewId);
        });
    }

    // --- AI Chat Widget ---
    function getSiteContextForAI(): string {
        const servicesList = serviceItems.map(s => `- ${s.title}: ${s.description}`).join('\n');
        const contactEmail = siteSettingsConfig.get('contactEmail')?.currentValue || '';
        const primaryPhone = siteSettingsConfig.get('primaryPhone')?.currentValue || '';

        return `You are a friendly and helpful AI assistant for LOGAN'S DESIGN.
        Your goal is to answer user questions about the company's services and encourage them to request a quote or contact the company.
        Do not answer questions unrelated to LOGAN'S DESIGN or its services.
        Keep your answers concise and helpful.

        Here is some information about the company:
        - Company Name: LOGAN'S DESIGN
        - Core Services: Graphic Design, Branding, Printing, Interior Decoration, Fashion Design, and Web Design.
        - Contact Email: ${contactEmail}
        - Contact Phone: ${primaryPhone}

        Available Services in detail:
        ${servicesList}

        If a user asks for a price, explain that prices vary by project and they should use the "Request a Quote" form for a detailed estimate.
        Be friendly and professional. Start the conversation by introducing yourself.`;
    }

    async function initializeAIChat() {
        if (!process.env.API_KEY) {
            console.warn("API_KEY environment variable not set. AI Chatbot is disabled.");
            if (chatWidgetContainer) {
                chatWidgetContainer.style.display = 'none';
            }
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = getSiteContextForAI();
            aiChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            // Add the initial AI greeting
            appendMessageToChat("Hello! I'm the AI assistant for LOGAN'S DESIGN. How can I help you today? Feel free to ask about our services!", 'ai');
        } catch (error) {
            console.error("Failed to initialize AI Chat:", error);
            if (chatWidgetContainer) {
                chatWidgetContainer.style.display = 'none';
            }
        }
    }

    function toggleChatWindow() {
        if (chatWindow) {
            const isOpen = chatWindow.classList.toggle('open');
            chatWindow.setAttribute('aria-hidden', String(!isOpen));
            if (isOpen) {
                aiChatInput?.focus();
            }
        }
    }

    function appendMessageToChat(message: string, sender: 'user' | 'ai') {
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }

    function showLoadingIndicator() {
        if (!chatMessages) return;
        const indicator = document.createElement('div');
        indicator.className = 'chat-message ai-message loading-indicator';
        indicator.innerHTML = `<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>`;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoadingIndicator() {
        chatMessages?.querySelector('.loading-indicator')?.remove();
    }

    async function handleAIChatSubmit(event: Event) {
        event.preventDefault();
        if (!aiChat || !aiChatInput || !aiChatSendButton) return;
    
        const userMessage = aiChatInput.value.trim();
        if (userMessage === '') return;
    
        appendMessageToChat(userMessage, 'user');
        aiChatInput.value = '';
        aiChatSendButton.disabled = true;
        showLoadingIndicator();
    
        try {
            const stream = await aiChat.sendMessageStream({ message: userMessage });
            removeLoadingIndicator();
    
            let fullResponse = '';
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'chat-message ai-message';
            chatMessages?.appendChild(aiMessageDiv);
    
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                aiMessageDiv.textContent = fullResponse;
                chatMessages!.scrollTop = chatMessages!.scrollHeight;
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            removeLoadingIndicator();
            appendMessageToChat("I'm sorry, I encountered an error. Please try again later.", 'ai');
        } finally {
            aiChatSendButton.disabled = false;
        }
    }

    // --- Misc ---
    function setYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear().toString();
        }
    }
    
    function updateAdminStats() {
        const statsServicesCount = document.getElementById('statsServicesCount');
        const statsFeaturedWorkCount = document.getElementById('statsFeaturedWorkCount');
        const statsGalleryCount = document.getElementById('statsGalleryCount');
        const statsPortfolioCount = document.getElementById('statsPortfolioCount');

        if (statsServicesCount) statsServicesCount.textContent = serviceItems.length.toString();
        if (statsFeaturedWorkCount) statsFeaturedWorkCount.textContent = featuredWorkItems.length.toString();
        if (statsGalleryCount) statsGalleryCount.textContent = galleryItems.length.toString();
        if (statsPortfolioCount) statsPortfolioCount.textContent = portfolioItems.length.toString();
    }
    
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            headerElement?.classList.add('scrolled');
        } else {
            headerElement?.classList.remove('scrolled');
        }
    }

    // --- Main Initialization ---
    function init() {
        setYear();
        initializeEditableElements();
        initializeSiteSettings();
        initializeLogo();
        initializeServices();
        initializeFeaturedWork();
        
        // Use factory for slideshows
        createSlideshowManager({
            containerId: 'slideshowContainer',
            dotsId: 'slideshowDotsContainer',
            adminListId: 'adminSlideshowList',
            addFormId: 'addSlideForm',
            fileInputId: 'slideImageInput',
            statusMessageId: 'addSlideStatusMessage',
            storageKey: LS_KEYS.SLIDESHOW,
            defaultItems: [
                { id: 'default-1', src: 'https://images.unsplash.com/photo-1558655146-364ada1fcc9?q=80&w=1974&auto=format&fit=crop' },
                { id: 'default-2', src: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2072&auto=format&fit=crop' },
                { id: 'default-3', src: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop' }
            ]
        }).init();

        createSlideshowManager({
            containerId: 'aboutSlideshowContainer',
            dotsId: 'aboutSlideshowDotsContainer',
            adminListId: 'adminAboutSlideshowList',
            addFormId: 'addAboutSlideForm',
            fileInputId: 'aboutSlideImageInput',
            statusMessageId: 'addAboutSlideStatusMessage',
            storageKey: LS_KEYS.ABOUT_SLIDESHOW,
            defaultItems: [
                { id: 'about-default-1', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop' },
                { id: 'about-default-2', src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop' }
            ]
        }).init();

        createSlideshowManager({
            containerId: 'portfolioSlideshowContainer',
            dotsId: 'portfolioSlideshowDotsContainer',
            adminListId: 'adminPortfolioSlideshowList',
            addFormId: 'addPortfolioSlideForm',
            fileInputId: 'portfolioSlideImageInput',
            statusMessageId: 'addPortfolioSlideStatusMessage',
            storageKey: LS_KEYS.PORTFOLIO_SLIDESHOW,
            defaultItems: [
                { id: 'portfolio-default-1', src: 'https://images.unsplash.com/photo-1600880292210-85938c827366?q=80&w=1974&auto=format&fit=crop' }
            ]
        }).init();

        loadPortfolio();
        renderPortfolioItems();
        
        initializeGallery();
        initializeCEOInfo();
        initializeAIChat();
        updateAdminStats();
        updateSeoAndSocialTags();

        // Event Listeners
        navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
        window.addEventListener('popstate', handlePopState);
        document.body.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.matches('.service-contact-btn')) {
                event.preventDefault();
                navigateToSection('contact');
            }
        });

        if (quoteForm) {
            quoteForm.addEventListener('submit', handleQuoteFormSubmit);
        }
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
        if (adminLogoutButton) {
            adminLogoutButton.addEventListener('click', handleAdminLogout);
        }
        if (adminLoginFooterLink) {
            adminLoginFooterLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToSection('admin-login');
            });
        }
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', e => {
                e.preventDefault();
                alert(`Username: ${ADMIN_USERNAME}\nPassword: ${ADMIN_PASSWORD}`);
            });
        }
        if (siteSettingsForm) {
            siteSettingsForm.addEventListener('submit', handleSaveSiteSettings);
        }
        if (addPortfolioItemForm) {
            addPortfolioItemForm.addEventListener('submit', handleAddPortfolioItem);
        }
        
        const adminNavContainer = document.querySelector('.admin-nav');
        if (adminNavContainer) {
            adminNavContainer.addEventListener('click', (event) => {
                const target = (event.target as HTMLElement).closest('.admin-nav-link');
                if (target) {
                    event.preventDefault();
                    const viewId = target.getAttribute('data-view');
                    if (viewId) {
                        showAdminPanel(viewId);
                    }
                }
            });
        }

        if (shareButton) {
            shareButton.addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: document.title,
                            text: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '',
                            url: window.location.href,
                        });
                    } catch (error) {
                        console.error('Error sharing:', error);
                    }
                } else {
                    alert('Web Share API is not supported in your browser.');
                }
            });
        }

        // Chat Widget Listeners
        if (chatToggleButton) chatToggleButton.addEventListener('click', toggleChatWindow);
        if (chatCloseButton) chatCloseButton.addEventListener('click', toggleChatWindow);
        if (aiChatForm) aiChatForm.addEventListener('submit', handleAIChatSubmit);

        // Initial page load navigation
        const initialSection = window.location.hash.substring(1) || 'home';
        navigateToSection(initialSection, false);
    }
    
    init();
});