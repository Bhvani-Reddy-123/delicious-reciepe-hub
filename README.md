# Delicious Recipe Hub – Full Stack Recipe Management System (April 2026)

**Delicious Recipe Hub** is a responsive full-stack web application designed for interactive recipe management, cooking workflow optimization, user authentication, and culinary community sharing.

![Project Preview](https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80)

---

## 🛠️ Technology Stack & Tools

- **Frontend**: HTML5, Vanilla CSS3 (Modern Glassmorphism UI & Flex/Grid), ES6 JavaScript
- **Backend**: PHP 8.x (RESTful PDO API & Session Authentication)
- **Database**: MySQL (XAMPP / Relational Schema)
- **Tooling**: Git, GitHub, XAMPP, VS Code

---

## ✨ Key Features & Architecture

1. **Secure User Authentication System**:
   - Login & Register interface with session management.
   - Protected user dashboard and recipe creation routes.

2. **Full CRUD Recipe Management**:
   - **Create**: Add new recipes with custom ingredients, step-by-step instructions, prep time, difficulty, and image upload.
   - **Read**: Dynamic recipe gallery with modal detailed breakdown (ingredients checklist & step guidance).
   - **Update**: Edit existing recipe entries in real-time.
   - **Delete**: Remove obsolete recipes securely from dashboard.

3. **Image Upload Functionality**:
   - Client-side FileReader instant preview.
   - Server-side PHP file upload handling for local static file persistence.

4. **Dynamic Filtering & Search**:
   - Live Debounced Search across recipe titles, categories, and ingredients.
   - Multi-category tab filtering (Breakfast, Main Course, Seafood, Dessert, Healthy).
   - Sorting by Newest First, Highest Rated, and Fastest Prep Time.

5. **Personalized Chef Dashboard & Favorites**:
   - Quick stats counter for recipes published and saved favorites.
   - Interactive bookmarking / favorite toggles.

---

## 🚀 Quick Setup Instructions

### Option 1: Instant Browser / Local Server (Client-Side Storage Mode)
1. Open the project folder: `C:\Users\HP\.gemini\antigravity\scratch\delicious-recipe-hub`
2. Double click `index.html` to open in any web browser, OR serve via Python local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.

### Option 2: Full Stack XAMPP Deployment (PHP + MySQL)
1. Copy or clone this directory into your XAMPP `htdocs` folder:
   ```bash
   C:\xampp\htdocs\delicious-recipe-hub
   ```
2. Start **Apache** and **MySQL** services in the **XAMPP Control Panel**.
3. Open `http://localhost/phpmyadmin` in your browser.
4. Create a new database named `recipe_hub_db` and import `schema.sql`.
5. Access the web application at: `http://localhost/delicious-recipe-hub/`

---

## 📁 Repository & Folder Structure

```text
delicious-recipe-hub/
├── index.html          # Main responsive single page web application layout
├── style.css           # Modern dark-mode glassmorphic CSS design system
├── app.js              # Client-side state manager, CRUD logic, search, modal engine
├── db.php              # PHP PDO MySQL database connection
├── api.php             # PHP RESTful API endpoints (GET, POST, DELETE, Auth)
├── schema.sql          # MySQL Database schema & seed data
└── README.md           # Documentation & installation guide
```

---

## 👤 Author & License
- **Project**: Delicious Recipe Hub
- **Developer**: Bhavani Induri
- **GitHub Repository**: [https://github.com/Bhavani%20Induri/project-2](https://github.com/Bhavani%20Induri/project-2)
- **Date**: April 2026
