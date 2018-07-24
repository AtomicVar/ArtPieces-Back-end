# Used to create user and database

CREATE USER 'art'@'localhost' IDENTIFIED BY 'art';
CREATE DATABASE art;
GRANT ALL ON art.* TO 'art'@'localhost';