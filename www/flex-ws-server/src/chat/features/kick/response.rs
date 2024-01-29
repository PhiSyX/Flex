// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::Origin;
use crate::{command_response, error_replies};

command_response! {
	struct KICK
	{
		/// Le salon que le client DOIT quitter, car victime d'un KICK.
		channel: &'a str,
		/// Raison du kick.
		reason: Option<&'a str>,
		/// La victime.
		knick: &'a Origin,
	}
}

error_replies! {
	/// Renvoyé pour indiquer l'échec d'une tentative de sanction KICK sur un
	/// utilisateur (opérateur global) ayant le drapeau utilisateur +q.
	| 480 <-> ERR_CANNOTKICKGLOBOPS { channel: str, nick: str }
		=> "{channel} {nick} :Vous n'avez pas le droit de sanctionner d'un KICK cet utilisateur (protégé par le drapeau +q)"
}
