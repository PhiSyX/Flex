// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use core::fmt;

use dashmap::mapref::multiple::RefMutMulti;
use flex_chat_user::{UserFlagInterface, UserInterface};
use socketioxide::operators::RoomParam;
use tracing::instrument;

// --------- //
// Interface //
// --------- //

/// Interface Client
pub trait ClientInterface: fmt::Debug
{
	/// Type représentant l'ID d'un client.
	type ClientID: serde::Serialize + fmt::Debug + fmt::Display + ToString + Clone;

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

	/// Attribution d'un nouvel ID de Socket.
	fn set_sid(&mut self, sid: socketioxide::socket::Sid);

	/// Définit le client comme étant connecté.
	fn set_connected(&mut self);

	/// Définit un hôte virtuel pour l'utilisateur.
	fn set_vhost(&mut self, vhost: impl ToString);

	/// Définit le client comme étant enregistré.
	fn set_registered(&mut self);

	/// ID de la socket courante du client courant.
	fn sid(&self) -> &Self::SocketID;

	/// Jeton de connexion.
	fn token(&self) -> &str;

	/// Utilisateur du client.
	fn user(&self) -> &Self::User;

	/// Utilisateur du client (version mutable).
	fn user_mut(&mut self) -> &mut Self::User;
}

/// Interface Client + Socket
pub trait ClientSocketInterface
{
	type Client: ClientInterface;
	type Socket; // TODO: Crée une interface socketioxide::extract::SocketRef

	/// Le client courant de la socket courante.
	fn client(&self) -> &Self::Client;

	/// Le client courant de la socket courante (version mutable).
	fn client_mut(&mut self) -> &mut Self::Client;

	/// Déconnecte la socket.
	fn disconnect(self);

	#[instrument(name = "ClientSocketInterface::broadcast", skip(self))]
	fn broadcast<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().broadcast().emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit", skip(self))]
	fn emit<E, S>(&self, event: E, data: S)
	where
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit_to", skip(self))]
	fn emit_to<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: RoomParam + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().to(to).emit(event.to_string(), data);
	}

	#[instrument(name = "ClientSocketInterface::emit_within", skip(self))]
	fn emit_within<T, E, S>(&self, to: T, event: E, data: S)
	where
		T: RoomParam + std::fmt::Debug,
		E: ToString + std::fmt::Display + std::fmt::Debug,
		S: serde::Serialize + std::fmt::Debug,
	{
		tracing::debug!(
			cid = ?self.client().cid(),
			sid = ?self.client().sid(),
			"Emission des données au client de la socket courante"
		);
		_ = self.socket().within(to).emit(event.to_string(), data);
	}

	/// Socket courante.
	fn socket(&self) -> &socketioxide::extract::SocketRef;

	/// ID du client courant.
	fn cid(&self) -> &<Self::Client as ClientInterface>::ClientID
	{
		self.client().cid()
	}

	/// ID du socket courant.
	fn sid(&self) -> &<Self::Client as ClientInterface>::SocketID
	{
		self.client().sid()
	}

	/// Utilisateur courant.
	fn user(&self) -> &<Self::Client as ClientInterface>::User;

	/// Utilisateur courant (version mutable).
	fn user_mut(&mut self) -> &mut <Self::Client as ClientInterface>::User;

	// TODO: à déplacer.
	/// La chambre des ignorés/bloqués du client courant.
	fn useless_people_room(&self) -> String
	{
		format!("{}/ignore", self.client().cid())
	}
}

/// Interface de l'application pour la gestion des clients
pub trait ClientServerApplicationInterface
{
	type ClientSocket<'cs>: ClientSocketInterface
	where
		Self: 'cs;

	/// Récupère un client à partir de son ID.
	fn get_client_by_id(
		&self,
		client_id: &<<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
	) -> Option<<Self::ClientSocket<'_> as ClientSocketInterface>::Client>;
}

pub trait ClientsSessionInterface
{
	// Type représentant un client.
	type Client: ClientInterface;

	/// Cherche un client en fonction de son ID.
	fn get(&self, client_id: &<Self::Client as ClientInterface>::ClientID) -> Option<Self::Client>;

	/// Cherche un client en fonction de son ID.
	fn get_mut(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
	) -> Option<RefMutMulti<'_, <Self::Client as ClientInterface>::ClientID, Self::Client>>;

	/// Enregistre un client.
	fn register(&self, client: &Self::Client);
	/// Mise à niveau d'un client.
	fn upgrade(&self, client: &Self::Client);
}

pub trait ClientsChannelSessionInterface
{
	// Type représentant un client.
	type Client: ClientInterface;

	/// Ajoute un salon pour une session d'un client
	fn add_channel_on_client(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		channel_id: &str,
	);

	/// Supprime un salon pour une session d'un client.
	fn remove_channel_on_client(
		&self,
		client_id: &<Self::Client as ClientInterface>::ClientID,
		channel_id: &str,
	);
}
