// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod application;
mod session;
mod socket;

use core::fmt;

use flex_chat_user::{UserFlagInterface, UserInterface};

pub use self::application::*;
pub use self::session::*;
pub use self::socket::*;

// --------- //
// Interface //
// --------- //

/// Interface Client
pub trait ClientInterface: fmt::Debug
{
	#[rustfmt::skip]
	/// Type représentant l'ID d'un client.
	type ClientID
		: serde::Serialize
		+ fmt::Debug
		+ fmt::Display
		+ ToString
		+ Clone
		;

	/// Type représentant l'ID de la socket du client.
	type SocketID: fmt::Debug;

	/// Type représentant l'utilisateur d'un client.
	type User: UserInterface;

	/// Les salons d'un client.
	fn channels(&self) -> &std::collections::HashSet<String>;

	/// ID du client courant.
	fn cid(&self) -> &Self::ClientID;

	/// Met en état de déconnexion le client.
	fn disconnect(&mut self);

	/// Est-ce que le client a comme salon, un salon donné, dans sa liste des
	/// salons rejoint.
	fn has_channel(&self, channel_name: &str) -> bool;

	/// Est-ce que le client est connecté du serveur de Chat?
	fn is_connected(&self) -> bool;

	/// Est-ce que le client est déconnecté du serveur de Chat?
	fn is_disconnected(&self) -> bool
	{
		!self.is_connected()
	}

	/// Est-ce que le client est enregistré sur le serveur de Chat?
	fn is_registered(&self) -> bool;

	/// Marque le client comme étant un opérateur.
	fn marks_client_as_operator<F>(
		&mut self,
		oper_type: impl Into<<Self::User as UserFlagInterface>::Flag>,
		oper_flags: impl IntoIterator<Item = F>,
	) where
		F: Into<<Self::User as UserFlagInterface>::Flag>;

	/// Marque le client comme étant absent.
	fn marks_user_as_away(&mut self, text: impl ToString);

	/// Marque le client comme n'étant plus absent.
	fn marks_user_as_no_longer_away(&mut self);

	/// Chambre privé de l'utilisateur.
	fn private_room(&self) -> String
	{
		format!("private:{}", self.user().nickname().to_lowercase())
	}

	/// Attribution d'un nouvel ID de Socket.
	fn reconnect_with_new_sid(&mut self, sid: socketioxide::socket::Sid);

	/// Attribution d'un nouvel ID au client.
	fn set_cid(&mut self, cid: Self::ClientID);

	/// Attribution d'un nouvel ID de Socket.
	fn set_sid(&mut self, sid: socketioxide::socket::Sid);

	/// Définit le client comme étant connecté.
	fn set_connected(&mut self);

	/// Définit un hôte virtuel pour l'utilisateur.
	fn set_vhost(&mut self, vhost: impl ToString);

	/// Définit le client comme étant enregistré.
	fn set_registered(&mut self);

	/// ID de la socket courante du client courant.
	fn maybe_sid(&self) -> Option<&Self::SocketID>;

	/// ID de la socket courante du client courant.
	fn sid(&self) -> &Self::SocketID;

	/// Jeton de connexion.
	fn token(&self) -> &str;

	/// Définit un nouveau jeton de connexion.
	fn new_token(&mut self);

	/// Utilisateur du client.
	fn user(&self) -> &Self::User;

	/// Utilisateur du client (version mutable).
	fn user_mut(&mut self) -> &mut Self::User;
}
