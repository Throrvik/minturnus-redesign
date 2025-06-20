# MinTurnus

MinTurnus is a small PHP and JavaScript web application for managing shifts and calendar events. The repository contains both the frontend (HTML/JS/CSS) and the backend PHP scripts.

## Project structure

- HTML files in the repository root provide pages such as the calendar, login and register forms.
- `css/` and `js/` contain the static assets.
- `backend/` holds all PHP scripts including database access and mail sending logic.
- `.cpanel.yml` defines the deployment steps used by cPanel.

## Requirements

- PHP with PDO and MySQLi extensions
- MySQL database
- (Optional) An SMTP account for sending mail via PHPMailer

## Setup

1. Clone the repository to your web server or local development environment.
2. Install PHP and ensure the required extensions are enabled.
3. Install a MySQL database and create a user with access to it.
4. Configure the application credentials as described below.
5. Point your web server to the project directory.
6. Serve the project through a PHP-capable web server (e.g., Apache) so that sessions work. Opening the HTML files directly in your browser will bypass PHP and the login and profile pages will not function.

## Configuring credentials

Database and mail credentials are currently stored in `backend/database.php` and `backend/send_mail.php`. To keep sensitive data out of version control you can either create a `config.php` file or rely on environment variables.

### Using `config.php`

Create a new file `backend/config.php` and define your settings:

```php
<?php
$servername  = 'localhost';  // Database host
$username    = 'db_user';    // Database user
$db_password = 'db_pass';    // Database password
$dbname      = 'db_name';    // Database name

$smtp_user = 'user@example.com';   // SMTP username
$smtp_pass = 'secret';             // SMTP password
?>
```

Include this file from `database.php` and `send_mail.php` instead of hard‑coding the values.

### Using environment variables

Alternatively set the variables `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SMTP_USER` and `SMTP_PASS` in your server environment. Update the PHP files to read these values with `getenv()`.

## Deployment with `.cpanel.yml`

cPanel can automatically deploy the project using the tasks defined in `.cpanel.yml`:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/kalende1/public_html
    - /bin/cp -R * $DEPLOYPATH
```

When you push updates, cPanel copies the repository contents to the path specified by `DEPLOYPATH`. Adjust this path to match your hosting account.


## Friends API

The `api/` directory exposes a small JSON API used by `friends.html`.
All endpoints require the user to be logged in via PHP sessions.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `api/search_users.php?query=NAME` | GET | Search for users by name. |
| `api/send_request.php` | POST | Send a colleague request. JSON body `{id}`. |
| `api/pending_requests.php` | GET | List incoming colleague requests. |
| `api/respond_request.php` | POST | Accept or decline a request. JSON body `{id, accept}`. |
| `api/my_colleagues.php` | GET | List confirmed colleagues. |
| `api/remove_colleague.php` | DELETE | Remove a colleague. JSON body `{id}`. |

These scripts expect the tables `friend_requests` and `friends` in the database
as described in `js/friends.js`.

The search endpoint requires at least two characters in `query`.
Results are filtered with a fuzzy match. The query may match any part
of a user's first or last name (split on spaces or hyphen) if the
Levenshtein distance is one or the part starts with the query.

## Shift deviations

Logged in users can register temporary deviations from their own shift.
On the calendar page a button appears when your profile has a shift set.
Choose a start date, a temporary pattern like `1-2` and whether the
regular rhythm should continue unaffected or resume from the end of the
deviation. Days affected by a deviation are highlighted with a thick
border in the calendar.

### Creating the friends tables

You can create the required tables manually or import the provided
`schema.sql` file using phpMyAdmin's **Import** feature. The SQL definition is
shown below:

```sql
CREATE TABLE `friend_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
);

CREATE TABLE `friends` (
  `user1` INT NOT NULL,
  `user2` INT NOT NULL,
  PRIMARY KEY (`user1`, `user2`)
);

-- Persistent login tokens used by the "remember me" feature
CREATE TABLE `remember_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  KEY `user_id` (`user_id`)
);
```
