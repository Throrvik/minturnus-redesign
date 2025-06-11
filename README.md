# KalenderTurnus

KalenderTurnus is a small PHP and JavaScript web application for managing shifts and calendar events. The repository contains both the frontend (HTML/JS/CSS) and the backend PHP scripts.

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

