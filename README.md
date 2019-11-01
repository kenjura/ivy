# ivy
Simple app to read an old myBB forum DB as an archive

Customize .env with SQL parms. npm start. enjoy.

# mysql 8
if connecting to a mysql 8.x db with a user using native password, you may need to execute: 
```sql
ALTER USER 'usernamehere'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'passwordhere';

flush privileges;
```