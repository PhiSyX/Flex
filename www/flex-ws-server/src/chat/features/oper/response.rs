// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::user;
use crate::{error_replies, reserved_numerics};

reserved_numerics! {
	/// RPL_YOUREOPER est renvoyé à un client qui vient d'émettre avec succès un
	/// message OPER et d'obtenir le statut d'opérateur.
	| 381 <-> RPL_YOUREOPER { oper_type: user::Flag }
		=> ":Vous êtes maintenant un OPÉRATEUR"
}

error_replies! {
	/// Renvoyé pour indiquer l'échec d'une tentative d'enregistrement d'une
	/// connexion pour laquelle un mot de passe était requis et n'a pas été
	/// fourni ou était incorrect.
	| 464 <-> ERR_PASSWDMISMATCH
		=> ":Mot de passe incorrect"

	/// Si un client envoie un message OPER et que le serveur n'a pas été
	/// configuré pour autoriser les connexions à partir de l'hôte du client en
	/// tant qu'opérateur, cette erreur DOIT être renvoyée.
	| 491 <-> ERR_NOOPERHOST
		=> ":Pas de O-lines pour votre hôte"

	/// Renvoyé pour indiquer à l'utilisateur que le salon qui tente de joindre
	/// est réservé aux opérateurs globaux et locaux du serveur uniquement.
	| 520 <-> ERR_OPERONLY { channel: str }
		=> ":Vous ne pouvez pas rejoindre le salon {channel} (OPÉRATEUR uniquement)"
}