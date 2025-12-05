create table users (
  id serial primary key,
  email varchar(255) unique not null,
  password varchar(255) not null,
  role varchar(32) not null default 'USER'
);

create table job_applications (
  id serial primary key,
  owner_id int not null references users(id) on delete cascade,
  company varchar(255) not null,
  position varchar(255) not null,
  status varchar(32) not null default 'APPLIED',
  applied_date date,
  next_action_date date,
  notes text,
  job_link text
);

create table reminders (
  id serial primary key,
  owner_id int not null references users(id) on delete cascade,
  application_id int not null references job_applications(id) on delete cascade,
  remind_at timestamp,
  message text,
  sent boolean default false
);
