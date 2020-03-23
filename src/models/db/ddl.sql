-- create schema iam collate latin1_swedish_ci;

create table accessToken
(
	uuid char(36) not null
		primary key,
	idClient char(36) not null,
	idUser char(36) not null,
	scopes text null,
	tokenValue varchar(256) not null,
	expiresAt timestamp null,
	createdAt timestamp null,
	updatedAt timestamp null
);

create table ressource
(
	uuid char(36) null,
	path varchar(2000) not null,
	secret varchar(200) null,
	redirectUris varchar(2000) null,
	email varchar(200) null,
	name varchar(200) null,
	hash char(128) null,
	salt char(128) null,
	parentUuid char(36) null,
	scopeUuids varchar(2000) null,
	groupUuids varchar(2000) null,
	createdAt timestamp null,
	updatedAt timestamp null
);

create table scope
(
	uuid char(36) not null
		primary key,
	name varchar(200) null,
	ressourcePaths varchar(2000) null,
	createdAt timestamp null,
	updatedAt timestamp null
);

create table setPasswordToken
(
	uuid char(36) not null
		primary key,
	IdUser char(36) not null,
	Expires timestamp default current_timestamp() not null on update current_timestamp(),
	Message varchar(2000) null,
	TokenHash varchar(200) not null,
	createdAt timestamp null,
	updatedAt timestamp null
);

INSERT INTO iam.scope (uuid, name, ressourcePaths, createdAt, updatedAt) VALUES ('64dfd5e7-5165-42a7-9080-9a3cf8c47d48', 'all', '/root', null, null);
INSERT INTO iam.ressource (uuid, path, secret, redirectUris, email, name, hash, salt, parentUuid, scopeUuids, groupUuids, createdAt, updatedAt) VALUES ('33f6618f-0b2a-4b81-b757-9010778b7622', '/root', null, null, null, 'racine', null, null, null, null, null, null, null);
INSERT INTO iam.ressource (uuid, path, secret, redirectUris, email, name, hash, salt, parentUuid, scopeUuids, groupUuids, createdAt, updatedAt) VALUES ('1ece52f7-9153-4c1f-995b-45f335333c44', '/root/clients', null, null, null, 'applications', null, null, '33f6618f-0b2a-4b81-b757-9010778b7622', null, null, null, null);
INSERT INTO iam.ressource (uuid, path, secret, redirectUris, email, name, hash, salt, parentUuid, scopeUuids, groupUuids, createdAt, updatedAt) VALUES ('dc999ff3-1b21-41f2-a60f-d28ff6e2c949', '/root/clients/iam', 'les chiens aboient la caravane passe', null, null, 'IAM', null, null, '1ece52f7-9153-4c1f-995b-45f335333c44', null, null, null, null);
INSERT INTO iam.ressource (uuid, path, secret, redirectUris, email, name, hash, salt, parentUuid, scopeUuids, groupUuids, createdAt, updatedAt) VALUES ('b3eeec27-54e6-4e5f-bc53-7f4d2cd83cc4', '/root/users', null, null, null, 'utilisateurs', null, null, '33f6618f-0b2a-4b81-b757-9010778b7622', null, null, null, null);
INSERT INTO iam.ressource (uuid, path, secret, redirectUris, email, name, hash, salt, parentUuid, scopeUuids, groupUuids, createdAt, updatedAt) VALUES ('71513979-5448-40e1-a225-461474055437', '/root/users/admin@harps.ch', null, null, 'admin@harps.ch', null, '$2b$10$7AdozeNJfrtp.wNBBr4f3eEZgA3qfgj24znFMV.fMeTRlyl1VVCi2', '$2b$10$7AdozeNJfrtp.wNBBr4f3e', null, '64dfd5e7-5165-42a7-9080-9a3cf8c47d48', null, '2020-03-23 12:39:16', '2020-03-23 12:39:58');

