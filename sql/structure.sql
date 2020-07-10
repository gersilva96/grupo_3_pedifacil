-- -----------------------------------------------------
-- Schema pedifacil
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `pedifacil` DEFAULT CHARACTER SET utf8 ;
USE `pedifacil` ;

-- -----------------------------------------------------
-- Table `pedifacil`.`adresses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`adresses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_line` VARCHAR(50) NOT NULL,
  `second_line` VARCHAR(50) NULL DEFAULT NULL,
  `between_streets` VARCHAR(100) NULL DEFAULT NULL,
  `city` VARCHAR(50) NOT NULL,
  `phone` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `business_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `image` VARCHAR(50) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `role_id_idx` (`role_id` ASC) VISIBLE,
  CONSTRAINT `role-user`
    FOREIGN KEY (`role_id`)
    REFERENCES `pedifacil`.`roles` (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(300) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount` INT UNSIGNED NOT NULL,
  `stock` INT UNSIGNED NOT NULL,
  `image` VARCHAR(45) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `category_id_idx` (`category_id` ASC) VISIBLE,
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `category-product`
    FOREIGN KEY (`category_id`)
    REFERENCES `pedifacil`.`categories` (`id`),
  CONSTRAINT `user-product`
    FOREIGN KEY (`user_id`)
    REFERENCES `pedifacil`.`users` (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`cart_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`cart_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `user-cart_items_idx` (`user_id` ASC) VISIBLE,
  INDEX `product-cart_items_idx` (`product_id` ASC) VISIBLE,
  CONSTRAINT `product-cart_items`
    FOREIGN KEY (`product_id`)
    REFERENCES `pedifacil`.`products` (`id`),
  CONSTRAINT `user-cart_items`
    FOREIGN KEY (`user_id`)
    REFERENCES `pedifacil`.`users` (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`statuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`statuses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_date` DATETIME NOT NULL,
  `order_total` DECIMAL(10,2) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `address_id` INT UNSIGNED NOT NULL,
  `status_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  INDEX `adress_id_idx` (`address_id` ASC) VISIBLE,
  INDEX `status_id_idx` (`status_id` ASC) VISIBLE,
  CONSTRAINT `adress-order`
    FOREIGN KEY (`address_id`)
    REFERENCES `pedifacil`.`adresses` (`id`),
  CONSTRAINT `status-order`
    FOREIGN KEY (`status_id`)
    REFERENCES `pedifacil`.`statuses` (`id`),
  CONSTRAINT `user-order`
    FOREIGN KEY (`user_id`)
    REFERENCES `pedifacil`.`users` (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pedifacil`.`product_order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedifacil`.`product_order` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `total_cost` DECIMAL(10,2) NOT NULL,
  `unit_cost` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `product_id_idx` (`product_id` ASC) VISIBLE,
  INDEX `oder_id_idx` (`order_id` ASC) VISIBLE,
  CONSTRAINT `order-product_order`
    FOREIGN KEY (`order_id`)
    REFERENCES `pedifacil`.`orders` (`id`),
  CONSTRAINT `product-product_order`
    FOREIGN KEY (`product_id`)
    REFERENCES `pedifacil`.`products` (`id`))
ENGINE = InnoDB;