// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::{AsyncExtensionInterface, AxumApplication, ExtensionInterface};

// --------- //
// Interface //
// --------- //

/// Extension d'application "Extension"
pub trait ApplicationExtExtension
	: Sized
{
	/// Applique une extension au serveur.
	fn extension<Ext>(self) -> Self where Ext: ExtensionInterface<Payload = ()>;

	/// Applique une extension au serveur, en passant des arguments à
	/// l'extension.
	fn extension_with<Ext>(self, payload: impl Into<Ext::Payload>) -> Self where Ext: ExtensionInterface;
}

/// Extension d'application "Extension" asynchrone.
pub trait AsyncApplicationExtExtension
	: Sized
{
	/// Applique une extension au serveur.
	async fn extension<Ext>(self) -> Self where Ext: AsyncExtensionInterface<Payload = ()>;

	/// Applique une extension au serveur, en passant des arguments à
	/// l'extension.
	async fn extension_with<Ext>(self, payload: impl Into<Ext::Payload>) -> Self where Ext: AsyncExtensionInterface;
}

// -------------- //
// Implémentation //
// -------------- //

impl<S, E, C> ApplicationExtExtension for AxumApplication<S, E, C>
{
	fn extension<Ext>(self) -> Self where Ext: ExtensionInterface<Payload = ()>,
	{
		ApplicationExtExtension::extension_with::<Ext>(self, ())
	}

	fn extension_with<Ext>(mut self, payload: impl Into<Ext::Payload>) -> Self where Ext: ExtensionInterface,
	{
		let payload = payload.into();
		let instance = Ext::new(payload);
		self.application_adapter.router.global = self.application_adapter.router.global.layer(
			axum::Extension(instance)
		);
		self
	}
}

impl<S, E, C> AsyncApplicationExtExtension for AxumApplication<S, E, C>
{
	async fn extension<Ext>(self) -> Self where Ext: AsyncExtensionInterface<Payload = ()>,
	{
		AsyncApplicationExtExtension::extension_with::<Ext>(self, ()).await
	}

	async fn extension_with<Ext>(mut self, payload: impl Into<Ext::Payload>) -> Self where Ext: AsyncExtensionInterface,
	{
		let payload = payload.into();
		let instance = Ext::new(payload).await;
		self.application_adapter.router.global = self.application_adapter.router.global.layer(
			axum::Extension(instance)
		);
		self
	}
}
