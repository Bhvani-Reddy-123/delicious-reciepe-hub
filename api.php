<?php
/**
 * Delicious Recipe Hub - RESTful PHP Controller with AI Chef Engine
 * April 2026 Release
 */

// Allow cross-origin requests & set JSON headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database Connection with graceful fallback
$pdo = null;
try {
    $host = '127.0.0.1';
    $db   = 'recipe_hub_db';
    $user = 'root';
    $pass = '';
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (Exception $e) {
    // Database fallback flag
    $pdo = null;
}

session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

try {
    switch ($action) {
        case 'status':
            echo json_encode([
                'status' => 'online',
                'database' => $pdo ? 'connected' : 'standalone_mode',
                'ai_engine' => 'ready',
                'version' => 'April 2026 Full-Stack AI Edition'
            ]);
            break;

        case 'get_recipes':
            if ($pdo) {
                $stmt = $pdo->query("SELECT r.*, c.name AS category, u.full_name AS author 
                                     FROM recipes r 
                                     LEFT JOIN categories c ON r.category_id = c.id 
                                     LEFT JOIN users u ON r.user_id = u.id 
                                     ORDER BY r.id DESC");
                $recipes = $stmt->fetchAll();
                echo json_encode(['status' => 'success', 'source' => 'mysql', 'data' => $recipes]);
            } else {
                echo json_encode(['status' => 'success', 'source' => 'client_storage', 'data' => []]);
            }
            break;

        case 'generate_ai_recipe':
            // Parse payload
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true) ?? $_POST;

            $ingredientsInput = trim($data['ingredients'] ?? 'chicken, garlic, olive oil, herbs');
            $cuisine = trim($data['cuisine'] ?? 'Italian');
            $diet = trim($data['diet'] ?? 'Any');

            // AI Chef Algorithm Logic - Synthesizes custom gourmet recipe based on ingredients
            $ingredientList = array_map('trim', explode(',', $ingredientsInput));
            $mainIngredient = ucfirst($ingredientList[0] ?? 'Chef Special');

            $titleTemplates = [
                "Pan-Seared $mainIngredient in $cuisine Garlic Infusion",
                "Gourmet $cuisine $mainIngredient Delight",
                "Artisanal $mainIngredient & Herb Medley",
                "Chef's Signature $cuisine $mainIngredient Special"
            ];
            $generatedTitle = $titleTemplates[array_rand($titleTemplates)];

            $categoryMap = [
                'Italian' => 'Main Course',
                'American' => 'Main Course',
                'Asian' => 'Seafood',
                'Mediterranean' => 'Healthy',
                'Mexican' => 'Main Course'
            ];
            $generatedCategory = $categoryMap[$cuisine] ?? 'Main Course';

            $aiIngredients = [];
            foreach ($ingredientList as $ing) {
                $aiIngredients[] = "Fresh " . $ing;
            }
            $aiIngredients[] = "2 tbsp extra virgin olive oil";
            $aiIngredients[] = "Pinch of kosher salt and freshly ground black pepper";
            $aiIngredients[] = "Fresh garnishing herbs";

            $aiInstructions = [
                "Prep ingredients carefully: chop $ingredientsInput into uniform pieces.",
                "Heat skillet over medium-high flame and coat evenly with olive oil.",
                "Sauté the $mainIngredient for 4 to 6 minutes until sizzling and tender.",
                "Combine remaining ingredients ($ingredientsInput) and simmer on low heat for 10 minutes to allow flavors to fuse.",
                "Plate hot, sprinkle with fresh herbs and serve with your favorite side dish."
            ];

            $stockImages = [
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80"
            ];

            $aiRecipe = [
                'id' => time(),
                'title' => $generatedTitle,
                'category' => $generatedCategory,
                'prepTime' => rand(15, 30),
                'difficulty' => 'Easy',
                'rating' => 4.9,
                'image' => $stockImages[array_rand($stockImages)],
                'author' => 'Delicious Hub AI Chef',
                'authorId' => 'ai-chef',
                'ingredients' => $aiIngredients,
                'instructions' => $aiInstructions
            ];

            echo json_encode([
                'status' => 'success',
                'message' => 'AI Recipe successfully synthesized!',
                'data' => $aiRecipe
            ]);
            break;

        case 'add_recipe':
            $title = trim($_POST['title'] ?? '');
            $category_id = intval($_POST['category_id'] ?? 1);
            $prep_time = intval($_POST['prep_time'] ?? 20);
            $difficulty = $_POST['difficulty'] ?? 'Easy';
            $ingredients = $_POST['ingredients'] ?? '';
            $instructions = $_POST['instructions'] ?? '';
            $image_url = $_POST['image_url'] ?? '';

            if ($pdo) {
                $stmt = $pdo->prepare("INSERT INTO recipes (user_id, category_id, title, prep_time, difficulty, image_url, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$_SESSION['user_id'] ?? 1, $category_id, $title, $prep_time, $difficulty, $image_url, $ingredients, $instructions]);
                echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
            } else {
                echo json_encode(['status' => 'success', 'message' => 'Saved in client mode']);
            }
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
