-- ==========================================================================
-- DELICIOUS RECIPE HUB - MYSQL DATABASE SCHEMA SCRIPT
-- April 2026 Release
-- Run this script in phpMyAdmin or MySQL CLI to create tables & seed data
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS `recipe_hub_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `recipe_hub_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('chef', 'admin') DEFAULT 'chef',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `slug` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Recipes Table
CREATE TABLE IF NOT EXISTS `recipes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `prep_time` INT NOT NULL,
    `difficulty` ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    `rating` DECIMAL(2,1) DEFAULT 4.5,
    `image_url` TEXT NOT NULL,
    `ingredients` TEXT NOT NULL,
    `instructions` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS `favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `recipe_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `user_recipe_fav` (`user_id`, `recipe_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Categories
INSERT INTO `categories` (`name`, `slug`) VALUES
('Breakfast', 'breakfast'),
('Main Course', 'main-course'),
('Seafood', 'seafood'),
('Dessert', 'dessert'),
('Healthy', 'healthy')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed Demo User (Password: password123)
INSERT INTO `users` (`full_name`, `email`, `password`, `role`) VALUES
('Bhavani Induri', 'chef@delicioushub.com', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHeFj5kF4bQ7Nq7D5P6Z8Q7Nq7D5P6Z8Q7', 'chef')
ON DUPLICATE KEY UPDATE `email`=`email`;
