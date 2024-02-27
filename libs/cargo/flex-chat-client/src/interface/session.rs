// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use dashmap::mapref::multiple::RefMutMulti;

use crate::ClientInterface;

// --------- //
// Interface //
// --------- //

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
