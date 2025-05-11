
let lastScrollTop = 0;
let isLoading = true;

const dataConfig = {
    about: {
        file: 'data/about.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/about'
    },
    skills: {
        file: 'data/skills.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/skills'
    },
    projects: {
        file: 'data/projects.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/projects'
    },
    experience: {
        file: 'data/experience.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/experience'
    },
    testimonials: {
        file: 'data/testimonials.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/testimonials'
    },
    contact: {
        file: 'data/contact.json',
        api: 'https://pfadmin.arjunkattel.com.np/api/contact'
    }
};


let useApi = true;


document.addEventListener("DOMContentLoaded", () => {

    const splashScreen = document.querySelector('.splash-screen');


    if (typeof feather === "undefined") {
        const featherScript = document.createElement("script");
        featherScript.src = "https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js";
        featherScript.onload = () => {
            feather.replace();
        };
        document.head.appendChild(featherScript);
    } else {
        feather.replace();
    }



    checkDataSource();


    Promise.all([
        loadData('about'),
        loadData('skills'),
        loadData('projects'),
        loadData('experience'),
        loadData('testimonials'),
        loadData('contact')
    ]).then(([aboutData, skillsData, projectsData, experienceData, testimonialsData, contactData]) => {

        renderAboutDetails(aboutData);
        renderSkills(skillsData);
        renderProjects(projectsData);
        renderExperience(experienceData);
        renderTestimonials(testimonialsData);
        renderContactDetails(contactData);


        initParallax();
        initBidirectionalScrollReveal();
        initSkillBars();
        initNavigation();
        initTestimonials();
        initContactForm();
        initLazyLoading();


        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                isLoading = false;
            }, 500);
        }, 1000);
    }).catch(error => {
        console.error('Error loading data:', error);

        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                isLoading = false;
            }, 500);
        }, 1000);
    });
});


function checkDataSource() {

    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');

    if (source === 'api') {
        useApi = true;
    } else if (source === 'file') {
        useApi = false;
    } else {

        const savedSource = localStorage.getItem('dataSource');
        if (savedSource === 'api') {
            useApi = true;
        } else if (savedSource === 'file') {
            useApi = false;
        }

    }

}


function addSourceToggle() {
    const navBody = document.querySelector('.navBody');
    if (!navBody) return;

    const toggleItem = document.createElement('div');
    toggleItem.className = 'navItem source-toggle';
    toggleItem.innerHTML = `
        <a href="#" title="${useApi ? 'Switch to local files' : 'Switch to API'}">
            <i data-feather="${useApi ? 'hard-drive' : 'cloud'}" class="source-icon"></i>
        </a>
    `;

    navBody.appendChild(toggleItem);


    if (typeof feather !== 'undefined') {
        feather.replace();
    }


    toggleItem.addEventListener('click', (e) => {
        e.preventDefault();


        useApi = !useApi;


        localStorage.setItem('dataSource', useApi ? 'api' : 'file');


        const icon = toggleItem.querySelector('.source-icon');
        if (icon) {
            icon.setAttribute('data-feather', useApi ? 'hard-drive' : 'cloud');
            toggleItem.querySelector('a').setAttribute('title', useApi ? 'Switch to local files' : 'Switch to API');


            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }


        location.reload();
    });
}


async function loadData(dataType) {

    const source = useApi ? dataConfig[dataType].api : dataConfig[dataType].file;

    try {

        showSectionLoading(dataType);

        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`Failed to load ${source}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();


        hideSectionLoading(dataType);

        return data;
    } catch (error) {
        console.error(`Error loading ${source}:`, error);


        if (useApi) {
            console.log(`Falling back to local file for ${dataType}`);
            try {
                const fallbackResponse = await fetch(dataConfig[dataType].file);
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();


                    hideSectionLoading(dataType);

                    return fallbackData;
                }
            } catch (fallbackError) {
                console.error(`Fallback also failed for ${dataType}:`, fallbackError);
            }
        }


        hideSectionLoading(dataType);


        return dataType === 'skills' ? [] :
            dataType === 'projects' ? [] :
                dataType === 'testimonials' ? [] :
                    dataType === 'experience' ? { work: [], education: [] } :
                        dataType === 'about' ? { description: "No data available", details: [] } : {};
    }
}


function showSectionLoading(dataType) {
    const sectionId = getSectionIdFromDataType(dataType);
    const section = document.getElementById(sectionId);
    if (!section) return;


    let loadingIndicator = section.querySelector('.section-loading');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'section-loading';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading ${dataType} data...</p>
        `;
        section.appendChild(loadingIndicator);
    } else {
        loadingIndicator.style.display = 'flex';
    }
}


