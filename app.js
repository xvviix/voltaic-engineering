/**
 * VOLTA - PREMIUM SMART GRID & ELECTRICAL SERVICES
 * Core Interactive Client Script
 */

(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", () => {
        // --- 1. INITIALIZATION & MODULES ---
        initCustomCursor();
        initMobileMenu();
        initTelemetryOscilloscope();
        initControlCenter();
        initCostEstimator();
        initWireComparisonSlider();
        initTestimonialSlider();
        initFaqAccordion();
        initContactForm();
        initServiceCardTilt();
        initElectricSparksEffect(); // ADDED: Electric Sparks Module
    });

    // --- 2. CUSTOM CURSOR MODULE ---
    function initCustomCursor() {
        const cursor = document.getElementById("customCursor");
        if (!cursor) return;
        
        const dot = cursor.querySelector(".cursor-dot");
        const ring = cursor.querySelector(".cursor-ring");
        
        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;
        
        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        });
        
        // Render loop for smooth ring lag animation
        function renderRing() {
            // Lerp formula: current = current + (target - current) * factor
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            
            requestAnimationFrame(renderRing);
        }
        renderRing();
        
        // Hover reactions on interactive components
        const interactiveElements = document.querySelectorAll(
            "a, button, input, select, textarea, .control-switch-item, .radio-card, .faq-trigger, .project-image-wrapper, .electric-text"
        );
        
        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-active");
            });
            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-active");
            });
        });
    }

    // --- 3. MOBILE MENU MODULE ---
    function initMobileMenu() {
        const toggle = document.querySelector(".mobile-menu-toggle");
        const nav = document.querySelector(".nav");
        const navLinks = document.querySelectorAll(".nav-link");
        
        if (!toggle || !nav) return;
        
        toggle.addEventListener("click", () => {
            toggle.classList.toggle("active");
            nav.classList.toggle("active");
        });
        
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                toggle.classList.remove("active");
                nav.classList.remove("active");
            });
        });
    }

    // --- 4. OSCILLOSCOPE TELEMETRY MODULE ---
    let globalActiveTelemetryLoad = 2.4; // Controlled by smart room triggers
    
    function initTelemetryOscilloscope() {
        const canvas = document.getElementById("oscilloscope");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        let animationId;
        
        // Handle responsive canvas sizing
        function resizeCanvas() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = 150 * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
        
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        
        let offset = 0;
        
        // Elements for telemetry numerical updates
        const elVoltage = document.getElementById("liveVoltage");
        const elFrequency = document.getElementById("liveFrequency");
        const elLoad = document.getElementById("liveLoad");
        const elActiveMetric = document.getElementById("metricsActiveLoad");
        const elTelemetryAlert = document.getElementById("telemetryAlert");
        
        function draw() {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = 150;
            ctx.clearRect(0, 0, width, height);
            
            // Draw baseline zero grid line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();
            
            // Draw glowing AC Sine wave (representing voltage/frequency)
            ctx.strokeStyle = globalActiveTelemetryLoad > 0 ? "#00F2FE" : "#FF3E6C";
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = globalActiveTelemetryLoad > 0 ? "rgba(0, 242, 254, 0.8)" : "rgba(255, 62, 108, 0.8)";
            
            ctx.beginPath();
            
            const amplitude = globalActiveTelemetryLoad > 0 ? 32 : 1.5; // Slightly flat if system is isolated
            const frequency = 0.02;
            
            for (let x = 0; x < width; x++) {
                // Combine main fundamental frequency with minor harmonics (noise simulation)
                const harmonic1 = Math.sin(x * frequency + offset) * amplitude;
                const harmonic2 = Math.sin(x * (frequency * 3.1) + offset * 2.2) * (amplitude * 0.08);
                const harmonic3 = Math.cos(x * (frequency * 5.2) - offset * 1.5) * (amplitude * 0.03);
                
                const y = (height / 2) + harmonic1 + harmonic2 + harmonic3;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow for other drawings
            
            // Increment offset to animate movement
            offset += globalActiveTelemetryLoad > 0 ? 0.075 : 0.008; 
            
            // Update numerical values with natural micro-fluctuations
            if (Math.random() > 0.85) {
                // Voltage fluctuate around 120.4V
                const voltVar = 120.4 + (Math.random() - 0.5) * 0.15;
                if (elVoltage) elVoltage.textContent = `${voltVar.toFixed(2)} V`;
                
                // Frequency fluctuate around 60.00Hz
                const freqVar = 60.00 + (Math.random() - 0.5) * 0.03;
                if (elFrequency) elFrequency.textContent = `${freqVar.toFixed(2)} Hz`;
                
                // Active combined load
                const noise = (Math.random() - 0.5) * 0.05;
                const currentTelemetryLoad = Math.max(0, globalActiveTelemetryLoad + noise);
                if (elLoad) elLoad.textContent = `${currentTelemetryLoad.toFixed(2)} kW`;
                
                // Sync metrics in hero card
                if (elActiveMetric && globalActiveTelemetryLoad > 0) {
                    const gridEfficiency = 99.98 - (currentTelemetryLoad * 0.001);
                    elActiveMetric.textContent = `${gridEfficiency.toFixed(2)}%`;
                } else if (elActiveMetric) {
                    elActiveMetric.textContent = "0.00%";
                }
                
                // Alert indicators
                if (elTelemetryAlert) {
                    if (globalActiveTelemetryLoad === 0) {
                        elTelemetryAlert.innerHTML = `
                            <span class="alert-indicator-warning"></span>
                            <span class="alert-text text-yellow">WARNING: ESTATE GRID DETACHED / ISOLATED.</span>
                        `;
                    } else if (globalActiveTelemetryLoad > 8.0) {
                        elTelemetryAlert.innerHTML = `
                            <span class="alert-indicator-warning animate-flicker"></span>
                            <span class="alert-text text-yellow font-mono">HIGH LOAD WARNING: UNBALANCED DRAW DETECTED.</span>
                        `;
                    } else {
                        elTelemetryAlert.innerHTML = `
                            <span class="alert-indicator-ok"></span>
                            <span class="alert-text">GRID HARMONICS BALANCED. NO FAULTS DETECTED.</span>
                        `;
                    }
                }
            }
            
            animationId = requestAnimationFrame(draw);
        }
        
        draw();
    }

    // --- 5. INTERACTIVE CONTROL CENTER (SMART ROOMS) ---
    function initControlCenter() {
        const toggleAmbient = document.getElementById("toggleAmbient");
        const toggleTheatre = document.getElementById("toggleTheatre");
        const toggleKitchen = document.getElementById("toggleKitchen");
        const toggleCharger = document.getElementById("toggleCharger");
        const toggleMaster = document.getElementById("toggleMaster");
        
        const svgZoneAmbient = document.getElementById("svgZoneAmbient");
        const svgZoneTheatre = document.getElementById("svgZoneTheatre");
        const svgZoneKitchen = document.getElementById("svgZoneKitchen");
        const svgZoneCharger = document.getElementById("svgZoneCharger");
        
        const feedAmbient = document.getElementById("feedAmbient");
        const feedTheatre = document.getElementById("feedTheatre");
        const feedKitchen = document.getElementById("feedKitchen");
        const feedCharger = document.getElementById("feedCharger");
        const svgFeedMain = document.getElementById("svgFeedMain");
        
        const houseStatusLabel = document.getElementById("houseStatusLabel");
        const houseLoadLabel = document.getElementById("houseLoadLabel");
        const headerStatusLabel = document.querySelector("#headerGridStatus .status-label");
        const headerStatusDot = document.querySelector("#headerGridStatus .status-dot");
        
        if (!toggleMaster) return;
        
        // Base weights of electrical load for zones (in kW)
        const loadWeights = {
            ambient: 0.4,
            theatre: 1.8,
            kitchen: 2.0,
            charger: 7.2
        };
        
        function updateHouseGridState() {
            let totalLoad = 0;
            const masterOn = toggleMaster.checked;
            
            // 1. If Master isolator is off, override everything to OFF
            if (!masterOn) {
                // Turn off SVG light zones
                [svgZoneAmbient, svgZoneTheatre, svgZoneKitchen, svgZoneCharger].forEach(zone => {
                    if (zone) zone.classList.remove("active");
                });
                
                // Turn off animated feeds
                [feedAmbient, feedTheatre, feedKitchen, feedCharger].forEach(feed => {
                    if (feed) feed.classList.remove("active");
                });
                
                if (svgFeedMain) {
                    svgFeedMain.setAttribute("stroke", "#FF3E6C");
                }
                
                if (houseStatusLabel) {
                    houseStatusLabel.innerHTML = "<span class='text-cyan' style='color:#FF3E6C; text-shadow: 0 0 10px rgba(255, 62, 108, 0.4);'>ISOLATED</span>";
                }
                if (houseLoadLabel) houseLoadLabel.textContent = "0.0 kW";
                
                globalActiveTelemetryLoad = 0;
                
                if (headerStatusLabel) headerStatusLabel.textContent = "GRID ISOLATED: SAFETY ACTIVE";
                if (headerStatusDot) {
                    headerStatusDot.style.backgroundColor = "#FF3E6C";
                    headerStatusDot.style.boxShadow = "0 0 10px #FF3E6C";
                }
                return;
            }
            
            // 2. Compute individual states if Master is ON
            if (svgFeedMain) {
                svgFeedMain.setAttribute("stroke", "#C6FF00");
            }
            
            // Ambient Zone
            if (toggleAmbient && toggleAmbient.checked) {
                if (svgZoneAmbient) svgZoneAmbient.classList.add("active");
                if (feedAmbient) feedAmbient.classList.add("active");
                totalLoad += loadWeights.ambient;
            } else {
                if (svgZoneAmbient) svgZoneAmbient.classList.remove("active");
                if (feedAmbient) feedAmbient.classList.remove("active");
            }
            
            // Theatre Zone
            if (toggleTheatre && toggleTheatre.checked) {
                if (svgZoneTheatre) svgZoneTheatre.classList.add("active");
                if (feedTheatre) feedTheatre.classList.add("active");
                totalLoad += loadWeights.theatre;
            } else {
                if (svgZoneTheatre) svgZoneTheatre.classList.remove("active");
                if (feedTheatre) feedTheatre.classList.remove("active");
            }
            
            // Kitchen Zone
            if (toggleKitchen && toggleKitchen.checked) {
                if (svgZoneKitchen) svgZoneKitchen.classList.add("active");
                if (feedKitchen) feedKitchen.classList.add("active");
                totalLoad += loadWeights.kitchen;
            } else {
                if (svgZoneKitchen) svgZoneKitchen.classList.remove("active");
                if (feedKitchen) feedKitchen.classList.remove("active");
            }
            
            // EV Charger Zone
            if (toggleCharger && toggleCharger.checked) {
                if (svgZoneCharger) svgZoneCharger.classList.add("active");
                if (feedCharger) feedCharger.classList.add("active");
                totalLoad += loadWeights.charger;
            } else {
                if (svgZoneCharger) svgZoneCharger.classList.remove("active");
                if (feedCharger) feedCharger.classList.remove("active");
            }
            
            // 3. UI readouts updates
            if (houseLoadLabel) houseLoadLabel.textContent = `${totalLoad.toFixed(1)} kW`;
            globalActiveTelemetryLoad = totalLoad;
            
            // Determine system status label
            if (houseStatusLabel) {
                if (totalLoad > 8.0) {
                    houseStatusLabel.innerHTML = "<span class='text-yellow'>LOAD CRITICAL</span>";
                    if (headerStatusLabel) headerStatusLabel.textContent = `GRID DRAW HIGH: ${totalLoad.toFixed(1)} kW`;
                    if (headerStatusDot) {
                        headerStatusDot.style.backgroundColor = "#FFB300";
                        headerStatusDot.style.boxShadow = "0 0 10px #FFB300";
                    }
                } else if (totalLoad === 0) {
                    houseStatusLabel.innerHTML = "<span>STBY // ZERO DRAW</span>";
                    if (headerStatusLabel) headerStatusLabel.textContent = "GRID STBY: NO LOAD";
                    if (headerStatusDot) {
                        headerStatusDot.style.backgroundColor = "#8E9BAE";
                        headerStatusDot.style.boxShadow = "none";
                    }
                } else {
                    houseStatusLabel.innerHTML = "<span class='text-lime'>OPTIMAL</span>";
                    if (headerStatusLabel) headerStatusLabel.textContent = `GRID SECURE: ${(120.4 + (Math.random() - 0.5) * 0.1).toFixed(1)}V`;
                    if (headerStatusDot) {
                        headerStatusDot.style.backgroundColor = "#C6FF00";
                        headerStatusDot.style.boxShadow = "0 0 10px #C6FF00";
                    }
                }
            }
        }
        
        // Event binding
        const toggles = [toggleAmbient, toggleTheatre, toggleKitchen, toggleCharger, toggleMaster];
        toggles.forEach(toggle => {
            if (toggle) {
                toggle.addEventListener("change", updateHouseGridState);
            }
        });
        
        // Run initial configuration
        updateHouseGridState();
    }

    // --- 6. COST & LOAD ESTIMATOR MODULE ---
    function initCostEstimator() {
        const estProperty = document.getElementById("estProperty");
        const estService = document.getElementById("estService");
        const estEV = document.getElementsByName("estEV");
        const estSolar = document.getElementsByName("estSolar");
        
        const outLoad = document.getElementById("outLoad");
        const outAmps = document.getElementById("outAmps");
        const outPanel = document.getElementById("outPanel");
        const outBudget = document.getElementById("outBudget");
        
        const btnApply = document.getElementById("btnApplyEstimate");
        const inSpecs = document.getElementById("injectedSpecs");
        const specsIndicator = document.getElementById("specsIndicator");
        const specsIndicatorText = document.getElementById("specsIndicatorText");
        const contactMessage = document.getElementById("contactMessage");
        
        if (!estProperty) return;
        
        function calculateEstimate() {
            let baselineLoad = 5.0; // kW
            let priceBase = 4500;   // USD
            let recommendedAmp = 100;
            let recommendedPanel = "Standard Siemens 100A";
            
            // 1. Property Impact
            const propValue = estProperty.value;
            if (propValue === "apartment") {
                baselineLoad = 4.0;
                priceBase = 4500;
            } else if (propValue === "villa") {
                baselineLoad = 10.0;
                priceBase = 8500;
                recommendedAmp = 200;
                recommendedPanel = "Lutron + Span Smart 200A";
            } else if (propValue === "estate") {
                baselineLoad = 18.0;
                priceBase = 15000;
                recommendedAmp = 400;
                recommendedPanel = "Dual Span Smart Panels (400A Combined Grid)";
            } else if (propValue === "commercial") {
                baselineLoad = 25.0;
                priceBase = 22000;
                recommendedAmp = 400;
                recommendedPanel = "Industrial Eaton Smart Phase-3 400A";
            }
            
            // 2. Service Scope Focus
            const serviceValue = estService.value;
            if (serviceValue === "smart-home") {
                baselineLoad += 2.5;
                priceBase += 4000;
            } else if (serviceValue === "panel-grid") {
                baselineLoad += 1.0;
                priceBase += 3000;
            } else if (serviceValue === "lighting-design") {
                baselineLoad += 1.5;
                priceBase += 5500;
            } else if (serviceValue === "emergency-standby") {
                baselineLoad += 2.0;
                priceBase += 12000; // Batteries and solar transfer switches
            }
            
            // 3. EV Option Focus
            let evVal = "no";
            for (const rb of estEV) {
                if (rb.checked) {
                    evVal = rb.value;
                    break;
                }
            }
            if (evVal === "yes") {
                baselineLoad += 9.6; // 80A continuous
                priceBase += 2200;
                if (recommendedAmp < 200) {
                    recommendedAmp = 200;
                    recommendedPanel = "Span Smart 200A Pro";
                }
            } else if (evVal === "dual") {
                baselineLoad += 19.2; // Dual 80A continuous
                priceBase += 4500;
                recommendedAmp = 400;
                recommendedPanel = "Span Dual Smart 400A Grid";
            }
            
            // 4. Solar Option Focus
            let solarVal = "no";
            for (const rb of estSolar) {
                if (rb.checked) {
                    solarVal = rb.value;
                    break;
                }
            }
            if (solarVal === "yes") {
                baselineLoad = Math.max(2.0, baselineLoad - 6.0); // Offset load via solar grid
                priceBase += 18000; // Tesla Solar roof integration is high end
            }
            
            // Calculate final displays
            if (outLoad) outLoad.textContent = `${baselineLoad.toFixed(1)} kW`;
            if (outAmps) outAmps.textContent = `${recommendedAmp} Amps`;
            if (outPanel) outPanel.textContent = recommendedPanel;
            
            // Budget bounds calculation
            const lowBudget = priceBase;
            const highBudget = Math.round(priceBase * 1.35);
            
            if (outBudget) {
                outBudget.textContent = `$${lowBudget.toLocaleString()} - $${highBudget.toLocaleString()}`;
            }
        }
        
        // Form field event list
        const fields = [estProperty, estService];
        fields.forEach(f => f.addEventListener("change", calculateEstimate));
        
        const radioFields = [...estEV, ...estSolar];
        radioFields.forEach(r => r.addEventListener("change", calculateEstimate));
        
        // Handle "Inject Specs" button
        if (btnApply) {
            btnApply.addEventListener("click", () => {
                const propertyText = estProperty.options[estProperty.selectedIndex].text;
                const serviceText = estService.options[estService.selectedIndex].text;
                const loadText = outLoad.textContent;
                const ampText = outAmps.textContent;
                const panelText = outPanel.textContent;
                const budgetText = outBudget.textContent;
                
                const specData = `Property: ${propertyText} | Focus: ${serviceText} | Load Projection: ${loadText} (${ampText}) | Recommendation: ${panelText} | Estimated Budget: ${budgetText}`;
                
                if (inSpecs) inSpecs.value = specData;
                
                if (specsIndicator && specsIndicatorText) {
                    specsIndicator.classList.add("injected");
                    specsIndicatorText.innerHTML = `SPECIFICATIONS CONNECTED: ${loadText} @ ${ampText} | ${budgetText}`;
                }
                
                // Inject prompt template message in contact form text area
                if (contactMessage) {
                    contactMessage.value = `I ran the Volta Electrical Load Estimator and would like to register a consultation. Here are my system specifications:\n\n- Property Layout: ${propertyText}\n- System Theme: ${serviceText}\n- Projected Power Load: ${loadText}\n- Structural Amperage: ${ampText}\n- Recommended Service Hub: ${panelText}\n- Budget Bracket: ${budgetText}\n\nPlease contact me to finalize a physical site assessment.`;
                }
                
                // Trigger smooth scroll to contact section
                const contactSec = document.getElementById("contact");
                if (contactSec) {
                    contactSec.scrollIntoView({ behavior: "smooth" });
                }
            });
        }
        
        // Run once at beginning
        calculateEstimate();
    }

    // --- 7. WIRE COMPARISON SLIDER (BEFORE / AFTER) ---
    function initWireComparisonSlider() {
        const slider = document.getElementById("wireSlider");
        if (!slider) return;
        
        const afterPanel = slider.querySelector(".panel-after");
        const handle = slider.querySelector(".slider-handle");
        
        let isSliding = false;
        
        function moveSlider(clientX) {
            const rect = slider.getBoundingClientRect();
            const posX = clientX - rect.left;
            let percentage = (posX / rect.width) * 100;
            
            // Limit bounds 0 to 100
            percentage = Math.max(0, Math.min(percentage, 100));
            
            afterPanel.style.width = `${percentage}%`;
            handle.style.left = `${percentage}%`;
        }
        
        // Mouse triggers
        handle.addEventListener("mousedown", (e) => {
            isSliding = true;
            e.preventDefault();
        });
        
        window.addEventListener("mouseup", () => {
            isSliding = false;
        });
        
        window.addEventListener("mousemove", (e) => {
            if (!isSliding) return;
            moveSlider(e.clientX);
        });
        
        // Touch triggers
        handle.addEventListener("touchstart", (e) => {
            isSliding = true;
        }, { passive: true });
        
        window.addEventListener("touchend", () => {
            isSliding = false;
        });
        
        window.addEventListener("touchmove", (e) => {
            if (!isSliding) return;
            if (e.touches.length > 0) {
                moveSlider(e.touches[0].clientX);
            }
        }, { passive: true });
        
        // Set standard 50% default
        afterPanel.style.width = "50%";
        handle.style.left = "50%";
    }

    // --- 8. TESTIMONIALS HORIZONTAL SLIDER ---
    function initTestimonialSlider() {
        const track = document.getElementById("testimonialsTrack");
        const dotsContainer = document.getElementById("testimonialsDots");
        if (!track || !dotsContainer) return;
        
        const cards = track.querySelectorAll(".testimonial-card");
        const totalCards = cards.length;
        
        let activeIndex = 0;
        
        // Generate Navigation dots
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === 0) dot.classList.add("active");
            dot.setAttribute("data-slide", i);
            dotsContainer.appendChild(dot);
        }
        
        const dots = dotsContainer.querySelectorAll(".dot");
        
        function gotoSlide(index) {
            activeIndex = index;
            track.style.transform = `translateX(-${activeIndex * 100}%)`;
            
            dots.forEach(dot => dot.classList.remove("active"));
            dots[activeIndex].classList.add("active");
        }
        
        dots.forEach(dot => {
            dot.addEventListener("click", () => {
                const index = parseInt(dot.getAttribute("data-slide"));
                gotoSlide(index);
            });
        });
        
        // Auto Slider interval
        let autoSlide = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= totalCards) nextIndex = 0;
            gotoSlide(nextIndex);
        }, 8000);
        
        track.addEventListener("mouseenter", () => clearInterval(autoSlide));
        track.addEventListener("mouseleave", () => {
            autoSlide = setInterval(() => {
                let nextIndex = activeIndex + 1;
                if (nextIndex >= totalCards) nextIndex = 0;
                gotoSlide(nextIndex);
            }, 8000);
        });
    }

    // --- 9. FAQ ACCORDION MODULE ---
    function initFaqAccordion() {
        const items = document.querySelectorAll(".faq-item");
        
        items.forEach(item => {
            const trigger = item.querySelector(".faq-trigger");
            const content = item.querySelector(".faq-content");
            
            if (!trigger || !content) return;
            
            trigger.addEventListener("click", () => {
                const isActive = item.classList.contains("active");
                
                // Close other items
                items.forEach(otherItem => {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".faq-content").style.maxHeight = null;
                });
                
                // Toggle active
                if (!isActive) {
                    item.classList.add("active");
                    content.style.maxHeight = `${content.scrollHeight}px`;
                }
            });
        });
    }

    // --- 10. CONTACT FORM & SYSTEM CONNECT PORTAL MODULE ---
    function initContactForm() {
        const form = document.getElementById("contactForm");
        const sparkOverlay = document.getElementById("sparkOverlay");
        const btnResetPortal = document.getElementById("btnResetPortal");
        
        if (!form || !sparkOverlay) return;
        
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Check form validity
            if (!form.checkValidity()) return;
            
            // Trigger overlay portal
            sparkOverlay.classList.add("active");
            
            // Generate minor physical screen rumble / vibration on submit
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 150]);
            }
        });
        
        if (btnResetPortal) {
            btnResetPortal.addEventListener("click", () => {
                sparkOverlay.classList.remove("active");
                form.reset();
                
                // Reset specs indicator
                const specsIndicator = document.getElementById("specsIndicator");
                const specsIndicatorText = document.getElementById("specsIndicatorText");
                const inSpecs = document.getElementById("injectedSpecs");
                
                if (specsIndicator) specsIndicator.classList.remove("injected");
                if (specsIndicatorText) specsIndicatorText.textContent = "NO INJECTED CALCULATOR ESTIMATES DETECTED. Run estimator above to pre-fill load values.";
                if (inSpecs) inSpecs.value = "None";
            });
        }
    }

    // --- 11. SUBTLE SERVICE CARD TILT INTERACTION ---
    function initServiceCardTilt() {
        const cards = document.querySelectorAll(".service-card");
        
        cards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // Mouse position x inside card
                const y = e.clientY - rect.top;  // Mouse position y inside card
                
                card.style.setProperty("--x", `${x}px`);
                card.style.setProperty("--y", `${y}px`);
                
                // Tilt rotation formulas
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotX = -((y - centerY) / centerY) * 4; // Max 4 degree tilt
                const rotY = ((x - centerX) / centerX) * 4;
                
                card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
            });
            
            card.addEventListener("mouseleave", () => {
                card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
            });
        });
    }

    // --- 12. ADDED: INTERACTIVE ELECTRIC SPARKS EFFECT ---
    function initElectricSparksEffect() {
        const electricTexts = document.querySelectorAll(".electric-text");
        
        electricTexts.forEach(el => {
            el.addEventListener("mousemove", (e) => {
                // Generate sparks selectively with random throttle to keep rendering 60 FPS
                if (Math.random() > 0.4) {
                    createSpark(e.clientX, e.clientY);
                }
            });
            
            // Generate minor extra burst on mouse enter
            el.addEventListener("mouseenter", (e) => {
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => createSpark(e.clientX, e.clientY), i * 40);
                }
            });
        });
        
        function createSpark(x, y) {
            const spark = document.createElement("div");
            spark.classList.add("electric-spark-particle");
            
            // Alternating neon voltages colors (volt green or cyan)
            const isCyan = Math.random() > 0.5;
            spark.style.backgroundColor = isCyan ? "var(--accent-cyan)" : "var(--accent-volt)";
            spark.style.boxShadow = isCyan ? "0 0 10px var(--accent-cyan), 0 0 15px var(--accent-cyan)" : "0 0 10px var(--accent-volt), 0 0 15px var(--accent-volt)";
            
            // Placement coordinates (absolute centered)
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            
            // Randomize scattering trajectory in 360 degrees
            const tx = (Math.random() - 0.5) * 100;
            const ty = (Math.random() - 0.5) * 100;
            spark.style.setProperty("--tx", `${tx}px`);
            spark.style.setProperty("--ty", `${ty}px`);
            
            // Randomize visual diameter
            const size = 3 + Math.random() * 4;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            
            document.body.appendChild(spark);
            
            // Self-purge node on fade-out animation termination
            setTimeout(() => {
                spark.remove();
            }, 600);
        }
    }

})();
