-- HotSpots Campaigner Database Schema (test copy)
-- Minimal copy of schema.sql to initialize H2 for tests

create table app_users (
   id           varchar(36) not null primary key,
   external_id  varchar(64) not null unique,
   display_name varchar(255),
   email        varchar(255),
   role         varchar(50)
);

create table campaigns (
   id                  varchar(36) not null primary key,
   name                varchar(255),
   manager_id          varchar(36) not null,
   status              varchar(50),
   system_name         varchar(255),
   description         text,
   track_count         int,
   length_in_months    int,
   pay_rate            double,
   pay_step            int,
   salvage_terms       varchar(255),
   salvage_step        int,
   support_terms       varchar(255),
   support_step        int,
   transportation_cost int default 300,
   monthly_pay         int default 500,
   monthly_maintenance int default 500,
   constraint fk_campaign_manager foreign key ( manager_id )
      references app_users ( id )
);

create table campaign_factions (
   id                varchar(36) not null primary key,
   campaign_id       varchar(36) not null,
   faction_name      varchar(255),
   offers_contracts  boolean,
   short_description varchar(1000),
   constraint fk_faction_campaign foreign key ( campaign_id )
      references campaigns ( id )
         on delete cascade
);

create table campaign_invites (
   id             varchar(36) not null primary key,
   campaign_id    varchar(36) not null,
   token          varchar(64) not null unique,
   recipient_name varchar(255),
   expires_at     datetime,
   used           boolean default false,
   constraint fk_invite_campaign foreign key ( campaign_id )
      references campaigns ( id )
         on delete cascade
);

create table campaign_tracks (
   id                       varchar(36) not null primary key,
   campaign_id              varchar(36) not null,
   track_name               varchar(255),
   sequence_order           int,
   location                 varchar(255),
   next_session             datetime,
   attacker_faction_id      varchar(36),
   month_index              int,
   complications            varchar(1000),
   opposition_complications varchar(1000),
   after_action_narrative   text,
   constraint fk_track_campaign foreign key ( campaign_id )
      references campaigns ( id )
         on delete cascade,
   constraint fk_track_attacker foreign key ( attacker_faction_id )
      references campaign_factions ( id )
         on delete set null
);

create table contracts (
   id                  varchar(36) not null primary key,
   campaign_id         varchar(36) not null,
   employer_faction_id varchar(36),
   primary_contract    boolean,
   mission_type        varchar(255),
   pay_rate            double,
   pay_step            int,
   constraint fk_contract_campaign foreign key ( campaign_id )
      references campaigns ( id )
         on delete cascade,
   constraint fk_contract_faction foreign key ( employer_faction_id )
      references campaign_factions ( id )
         on delete cascade
);

create table mercenary_commands (
   id                   varchar(36) not null primary key,
   name                 varchar(255),
   owner_id             varchar(36) not null,
   total_support_points int default 0,
   reputation           int default 1,
   commanding_officer   varchar(255),
   constraint fk_command_owner foreign key ( owner_id )
      references app_users ( id )
);

create table detachments (
   id                   varchar(36) not null primary key,
   mercenary_command_id varchar(36) not null,
   campaign_id          varchar(36),
   name                 varchar(255),
   callsign             varchar(255),
   constraint fk_detachment_command foreign key ( mercenary_command_id )
      references mercenary_commands ( id )
         on delete cascade,
   constraint fk_detachment_campaign foreign key ( campaign_id )
      references campaigns ( id )
         on delete cascade
);

create table detachment_contract_assignments (
   id            varchar(36) not null primary key,
   detachment_id varchar(36) not null,
   contract_id   varchar(36) not null,
   month_index   int not null,
   constraint fk_assign_detachment foreign key ( detachment_id )
      references detachments ( id )
         on delete cascade,
   constraint fk_assign_contract foreign key ( contract_id )
      references contracts ( id )
         on delete cascade
);

create table ledger_entries (
   id                varchar(36) not null primary key,
   command_id        varchar(36) not null,
   detachment_id     varchar(36),
   amount            int,
   short_description varchar(1000),
   timestamp         datetime,
   reputation_change int,
   campaign_name     varchar(255),
   month_index       int,
   constraint fk_ledger_command foreign key ( command_id )
      references mercenary_commands ( id )
         on delete cascade
);

create table combat_units (
   id            varchar(36) not null primary key,
   command_id    varchar(36) not null,
   detachment_id varchar(36),
   model         varchar(255),
   type          varchar(255),
   variant       varchar(255),
   tech_base     varchar(100),
   tonnage       int,
   bv            int,
   pv            int,
   status        varchar(255),
   constraint fk_combat_unit_command foreign key ( command_id )
      references mercenary_commands ( id )
         on delete cascade
);

create table pilots (
   id            varchar(36) not null primary key,
   command_id    varchar(36) not null,
   detachment_id varchar(36),
   name          varchar(255),
   gunnery       int,
   piloting      int,
   unit_type     varchar(50)
);

create table faction_reputations (
   id                   varchar(36) not null primary key,
   campaign_faction_id  varchar(36) not null,
   mercenary_command_id varchar(36) not null,
   score                int,
   standing             varchar(255),
   constraint fk_reputation_faction foreign key ( campaign_faction_id )
      references campaign_factions ( id )
         on delete cascade,
   constraint fk_reputation_command foreign key ( mercenary_command_id )
      references mercenary_commands ( id )
         on delete cascade
);