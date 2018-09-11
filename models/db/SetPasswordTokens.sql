create table ift_users.SetPasswordTokens
(
  Id        int auto_increment
    primary key,
  IdUser    int                                     null,
  Message   varchar(2000)                           null,
  Expires   timestamp default current_timestamp()   not null
  on update current_timestamp(),
  CreatedAt timestamp default '0000-00-00 00:00:00' not null,
  UpdatedAt timestamp default '0000-00-00 00:00:00' not null,
  constraint SetPasswordTokens_Users_Id_fk
  foreign key (IdUser) references ift_users.Users (Id)
);


