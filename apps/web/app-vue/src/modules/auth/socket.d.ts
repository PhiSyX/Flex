// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

declare interface AuthIdentifyFormData {
	identifier: string;
	password: string;
	remember_me?: boolean;
}

declare interface AuthIdentifyHttpResponse {
	id: UUID;
	name: string;
	email: string;
	role: {
		User: "User";
		Moderator: "Moderator";
		Admin: "Admin";
	};
}

declare interface AuthRegisterFormData {
	username: string;
	email_address: string;
	password: string;
	password_confirmation: string;
}

declare interface AuthRegisterHttpResponse {
	code: string;
	message: string;
	id: UUID;
}

declare interface Commands {
	"AUTH IDENTIFY": AuthIdentifyHttpResponse;
}

declare interface CommandResponsesFromServer {
	UPGRADE_USER: {
		old_client_id: UserID;
		new_client_id: UserID;
		old_nickname: string;
		new_nickname: string;
	};
}
