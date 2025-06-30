# Minturnus Redesign

## Configuration

Create a `backend/config.php` file containing your database and SMTP credentials. Copy the contents of `backend/config.sample.php` and replace the placeholder values:

```php
<?php
$servername  = 'localhost';
$username    = 'db_user';
$db_password = 'db_password';
$dbname      = 'database_name';

$smtp_user = 'smtp_user';
$smtp_pass = 'smtp_password';
$FACEBOOK_APP_ID = '';
```

`config.php` is ignored by Git so your sensitive data remains private.

The application also supports an alternative configuration style where the file
returns an array instead of defining variables:

```php
<?php
return [
    'DB_HOST' => 'localhost',
    'DB_USER' => 'db_user',
    'DB_PASS' => 'db_password',
    'DB_NAME' => 'database_name',
    'MAIL_USER' => 'smtp_user',
    'MAIL_PASS' => 'smtp_password'
];
```

Either format will be detected automatically.

If you receive a *500 Internal Server Error* when accessing any of the
`backend/` PHP scripts, ensure that this `config.php` file exists and
contains valid credentials.
