-- SQL schema for KalenderTurnus friendship features

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
