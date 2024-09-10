// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use rpc_router::RpcHandlerWrapperTrait;

use super::RpcRouterBuilder;

// --------- //
// Structure //
// --------- //

pub struct RpcRouter<UserState>
{
	/// Nom de la route.
	pub name: String,
	// Action associé au nom.
	pub action: Box<dyn RpcHandlerWrapperTrait>,
	_marker: std::marker::PhantomData<UserState>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> RpcRouterBuilder for RpcRouter<S>
where
	S: Clone + Send + Sync + 'static,
{
	type State = S;

	fn name(
		name: impl ToString,
		action: Box<dyn RpcHandlerWrapperTrait>,
	) -> Self
	{
		Self {
			name: name.to_string(),
			action,
			_marker: Default::default(),
		}
	}

	fn build(self) -> RpcRouter<Self::State>
	{
		self
	}
}