function hideSectionLoading(dataType) {
    const sectionId = getSectionIdFromDataType(dataType);
    const section = document.getElementById(sectionId);
    if (!section) return;

    const loadingIndicator = section.querySelector('.section-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}


function getSectionIdFromDataType(dataType) {
    switch (dataType) {
        case 'about': return 'about';
        case 'skills': return 'skills';
        case 'projects': return 'projects';
        case 'experience': return 'experience';
        case 'testimonials': return 'testimonials';
        case 'contact': return 'contact';
        default: return '';
    }
}


function renderAboutDetails(aboutData) {

    const aboutIntro = document.querySelector('.about-intro');
    if (aboutIntro && aboutData.description) {
        aboutIntro.textContent = aboutData.description;
    }


    const aboutDetailsContainer = document.getElementById('about-details');
    if (!aboutDetailsContainer || !aboutData.details) return;

    aboutDetailsContainer.innerHTML = '';

    aboutData.details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';

        detailItem.innerHTML = `
            <i data-feather="${detail.icon}" class="detail-icon"></i>
            <div>
                <h3>${detail.title}</h3>
                <p>${detail.value}</p>
            </div>
        `;

        aboutDetailsContainer.appendChild(detailItem);
    });


    feather.replace();
}


function renderSkills(skillsData) {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer || !skillsData.length) return;

    skillsContainer.innerHTML = '';

    skillsData.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skill-category reveal-element';

        categoryElement.innerHTML = `
            <div class="category-header">
                <i data-feather="${category.icon}" class="category-icon"></i>
                <h2>${category.name}</h2>
            </div>
            <div class="skills-list">
                ${category.skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-percentage">${skill.percentage}%</span>
                        </div>
                        <div class="skill-bar-bg">
                            <div class="skill-bar-fill" style="width: 0%" data-width="${skill.percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        skillsContainer.appendChild(categoryElement);
    });


    feather.replace();
}


function renderProjects(projectsData) {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer || !projectsData.length) return;


    const viewAllButton = projectsContainer.querySelector('.secondary-button');
    projectsContainer.innerHTML = '';

    projectsData.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card reveal-element';

        projectCard.innerHTML = `
            <div class="project-image">
                <img data-src="${project.image}" alt="${project.title}" class="lazy-image">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${project.github ? `
                        <a href="${project.github}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i data-feather="github"></i>
                            <span>Source Code</span>
                        </a>
                    ` : ''}
                    ${project.demo ? `
                        <a href="${project.demo}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i data-feather="external-link"></i>
                            <span>Live Demo</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        projectsContainer.appendChild(projectCard);
    });


    if (viewAllButton) {
        projectsContainer.appendChild(viewAllButton);
    }


    feather.replace();
}


function renderExperience(experienceData) {

    const workTimeline = document.getElementById('work-timeline');
    if (workTimeline && experienceData.work) {
        workTimeline.innerHTML = '';

        experienceData.work.forEach(job => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item reveal-element';

            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h3>${job.title}</h3>
                        <div class="timeline-meta">
                            <span class="company">${job.company}</span>
                            <span class="duration">
                                <i data-feather="calendar" class="inline-icon"></i>
                                ${job.duration}
                            </span>
                        </div>
                    </div>
                    <p class="timeline-description">${job.description}</p>
                    <div class="timeline-tags">
                        ${job.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;

            workTimeline.appendChild(timelineItem);
        });
    }


    const educationTimeline = document.getElementById('education-timeline');
    if (educationTimeline && experienceData.education) {
        educationTimeline.innerHTML = '';

        experienceData.education.forEach(edu => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item reveal-element';

            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h3>${edu.degree}</h3>
                        <div class="timeline-meta">
                            <span class="company">${edu.institution}</span>
                            <span class="duration">
                                <i data-feather="calendar" class="inline-icon"></i>
                                ${edu.duration}
                            </span>
                        </div>
                    </div>
                    <p class="timeline-description">${edu.description}</p>
                </div>
            `;

            educationTimeline.appendChild(timelineItem);
        });
    }


    feather.replace();
}


