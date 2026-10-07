/**
 * Delicious Recipe Hub - Master JavaScript Engine
 * April 2026 Release - Full Backend + AI Chef Engine Connection
 */

const INITIAL_RECIPES = [
    {
        id: 1,
        title: "Artisanal Creamy Tomato Basil Pasta",
        category: "Main Course",
        prepTime: 25,
        difficulty: "Easy",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        author: "Chef Alex Riviera",
        authorId: "seed-1",
        ingredients: [
            "350g Fettuccine pasta",
            "1.5 cups crushed San Marzano tomatoes",
            "3/4 cup heavy cream",
            "4 cloves garlic minced",
            "1/2 cup fresh grated Parmesan cheese",
            "Fresh basil leaves & extra virgin olive oil"
        ],
        instructions: [
            "Bring a large pot of salted water to a rolling boil. Add pasta and cook for 9 minutes.",
            "In a skillet, sauté garlic in olive oil for 60 seconds until fragrant.",
            "Pour in crushed tomatoes, season with salt and pepper, and simmer for 10 minutes.",
            "Lower heat, stir in heavy cream until smooth, then toss cooked pasta into sauce.",
            "Garnish with freshly grated Parmesan and fresh sweet basil leaves!"
        ]
    },
    {
        id: 2,
        title: "Soufflé Fluffy Berry Pancakes",
        category: "Breakfast",
        prepTime: 20,
        difficulty: "Easy",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
        author: "Bhavani Induri",
        authorId: "seed-2",
        ingredients: [
            "2 cups all-purpose flour",
            "2 tsp baking powder",
            "2 large eggs, separated",
            "1.25 cups whole milk",
            "3 tbsp melted butter",
            "Fresh blueberries, raspberries & maple syrup"
        ],
        instructions: [
            "Whisk dry ingredients in a bowl.",
            "In a separate bowl, whisk egg yolks, milk, and melted butter.",
            "Whip egg whites to stiff peaks and fold into batter.",
            "Cook on buttered skillet for 3 mins per side. Serve hot topped with berries and maple syrup!"
        ]
    },
    {
        id: 3,
        title: "Pan-Seared Lemon Herb Salmon",
        category: "Seafood",
        prepTime: 18,
        difficulty: "Medium",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
        author: "Chef Marco Pierre",
        authorId: "seed-3",
        ingredients: [
            "2 wild salmon fillets, skin-on",
            "2 tbsp unsalted butter",
            "1 lemon, sliced",
            "Fresh rosemary & thyme sprigs",
            "1 bunch green asparagus"
        ],
        instructions: [
            "Pat salmon fillets dry with paper towels; season skin and flesh generously.",
            "Heat skillet over medium-high heat with olive oil.",
            "Sear salmon skin-side down for 4 minutes until crispy.",
            "Flip, add butter, lemon slices, and herbs. Baste salmon for 3 minutes and serve!"
        ]
    }
];

class RecipeApp {
    constructor() {
        this.recipes = [];
        this.favorites = [];
        this.currentUser = null;
        this.currentCategoryFilter = "All";
        this.searchQuery = "";
        this.sortBy = "newest";
        this.activeDashTab = "my-recipes";
        this.uploadedImageBase64 = null;
        this.backendAvailable = false;

        this.init();
    }

    async init() {
        await this.checkBackendStatus();
        this.loadStateFromStorage();
        if (this.backendAvailable) {
            await this.fetchRecipesFromBackend();
        }
        this.bindEvents();
        this.renderAuthWidget();
        this.renderRecipes();
        this.updateDashboardStats();
    }

    async checkBackendStatus() {
        try {
            const res = await fetch("api.php?action=status");
            if (res.ok) {
                const data = await res.json();
                if (data.status === "online") {
                    this.backendAvailable = true;
                    console.log("PHP Backend Online:", data);
                }
            }
        } catch (e) {
            console.log("Backend not detected, running in high-performance client mode.");
            this.backendAvailable = false;
        }

        const backendLabel = document.getElementById("stat-backend-status");
        if (backendLabel) {
            backendLabel.textContent = this.backendAvailable ? "PHP + MySQL Active" : "Local Storage Mode";
        }
    }

