// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

/// Interface d'application "Extension"
pub trait ApplicationExtensionInterface
{
	/// Applique une extension au serveur.
	fn extension<Ext>(self) -> Self
	where
		Ext: ExtensionInterface<Payload = ()>;

	/// Applique une extension au serveur, en passant des arguments à
	/// l'extension.
	fn extension_with<Ext>(self, payload: impl Into<Ext::Payload>) -> Self
	where
		Ext: ExtensionInterface;
}

/// Extension d'application "Extension" asynchrone.
pub trait AsyncApplicationExtensionInterface
{
	/// Applique une extension au serveur.
	async fn extension<Ext>(self) -> Self
	where
		Ext: AsyncExtensionInterface<Payload = ()>;

	/// Applique une extension au serveur, en passant des arguments à
	/// l'extension.
	async fn extension_with<Ext>(
		self,
		payload: impl Into<Ext::Payload>,
	) -> Self
	where
		Ext: AsyncExtensionInterface;
}

pub trait ExtensionInterface: 'static + Clone + Send + Sync
{
	type Payload;

	fn new(payload: Self::Payload) -> Self;
}

pub trait AsyncExtensionInterface: 'static + Clone + Send + Sync
{
	type Payload;

	async fn new(payload: Self::Payload) -> Self;
}

// -------------- //
// Implémentation //
// -------------- //

impl ExtensionInterface for ()
{
	type Payload = Self;

	fn new(_: Self::Payload) -> Self {}
}

impl AsyncExtensionInterface for ()
{
	type Payload = Self;

	async fn new(_: Self::Payload) -> Self {}
}