function renderTestimonials(testimonialsData) {
    const testimonialsCarousel = document.getElementById('testimonials-carousel');
    const testimonialDots = document.getElementById('testimonial-dots');

    if (!testimonialsCarousel || !testimonialDots || !testimonialsData.length) return;

    testimonialsCarousel.innerHTML = '';
    testimonialDots.innerHTML = '';

    testimonialsData.forEach((testimonial, index) => {

        const testimonialCard = document.createElement('div');
        testimonialCard.className = `testimonial-card ${index === 0 ? 'active' : ''}`;

        testimonialCard.innerHTML = `
            <div class="testimonial-content">
                <div class="testimonial-text">
                    <svg class="quote-icon" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                    </svg>
                    <p>${testimonial.text}</p>
                </div>
                <div class="testimonial-author">
                    <div class="testimonial-image">
                        <img data-src="${testimonial.image}" alt="${testimonial.name}" class="lazy-image">
                    </div>
                    <div class="testimonial-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.position}</p>
                    </div>
                </div>
            </div>
        `;

        testimonialsCarousel.appendChild(testimonialCard);


        const testimonialDot = document.createElement('button');
        testimonialDot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
        testimonialDot.setAttribute('data-index', index);
        testimonialDot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);

        testimonialDots.appendChild(testimonialDot);
    });


    feather.replace();
}


function renderContactDetails(contactData) {
    const contactDetailsContainer = document.getElementById('contact-details');
    if (!contactDetailsContainer || !contactData.details) return;

    contactDetailsContainer.innerHTML = '';

    contactData.details.forEach(detail => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';

        contactItem.innerHTML = `
            <i data-feather="${detail.icon}" class="contact-icon"></i>
            <div>
                <h3>${detail.title}</h3>
                <p>${detail.value}</p>
            </div>
        `;

        contactDetailsContainer.appendChild(contactItem);
    });


    feather.replace();
}


function initParallax() {
    const background = document.querySelector(".background");
    if (!background) return;

    const blobs = background.querySelectorAll(".blob");

    document.addEventListener("mousemove", (e) => {
        if (isLoading) return;

        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        blobs.forEach((blob, i) => {
            const factor = (i + 1) * 0.1;
            const offsetX = (x - 0.5) * factor * 100;
            const offsetY = (y - 0.5) * factor * 100;

            blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    });
}


function initBidirectionalScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-element");


    const elementStates = new WeakMap();

    const revealOnScroll = () => {
        if (isLoading) return;

        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollingDown = currentScrollTop > lastScrollTop;

        revealElements.forEach((element) => {

            const rect = element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementBottom = rect.bottom;


            const isVisible = (elementTop < windowHeight - revealPoint) && (elementBottom > 0);


            const state = elementStates.get(element) || {
                revealed: false,
                direction: null
            };


            if (isVisible && !state.revealed) {
                element.classList.add("revealed");
                state.revealed = true;
                state.direction = scrollingDown ? 'down' : 'up';
                elementStates.set(element, state);
            }
            else if (!isVisible && state.revealed) {

                const oppositeDirection = (state.direction === 'down' && !scrollingDown) ||
                    (state.direction === 'up' && scrollingDown);

                if (oppositeDirection) {
                    element.classList.remove("revealed");
                    state.revealed = false;
                    elementStates.set(element, state);
                }
            }
        });


        lastScrollTop = currentScrollTop;
    };


    window.addEventListener('load', revealOnScroll);


    let scrollTimeout;
    window.addEventListener("scroll", () => {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            revealOnScroll();
            scrollTimeout = null;
        }, 10);
    });
}


