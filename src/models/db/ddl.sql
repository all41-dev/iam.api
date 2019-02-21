create schema ift_users collate latin1_swedish_ci;

create table Clients
(
	Id int auto_increment
		primary key,
	ClientId varchar(80) not null,
	ClientSecret varchar(80) not null,
	Name varchar(100) not null,
	RedirectUris text,
	Grants text,
	CreatedAt timestamp default current_timestamp() not null on update current_timestamp(),
	UpdatedAt timestamp default '0000-00-00 00:00:00' not null,
	constraint Clients_ClientId_uindex
		unique (ClientId),
	constraint Clients_ClientSecret_uindex
		unique (ClientSecret)
);

create table Users
(
	Id int auto_increment
		primary key,
	Email varchar(200) not null,
	Hash char(128) null,
	Salt char(128) null,
	CreatedAt datetime null,
	UpdatedAt datetime null,
	constraint Users_Email_uindex
		unique (Email)
);

create table AccessTokens
(
	Id int auto_increment
		primary key,
	TokenValue varchar(256) not null,
	ExpiresAt timestamp default current_timestamp() not null on update current_timestamp(),
	Scopes text null,
	IdClient int not null,
	IdUser int not null,
	CreatedAt timestamp default '0000-00-00 00:00:00' not null,
	UpdatedAt timestamp default '0000-00-00 00:00:00' not null,
	constraint AccessTokens_Clients_Id_fk
		foreign key (IdClient) references Clients (Id),
	constraint AccessTokens_Users_Id_fk
		foreign key (IdUser) references Users (Id)
);

create table SetPasswordTokens
(
	Id int auto_increment
		primary key,
	IdUser int null,
	Message varchar(2000) null,
	Expires timestamp default current_timestamp() not null on update current_timestamp(),
	CreatedAt timestamp default '0000-00-00 00:00:00' not null,
	UpdatedAt timestamp default '0000-00-00 00:00:00' not null,
	TokenHash varchar(200) not null,
	constraint SetPasswordTokens_Users_Id_fk
		foreign key (IdUser) references Users (Id)
);

INSERT INTO ift_users.Users (Id, Email, Hash, Salt, CreatedAt, UpdatedAt) VALUES (1, 'admin@informaticon.com', '$2b$10$5/zdmxXz0oW7QWZcAZesdOXgasDCnU4vqe2Ure8SMD4WZ6sxOfGFu', '$2b$10$5/zdmxXz0oW7QWZcAZesdO', '2018-11-21 15:55:46', '2018-11-28 14:28:24');
INSERT INTO ift_users.Clients (Id, ClientId, ClientSecret, Name, CreatedAt, UpdatedAt, RedirectUris, Grants) VALUES (1, '47f3ee72b1856716455dd83b32f1031e.users.devops.informaticon.com', '', 'users.devops.informaticon.com', '2018-12-06 12:30:40', '2018-12-06 09:44:13', null, 'password');