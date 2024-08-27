CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" users_role DEFAULT 'user',
    "avatar" varchar(255) NULL,
    "avatar_display_for" users_avatar_display_for DEFAULT 'member_only',
    "firstname" varchar(30) NULL,
    "lastname" varchar(30) NULL,
    "gender" varchar(30) NULL,
    "birthday" date NULL,
    "country" varchar(255) NULL,
    "city" varchar(255) NULL,
    "account_status" users_account_status DEFAULT 'secret',
    "created_at" timestamptz DEFAULT NOW(),
    "updated_at" timestamptz DEFAULT NOW()
);