function initSkillBars() {
    const skillBars = document.querySelectorAll(".skill-bar-fill");


    const skillBarStates = new WeakMap();

    const animateSkillBars = () => {
        if (isLoading) return;

        const windowHeight = window.innerHeight;
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollingDown = currentScrollTop > lastScrollTop;

        skillBars.forEach((bar) => {

            const rect = bar.getBoundingClientRect();
            const barTop = rect.top;
            const barBottom = rect.bottom;


            const isVisible = (barTop < windowHeight - 100) && (barBottom > 0);


            const state = skillBarStates.get(bar) || {
                animated: false,
                direction: null
            };


            if (isVisible && !state.animated) {
                const width = bar.getAttribute("data-width");
                bar.style.width = width;
                state.animated = true;
                state.direction = scrollingDown ? 'down' : 'up';
                skillBarStates.set(bar, state);
            }
            else if (!isVisible && state.animated) {

                const oppositeDirection = (state.direction === 'down' && !scrollingDown) ||
                    (state.direction === 'up' && scrollingDown);

                if (oppositeDirection) {
                    bar.style.width = "0%";
                    state.animated = false;
                    skillBarStates.set(bar, state);
                }
            }
        });
    };


    window.addEventListener('load', animateSkillBars);


    let scrollTimeout;
    window.addEventListener("scroll", () => {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            animateSkillBars();
            scrollTimeout = null;
        }, 10);
    });
}


function initNavigation() {
    const navItems = document.querySelectorAll(".navItem");
    const navBar = document.querySelector(".navBar");
    const sections = document.querySelectorAll("section");


    navItems.forEach((item) => {

        if (item.classList.contains('source-toggle')) return;

        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.querySelector("a").getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: "smooth",
                });
            }
        });
    });


    const scrollDownBtn = document.getElementById("scroll-down");
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener("click", () => {
            const aboutSection = document.getElementById("about");
            if (aboutSection) {
                window.scrollTo({
                    top: aboutSection.offsetTop,
                    behavior: "smooth",
                });
            }
        });
    }


    let navScrollTimeout;
    const updateActiveNavItem = () => {
        if (isLoading) return;

        let currentSection = "";
        const scrollPosition = window.scrollY + 300;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute("id");
            }
        });

        navItems.forEach((item) => {

            if (item.classList.contains('source-toggle')) return;

            item.classList.remove("active-nav-item");
            const href = item.querySelector("a").getAttribute("href").substring(1);

            if (href === currentSection) {
                item.classList.add("active-nav-item");
            }
        });


        if (window.scrollY > 100) {
            navBar.classList.add("scrolled");
        } else {
            navBar.classList.remove("scrolled");
        }
    };


    window.addEventListener('load', updateActiveNavItem);


    window.addEventListener("scroll", () => {
        if (navScrollTimeout) return;

        navScrollTimeout = setTimeout(() => {
            updateActiveNavItem();
            navScrollTimeout = null;
        }, 100);
    });
}


function initTestimonials() {
    const testimonialCards = document.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".testimonial-dot");
    let currentIndex = 0;
    let interval;

    if (!testimonialCards.length || !dots.length) return;

    const showTestimonial = (index) => {
        testimonialCards.forEach((card) => card.classList.remove("active"));
        dots.forEach((dot) => dot.classList.remove("active"));

        testimonialCards[index].classList.add("active");
        dots[index].classList.add("active");
        currentIndex = index;
    };


    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            clearInterval(interval);
            showTestimonial(index);
            startAutoSlide();
        });
    });


    const startAutoSlide = () => {
        interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % testimonialCards.length;
            showTestimonial(nextIndex);
        }, 5000);
    };


    startAutoSlide();
}


function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {


    });
}


function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');

    if (!lazyImages.length) return;


    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');

                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {

        const lazyLoad = () => {
            lazyImages.forEach(img => {
                if (img.getBoundingClientRect().top <= window.innerHeight &&
                    img.getBoundingClientRect().bottom >= 0 &&
                    getComputedStyle(img).display !== 'none') {

                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                    }
                }
            });
        };


        window.addEventListener('load', lazyLoad);


        let lazyLoadTimeout;
        window.addEventListener('scroll', () => {
            if (lazyLoadTimeout) return;

            lazyLoadTimeout = setTimeout(() => {
                lazyLoad();
                lazyLoadTimeout = null;
            }, 200);
        });
    }
}