    async fetchRecipesFromBackend() {
        try {
            const res = await fetch("api.php?action=get_recipes");
            const json = await res.json();
            if (json.status === "success" && json.data && json.data.length > 0) {
                // Merge backend data
                this.recipes = json.data.map(r => ({
                    id: r.id,
                    title: r.title,
                    category: r.category || "Main Course",
                    prepTime: r.prep_time || 20,
                    difficulty: r.difficulty || "Easy",
                    rating: r.rating || 4.8,
                    image: r.image_url || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                    author: r.author || "Chef",
                    authorId: r.user_id || "seed-1",
                    ingredients: r.ingredients ? r.ingredients.split("\n") : [],
                    instructions: r.instructions ? r.instructions.split("\n") : []
                }));
                this.saveRecipesToStorage();
            }
        } catch (e) {
            console.error("Fetch recipes failed, using storage state.", e);
        }
    }

    loadStateFromStorage() {
        const savedRecipes = localStorage.getItem("drh_recipes");
        if (savedRecipes) {
            this.recipes = JSON.parse(savedRecipes);
        } else {
            this.recipes = [...INITIAL_RECIPES];
            this.saveRecipesToStorage();
        }

        const savedFavs = localStorage.getItem("drh_favorites");
        this.favorites = savedFavs ? JSON.parse(savedFavs) : [1, 3];

        const savedUser = localStorage.getItem("drh_user");
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    saveRecipesToStorage() {
        localStorage.setItem("drh_recipes", JSON.stringify(this.recipes));
    }

    saveFavoritesToStorage() {
        localStorage.setItem("drh_favorites", JSON.stringify(this.favorites));
    }

    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem("drh_user", JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem("drh_user");
        }
    }

