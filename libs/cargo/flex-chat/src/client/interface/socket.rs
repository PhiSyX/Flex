// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use tracing::instrument;

use crate::client::ClientInterface;

// --------- //
// Interface //
// --------- //

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
		T: socketioxide::operators::RoomParam + std::fmt::Debug,
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
		T: socketioxide::operators::RoomParam + std::fmt::Debug,
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

	/// Définit un nouvel ID au client courant.
	fn set_cid(&mut self, cid: <Self::Client as ClientInterface>::ClientID)
	{
		self.client_mut().set_cid(cid)
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
