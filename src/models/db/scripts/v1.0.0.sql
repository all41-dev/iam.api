-- create schema iam collate utf8_general_ci;

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