    bindEvents() {
        // Mobile Navbar Toggle
        const mobileToggle = document.getElementById("mobile-toggle");
        const navMenu = document.getElementById("nav-menu");
        if (mobileToggle) {
            mobileToggle.addEventListener("click", () => {
                navMenu.classList.toggle("active");
            });
        }

        // Hero Search
        const btnHeroSearch = document.getElementById("btn-hero-search");
        const heroInput = document.getElementById("hero-search-input");
        if (btnHeroSearch && heroInput) {
            btnHeroSearch.addEventListener("click", () => {
                this.searchQuery = heroInput.value.trim().toLowerCase();
                document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
                this.renderRecipes();
            });

            heroInput.addEventListener("keyup", (e) => {
                if (e.key === "Enter") {
                    this.searchQuery = heroInput.value.trim().toLowerCase();
                    document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
                    this.renderRecipes();
                }
            });
        }

        // Quick Tags
        document.querySelectorAll(".tag-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tag = e.target.getAttribute("data-tag");
                this.searchQuery = tag.toLowerCase();
                document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
                this.renderRecipes();
            });
        });

        // Category Filter Tabs
        document.querySelectorAll(".category-tab").forEach(tab => {
            tab.addEventListener("click", (e) => {
                document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
                e.target.classList.add("active");
                this.currentCategoryFilter = e.target.getAttribute("data-category");
                this.renderRecipes();
            });
        });

        // Sort Filter Dropdown
        const sortFilter = document.getElementById("sort-filter");
        if (sortFilter) {
            sortFilter.addEventListener("change", (e) => {
                this.sortBy = e.target.value;
                this.renderRecipes();
            });
        }

        // AI Modal Triggers
        const btnOpenAI = document.getElementById("btn-open-ai");
        const btnDashAI = document.getElementById("btn-dash-ai");
        const modalAI = document.getElementById("ai-modal");
        const modalCloseAI = document.getElementById("modal-close-ai");

        const openAIHandler = () => this.openModal(modalAI);
        if (btnOpenAI) btnOpenAI.addEventListener("click", openAIHandler);
        if (btnDashAI) btnDashAI.addEventListener("click", openAIHandler);
        if (modalCloseAI) modalCloseAI.addEventListener("click", () => this.closeModal(modalAI));

        // AI Generator Form Handler
        const aiForm = document.getElementById("ai-generator-form");
        if (aiForm) {
            aiForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.generateAIRecipe();
            });
        }

        // Auth Modal Triggers
        const btnOpenAuth = document.getElementById("btn-open-auth");
        const modalAuth = document.getElementById("auth-modal");
        const modalCloseAuth = document.getElementById("modal-close-auth");

        if (btnOpenAuth) btnOpenAuth.addEventListener("click", () => this.openModal(modalAuth));
        if (modalCloseAuth) modalCloseAuth.addEventListener("click", () => this.closeModal(modalAuth));

        // Auth Tabs
        const tabLogin = document.getElementById("auth-tab-login");
        const tabRegister = document.getElementById("auth-tab-register");
        const formLogin = document.getElementById("login-form");
        const formRegister = document.getElementById("register-form");

        if (tabLogin && tabRegister) {
            tabLogin.addEventListener("click", () => {
                tabLogin.classList.add("active");
                tabRegister.classList.remove("active");
                formLogin.classList.remove("form-hidden");
                formRegister.classList.add("form-hidden");
            });

            tabRegister.addEventListener("click", () => {
                tabRegister.classList.add("active");
                tabLogin.classList.remove("active");
                formRegister.classList.remove("form-hidden");
                formLogin.classList.add("form-hidden");
            });
        }

        // Login & Register Forms
        if (formLogin) {
            formLogin.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = document.getElementById("login-email").value;
                this.currentUser = {
                    id: "usr-" + Date.now(),
                    name: email.split("@")[0].toUpperCase() || "Chef",
                    email: email
                };
                this.saveUserToStorage();
                this.renderAuthWidget();
                this.closeModal(modalAuth);
                this.showToast("Welcome back, Chef!", "success");
                this.updateDashboardStats();
            });
        }

        if (formRegister) {
            formRegister.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = document.getElementById("reg-name").value;
                const email = document.getElementById("reg-email").value;
                this.currentUser = { id: "usr-" + Date.now(), name, email };
                this.saveUserToStorage();
                this.renderAuthWidget();
                this.closeModal(modalAuth);
                this.showToast("Account created successfully!", "success");
                this.updateDashboardStats();
            });
        }

        // Add / Edit Recipe Modal Triggers
        const btnAddRecipe = document.getElementById("btn-add-recipe");
        const btnDashCreate = document.getElementById("btn-dash-create");
        const modalForm = document.getElementById("recipe-form-modal");
        const modalCloseForm = document.getElementById("modal-close-form");
        const btnCancelForm = document.getElementById("btn-cancel-form");

        const openFormHandler = () => {
            if (!this.currentUser) {
                this.openModal(modalAuth);
                this.showToast("Please login first to add recipes.", "error");
                return;
            }
            this.resetRecipeForm();
            this.openModal(modalForm);
        };

        if (btnAddRecipe) btnAddRecipe.addEventListener("click", openFormHandler);
        if (btnDashCreate) btnDashCreate.addEventListener("click", openFormHandler);
        if (modalCloseForm) modalCloseForm.addEventListener("click", () => this.closeModal(modalForm));
        if (btnCancelForm) btnCancelForm.addEventListener("click", () => this.closeModal(modalForm));

        // Image File Reader
        const btnTriggerUpload = document.getElementById("btn-trigger-file-upload");
        const fileInput = document.getElementById("form-image-file");
        const previewImg = document.getElementById("form-image-preview");

        if (btnTriggerUpload && fileInput) {
            btnTriggerUpload.addEventListener("click", () => fileInput.click());
            fileInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.uploadedImageBase64 = event.target.result;
                        previewImg.src = event.target.result;
                        previewImg.classList.remove("image-preview-hidden");
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Recipe CRUD Submit
        const crudForm = document.getElementById("recipe-crud-form");
        if (crudForm) {
            crudForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSaveRecipe();
            });
        }

        // Recipe Detail Modal Close
        const modalRecipe = document.getElementById("recipe-modal");
        const modalCloseRecipe = document.getElementById("modal-close-recipe");
        if (modalCloseRecipe) {
            modalCloseRecipe.addEventListener("click", () => this.closeModal(modalRecipe));
        }

        // Dashboard Tabs
        document.querySelectorAll(".dash-tab").forEach(tab => {
            tab.addEventListener("click", (e) => {
                document.querySelectorAll(".dash-tab").forEach(t => t.classList.remove("active"));
                e.target.classList.add("active");
                this.activeDashTab = e.target.getAttribute("data-tab");
                this.renderDashboardRecipes();
            });
        });

        // Contact Form
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.showToast("Message sent to Delicious Hub team!", "success");
                contactForm.reset();
            });
        }
    }

    async generateAIRecipe() {
        const ingredients = document.getElementById("ai-ingredients-input").value.trim();
        const cuisine = document.getElementById("ai-cuisine-style").value;
        const diet = document.getElementById("ai-diet-type").value;

        const loadingBox = document.getElementById("ai-loading");
        const resultBox = document.getElementById("ai-result-box");
        const formBox = document.getElementById("ai-generator-form");

        formBox.classList.add("form-hidden");
        loadingBox.classList.remove("form-hidden");
        resultBox.classList.add("form-hidden");

        try {
            let aiRecipe = null;
            if (this.backendAvailable) {
                const response = await fetch("api.php?action=generate_ai_recipe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ingredients, cuisine, diet })
                });
                const resJson = await response.json();
                if (resJson.status === "success") {
                    aiRecipe = resJson.data;
                }
            }

            // Fallback Client AI engine if backend offline
            if (!aiRecipe) {
                await new Promise(r => setTimeout(r, 1200)); // Smooth loading simulation
                const firstIng = ingredients.split(",")[0] || "Chef Specialty";
                aiRecipe = {
                    id: Date.now(),
                    title: `AI Gourmet ${cuisine} ${firstIng.toUpperCase()}`,
                    category: cuisine === "Italian" ? "Main Course" : "Healthy",
                    prepTime: 20,
                    difficulty: "Easy",
                    rating: 5.0,
                    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    author: "Delicious Hub AI Chef",
                    authorId: "ai-chef",
                    ingredients: ingredients.split(",").map(i => `Fresh ${i.trim()}`).concat(["2 tbsp olive oil", "Salt & Pepper"]),
                    instructions: [
                        `Prepare and slice your fresh ingredients: ${ingredients}.`,
                        "Heat olive oil in skillet over medium flame.",
                        `Sauté ingredients for 8 minutes until aromatic and tender.`,
                        "Garnish and serve hot!"
                    ]
                };
            }

            // Render AI Result
            loadingBox.classList.add("form-hidden");
            resultBox.classList.remove("form-hidden");

            resultBox.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem;">
                    <img src="${aiRecipe.image}" style="width: 100px; height: 100px; border-radius: var(--radius-md); object-fit: cover;">
                    <div>
                        <span class="badge badge-accent"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Generated</span>
                        <h3 style="margin-top: 0.3rem;">${aiRecipe.title}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${aiRecipe.category} • ${aiRecipe.prepTime} Mins Prep • ${aiRecipe.difficulty}</p>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--primary); font-size: 0.9rem;">Ingredients:</strong>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${aiRecipe.ingredients.join(", ")}</p>
                </div>
                <div style="display: flex; gap: 0.8rem;">
                    <button class="btn btn-primary btn-sm btn-block" id="btn-save-ai-recipe">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Publish to Recipe Hub
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-reset-ai-form">
                        <i class="fa-solid fa-rotate-left"></i> Again
                    </button>
                </div>
            `;

            document.getElementById("btn-save-ai-recipe").addEventListener("click", () => {
                this.recipes.unshift(aiRecipe);
                this.saveRecipesToStorage();
                this.renderRecipes();
                this.updateDashboardStats();
                this.closeModal(document.getElementById("ai-modal"));
                this.showToast("AI Generated Recipe published successfully!", "success");
            });

            document.getElementById("btn-reset-ai-form").addEventListener("click", () => {
                formBox.classList.remove("form-hidden");
                resultBox.classList.add("form-hidden");
            });

        } catch (e) {
            loadingBox.classList.add("form-hidden");
            formBox.classList.remove("form-hidden");
            this.showToast("AI Generation error, please try again.", "error");
        }
    }

    renderAuthWidget() {
        const widget = document.getElementById("user-widget");
        const btnAdd = document.getElementById("btn-add-recipe");
        const dashSection = document.getElementById("dashboard");
        const navLinks = document.querySelectorAll(".nav-link.auth-required");

        if (this.currentUser) {
            const initials = this.currentUser.name ? this.currentUser.name.charAt(0).toUpperCase() : "C";
            widget.innerHTML = `
                <div class="user-profile-menu">
                    <div class="avatar-sm">${initials}</div>
                    <span class="user-name-label">${this.currentUser.name}</span>
                    <button class="btn-logout" id="btn-logout" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
            `;
            if (btnAdd) btnAdd.style.display = "inline-flex";
            if (dashSection) dashSection.classList.remove("section-hidden");
            navLinks.forEach(l => l.style.display = "flex");

            document.getElementById("btn-logout").addEventListener("click", () => {
                this.currentUser = null;
                this.saveUserToStorage();
                this.renderAuthWidget();
                this.showToast("Logged out successfully.", "success");
            });

            document.getElementById("dash-user-name").textContent = `Welcome back, Chef ${this.currentUser.name}!`;
            document.getElementById("dash-avatar").textContent = initials;
        } else {
            widget.innerHTML = `
                <button class="btn btn-primary" id="btn-open-auth">
                    <i class="fa-solid fa-user"></i> <span>Login / Register</span>
                </button>
            `;
            if (btnAdd) btnAdd.style.display = "none";
            if (dashSection) dashSection.classList.add("section-hidden");
            navLinks.forEach(l => l.style.display = "none");

            document.getElementById("btn-open-auth").addEventListener("click", () => {
                this.openModal(document.getElementById("auth-modal"));
            });
        }
    }

    renderRecipes() {
        const grid = document.getElementById("recipe-grid");
        if (!grid) return;

        let filtered = this.recipes.filter(r => {
            const matchCategory = this.currentCategoryFilter === "All" || r.category === this.currentCategoryFilter;
            const matchSearch = !this.searchQuery || 
                r.title.toLowerCase().includes(this.searchQuery) ||
                r.category.toLowerCase().includes(this.searchQuery) ||
                r.ingredients.some(ing => ing.toLowerCase().includes(this.searchQuery));
            return matchCategory && matchSearch;
        });

        if (this.sortBy === "newest") {
            filtered.sort((a, b) => b.id - a.id);
        } else if (this.sortBy === "rating") {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (this.sortBy === "time") {
            filtered.sort((a, b) => a.prepTime - b.prepTime);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                    <i class="fa-solid fa-utensils" style="font-size: 3rem; color: var(--text-dim); margin-bottom: 1rem;"></i>
                    <h3>No Recipes Found</h3>
                    <p style="color: var(--text-muted);">Try adjusting your search criteria or create one using AI Chef!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(r => this.generateRecipeCardHtml(r)).join("");

        grid.querySelectorAll(".recipe-card").forEach(card => {
            const id = parseInt(card.getAttribute("data-id"));
            card.addEventListener("click", (e) => {
                if (e.target.closest(".favorite-btn")) return;
                this.openRecipeDetailModal(id);
            });
        });

        grid.querySelectorAll(".favorite-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute("data-id"));
                this.toggleFavorite(id);
            });
        });
    }

    generateRecipeCardHtml(recipe) {
        const isFav = this.favorites.includes(recipe.id);
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-card-image-wrap">
                    <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
                    <span class="recipe-badge-category">${recipe.category}</span>
                    <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${recipe.id}" title="Bookmark Recipe">
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="recipe-card-body">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta-row">
                        <span><i class="fa-regular fa-clock"></i> ${recipe.prepTime} mins</span>
                        <span><i class="fa-solid fa-signal"></i> ${recipe.difficulty}</span>
                        <div class="rating-badge"><i class="fa-solid fa-star"></i> ${recipe.rating}</div>
                    </div>
                </div>
            </div>
        `;
    }

    openRecipeDetailModal(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        const content = document.getElementById("recipe-detail-content");
        content.innerHTML = `
            <div class="modal-recipe-header">
                <img src="${recipe.image}" alt="${recipe.title}" class="modal-recipe-img">
                <div class="modal-recipe-info">
                    <span class="badge badge-accent">${recipe.category}</span>
                    <h2>${recipe.title}</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Created by <strong>${recipe.author || 'Delicious Hub Chef'}</strong></p>

                    <div class="recipe-stats-strip">
                        <div class="stat-pill"><i class="fa-regular fa-clock"></i> ${recipe.prepTime} Mins</div>
                        <div class="stat-pill"><i class="fa-solid fa-signal"></i> ${recipe.difficulty}</div>
                        <div class="stat-pill"><i class="fa-solid fa-star" style="color: var(--accent-gold);"></i> ${recipe.rating} / 5.0</div>
                    </div>
                </div>
            </div>

            <div class="recipe-ingredients-box">
                <h4><i class="fa-solid fa-basket-shopping"></i> Required Ingredients</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.5rem;">
                    ${recipe.ingredients.map(ing => `
                        <div class="ingredient-item">
                            <i class="fa-solid fa-check" style="color: var(--success); font-size: 0.8rem;"></i>
                            <span>${ing}</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="recipe-steps-box">
                <h4><i class="fa-solid fa-list-check"></i> Step-by-Step Cooking Instructions</h4>
                ${recipe.instructions.map((step, idx) => `
                    <div class="step-item">
                        <div class="step-num">${idx + 1}</div>
                        <div>${step}</div>
                    </div>
                `).join("")}
            </div>
        `;

        this.openModal(document.getElementById("recipe-modal"));
    }

    toggleFavorite(id) {
        if (this.favorites.includes(id)) {
            this.favorites = this.favorites.filter(favId => favId !== id);
            this.showToast("Removed from favorites", "info");
        } else {
            this.favorites.push(id);
            this.showToast("Added to saved favorites!", "success");
        }
        this.saveFavoritesToStorage();
        this.renderRecipes();
        this.updateDashboardStats();
    }

    async handleSaveRecipe() {
        const idVal = document.getElementById("form-recipe-id").value;
        const title = document.getElementById("form-title").value.trim();
        const category = document.getElementById("form-category").value;
        const prepTime = parseInt(document.getElementById("form-prep-time").value);
        const difficulty = document.getElementById("form-difficulty").value;
        const imageUrlInput = document.getElementById("form-image-url").value.trim();
        const ingredientsText = document.getElementById("form-ingredients").value;
        const instructionsText = document.getElementById("form-instructions").value;

        let finalImage = this.uploadedImageBase64 || imageUrlInput || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
        const ingredients = ingredientsText.split("\n").filter(i => i.trim() !== "");
        const instructions = instructionsText.split("\n").filter(i => i.trim() !== "");

        if (this.backendAvailable) {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("category_id", 1);
            formData.append("prep_time", prepTime);
            formData.append("difficulty", difficulty);
            formData.append("ingredients", ingredientsText);
            formData.append("instructions", instructionsText);
            formData.append("image_url", finalImage);

            try {
                await fetch("api.php?action=add_recipe", { method: "POST", body: formData });
            } catch (e) {
                console.error("API POST error:", e);
            }
        }

        if (idVal) {
            const index = this.recipes.findIndex(r => r.id === parseInt(idVal));
            if (index !== -1) {
                this.recipes[index] = { ...this.recipes[index], title, category, prepTime, difficulty, image: finalImage, ingredients, instructions };
                this.showToast("Recipe updated successfully!", "success");
            }
        } else {
            this.recipes.unshift({
                id: Date.now(),
                title, category, prepTime, difficulty, rating: 5.0,
                image: finalImage,
                author: this.currentUser ? this.currentUser.name : "Guest Chef",
                authorId: this.currentUser ? this.currentUser.id : "guest",
                ingredients, instructions
            });
            this.showToast("New recipe created and published!", "success");
        }

        this.saveRecipesToStorage();
        this.closeModal(document.getElementById("recipe-form-modal"));
        this.renderRecipes();
        this.updateDashboardStats();
    }

    editRecipe(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        document.getElementById("form-modal-title").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Recipe`;
        document.getElementById("form-recipe-id").value = recipe.id;
        document.getElementById("form-title").value = recipe.title;
        document.getElementById("form-category").value = recipe.category;
        document.getElementById("form-prep-time").value = recipe.prepTime;
        document.getElementById("form-difficulty").value = recipe.difficulty;
        document.getElementById("form-image-url").value = recipe.image.startsWith("data:") ? "" : recipe.image;
        document.getElementById("form-ingredients").value = recipe.ingredients.join("\n");
        document.getElementById("form-instructions").value = recipe.instructions.join("\n");

        const previewImg = document.getElementById("form-image-preview");
        previewImg.src = recipe.image;
        previewImg.classList.remove("image-preview-hidden");

        this.openModal(document.getElementById("recipe-form-modal"));
    }

    deleteRecipe(id) {
        if (confirm("Are you sure you want to delete this recipe?")) {
            this.recipes = this.recipes.filter(r => r.id !== id);
            this.favorites = this.favorites.filter(favId => favId !== id);
            this.saveRecipesToStorage();
            this.saveFavoritesToStorage();
            this.renderRecipes();
            this.updateDashboardStats();
            this.showToast("Recipe deleted.", "info");
        }
    }

    resetRecipeForm() {
        document.getElementById("recipe-crud-form").reset();
        document.getElementById("form-recipe-id").value = "";
        document.getElementById("form-modal-title").innerHTML = `<i class="fa-solid fa-utensils"></i> Add New Recipe`;
        this.uploadedImageBase64 = null;
        const previewImg = document.getElementById("form-image-preview");
        previewImg.src = "";
        previewImg.classList.add("image-preview-hidden");
    }

    updateDashboardStats() {
        if (!this.currentUser) return;

        const myRecipes = this.recipes.filter(r => r.authorId === this.currentUser.id || r.author === this.currentUser.name);
        const myFavs = this.recipes.filter(r => this.favorites.includes(r.id));

        document.getElementById("stat-my-recipes-count").textContent = myRecipes.length;
        document.getElementById("stat-favorites-count").textContent = myFavs.length;
        document.getElementById("count-my-recipes").textContent = myRecipes.length;
        document.getElementById("count-favorites").textContent = myFavs.length;

        this.renderDashboardRecipes();
    }

    renderDashboardRecipes() {
        const grid = document.getElementById("dashboard-recipes-grid");
        if (!grid) return;

        let displayList = [];
        if (this.activeDashTab === "my-recipes") {
            displayList = this.recipes.filter(r => r.authorId === (this.currentUser ? this.currentUser.id : "") || r.author === (this.currentUser ? this.currentUser.name : ""));
        } else {
            displayList = this.recipes.filter(r => this.favorites.includes(r.id));
        }

        if (displayList.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="color: var(--text-muted);">No recipes in this section yet.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = displayList.map(r => `
            <div class="recipe-card" data-id="${r.id}">
                <div class="recipe-card-image-wrap">
                    <img src="${r.image}" alt="${r.title}">
                    <span class="recipe-badge-category">${r.category}</span>
                </div>
                <div class="recipe-card-body">
                    <h3 class="recipe-title">${r.title}</h3>
                    <div class="recipe-meta-row">
                        <span><i class="fa-regular fa-clock"></i> ${r.prepTime} mins</span>
                        <span><i class="fa-solid fa-star" style="color: var(--accent-gold);"></i> ${r.rating}</span>
                    </div>
                    ${this.activeDashTab === 'my-recipes' ? `
                        <div class="card-actions-row">
                            <button class="btn btn-outline btn-sm btn-block btn-edit-recipe" data-id="${r.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="btn btn-danger btn-sm btn-delete-recipe" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join("");

        grid.querySelectorAll(".btn-edit-recipe").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute("data-id"));
                this.editRecipe(id);
            });
        });

        grid.querySelectorAll(".btn-delete-recipe").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute("data-id"));
                this.deleteRecipe(id);
            });
        });
    }

    openModal(modal) {
        if (modal) modal.classList.add("active");
    }

    closeModal(modal) {
        if (modal) modal.classList.remove("active");
    }

    showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-info";
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.app = new RecipeApp();
});
