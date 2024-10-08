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

use super::JsonRpcRouterBuilder;

// --------- //
// Structure //
// --------- //

pub struct JsonRpcRouter<UserState>
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

impl<S> JsonRpcRouterBuilder for JsonRpcRouter<S>
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

	fn build(self) -> JsonRpcRouter<Self::State>
	{
		self
	}
}
