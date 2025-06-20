-- SQL schema for MinTurnus friendship features

-- Table storing pending colleague requests
CREATE TABLE `friend_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
);

-- Table storing confirmed colleague relations
CREATE TABLE `friends` (
  `user1` INT NOT NULL,
  `user2` INT NOT NULL,
  PRIMARY KEY (`user1`, `user2`)
);

-- Table storing persistent login tokens
CREATE TABLE `remember_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  KEY `user_id` (`user_id`)
);

-- Table storing temporary shift deviations per user
CREATE TABLE `shift_deviations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `work_weeks` INT NOT NULL,
  `off_weeks` INT NOT NULL,
  `duration_days` INT NOT NULL,
  `keep_rhythm` TINYINT NOT NULL DEFAULT 0,
  KEY `user_id` (`user_id`)
);

-- Table marking close colleagues for each user
CREATE TABLE `close_colleagues` (
  `user_id` INT NOT NULL,
  `colleague_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `colleague_id`)
);
