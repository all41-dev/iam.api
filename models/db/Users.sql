create table ift_users.Users
(
  Id        int auto_increment
    primary key,
  Email     varchar(200) not null,
  Hash      char(128)    not null,
  Salt      char(128)    not null,
  CreatedAt datetime     null,
  UpdatedAt datetime     null,
  constraint Users_Email_uindex
  unique (Email)
);


