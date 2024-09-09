// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use console::style;

use crate::settings::Config;
use crate::{AxumRouter, AxumState, RouterInterface};

// ----- //
// Macro //
// ----- //

macro_rules! impl_ws_handler_interface {
	(
		impl WebSocketHandlersInterface for
			$( | ( $( $generic:ident ),* ) )*
			where
				Self(..): WebSocketHandler,
		{
		}
	) => {$(
		impl< $($generic),* > WebSocketHandlersInterface for ( $($generic),* )
		where
			$( $generic : 'static + WebSocketHandler ),*
		{
			fn listen(socket: &socketioxide::extract::SocketRef)
			{
				$(
					log::info!(
						"Application de la feature websocket « {} »",
						style($generic::EVENT_NAME).yellow(),
					);
					socket.on($generic::EVENT_NAME, $generic::handle);
				)*
			}
		}
	)*};

	(
		impl WebSocketHandlers2Interface for
			$( | ( $( $generic:ident ),* ) )*
			where
				Self(..): WebSocketHandler2,
		{
		}
	) => {$(
		impl< $($generic),* > WebSocketHandlers2Interface for ( $($generic),* )
		where
			$( $generic : 'static + WebSocketHandler2 ),*
		{
			fn listen(socket: &socketioxide::extract::SocketRef)
			{
				$(
					log::info!(
						"Application de la feature websocket « +{} / -{} »",
						style($generic::SET_EVENT_NAME).yellow(),
						style($generic::UNSET_EVENT_NAME).yellow(),
					);
					socket.on($generic::SET_EVENT_NAME, $generic::handle_set);
					socket.on($generic::UNSET_EVENT_NAME, $generic::handle_unset);
				)*
			}
		}
	)*};
}

// --------- //
// Interface //
// --------- //

/// Interface d'application Feature
pub trait ApplicationFeatureInterface<UserState>
{
	/// Applique une feature au serveur.
	fn feature<F>(self) -> Self
	where
		F: Feature<State = UserState>;

	/// Applique une feature WebSocket au serveur.
	fn feature_ws<F>(self) -> Self
	where
		F: WebSocketFeature<UserState>;
}

/// Interface d'application Feature dans un contexte asynchrone.
pub trait AsyncApplicationFeatureInterface<UserState>
{
	/// Applique une feature asynchrone au serveur.
	async fn feature<F>(self) -> Self
	where
		F: AsyncFeature<State = UserState>;

	/// Applique une feature WebSocket asynchrone au serveur.
	async fn feature_ws<F>(self) -> Self
	where
		F: WebSocketAsyncFeature<UserState>;
}

// --------- //
// Interface //
// --------- //

pub trait Feature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface<Self::State>;

	/// L'état de l'application.
	type State;

	/// Le nom de la feature.
	const NAME: &'static str;

	fn register_services(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_extensions(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_layers(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_middlewares(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}
}

pub trait AsyncFeature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface<Self::State>;

	/// L'état de l'application.
	type State;

	/// Le nom de la feature.
	const NAME: &'static str;

	async fn register_services(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_extensions(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_layers(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_middlewares(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}
}

pub trait WebSocketFeature<UserState>: Feature<State = UserState>
{
	type Auth: 'static + Send + Sync + serde::de::DeserializeOwned;

	type Handlers: 'static + Send + Sync + WebSocketHandlersInterface;
	type Handlers2: 'static + Send + Sync + WebSocketHandlers2Interface;

	/// L'état de la feature WebSocket.
	type State: 'static + Send + Sync + Default;

	/// Point d'entrée racine de la WebSocket.
	const ENDPOINT: &'static str;

	fn on_connect(
		socket: socketioxide::extract::SocketRef,
		server_state: socketioxide::extract::State<AxumState<UserState>>,
		user_state: socketioxide::extract::State<
			<Self as WebSocketFeature<UserState>>::State,
		>,
		auth_data: socketioxide::extract::TryData<Self::Auth>,
	);
}

pub trait WebSocketAsyncFeature<UserState>:
	AsyncFeature<State = UserState>
{
	#[rustfmt::skip]
	type Auth
		: 'static
		+ Send + Sync
		+ serde::de::DeserializeOwned
		;

	/// L'état de la feature WebSocket.
	#[rustfmt::skip]
	type State
		: 'static
		+ Send + Sync
		+ Default
		;

	/// Point d'entrée racine de la WebSocket.
	const ENDPOINT: &'static str;

	fn on_connect(
		socket: socketioxide::extract::SocketRef,
		server_state: socketioxide::extract::State<AxumState<UserState>>,
		user_state: socketioxide::extract::State<
			<Self as WebSocketAsyncFeature<UserState>>::State,
		>,
		auth_data: socketioxide::extract::TryData<Self::Auth>,
	);
}

pub trait FeatureConfig:
	'static + Send + Sync + Clone + std::fmt::Debug + serde::de::DeserializeOwned
{
	/// Nom du fichier de configuration de la feature à dé-sérialiser.
	///
	/// Le fichier DOIT se trouver dans le répertoire de configuration de
	/// l'application.
	const FILENAME: &'static str;
}

pub trait WebSocketHandlersInterface
{
	fn listen(socket: &socketioxide::extract::SocketRef);
}

pub trait WebSocketHandlers2Interface
{
	fn listen(socket: &socketioxide::extract::SocketRef);
}

pub trait WebSocketHandler
{
	type App: 'static + Send + Sync;
	type Data: 'static + Send + Sync + serde::de::DeserializeOwned;

	const EVENT_NAME: &'static str;

	fn handle(
		socket: socketioxide::extract::SocketRef,
		state: socketioxide::extract::State<Self::App>,
		data: socketioxide::extract::Data<Self::Data>,
	);
}

pub trait WebSocketHandler2
{
	type App: 'static + Send + Sync;

	type SetData: 'static + Send + Sync + serde::de::DeserializeOwned;
	type UnsetData: 'static + Send + Sync + serde::de::DeserializeOwned;

	const SET_EVENT_NAME: &'static str;
	const UNSET_EVENT_NAME: &'static str;

	fn handle_set(
		socket: socketioxide::extract::SocketRef,
		state: socketioxide::extract::State<Self::App>,
		data: socketioxide::extract::Data<Self::SetData>,
	);

	fn handle_unset(
		socket: socketioxide::extract::SocketRef,
		state: socketioxide::extract::State<Self::App>,
		data: socketioxide::extract::Data<Self::UnsetData>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FeatureConfig for ()
{
	const FILENAME: &'static str = "empty";
}

impl<U> FeatureConfig for Config<U>
where
	U: FeatureConfig,
{
	const FILENAME: &'static str = U::FILENAME;
}

impl_ws_handler_interface! {
	impl WebSocketHandlersInterface for
		| (A, B)
		| (A, B, C)
		| (A, B, C, D)
		| (A, B, C, D, E)
		| (A, B, C, D, E, F)
		| (A, B, C, D, E, F, G)
		| (A, B, C, D, E, F, G, H)
		| (A, B, C, D, E, F, G, H, I)
		| (A, B, C, D, E, F, G, H, I, J)
		| (A, B, C, D, E, F, G, H, I, J, K)
		| (A, B, C, D, E, F, G, H, I, J, K, L)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z)
	where
		Self(..): WebSocketHandler,
	{
	}
}

impl_ws_handler_interface! {
	impl WebSocketHandlers2Interface for
		| (A, B)
		| (A, B, C)
		| (A, B, C, D)
		| (A, B, C, D, E)
		| (A, B, C, D, E, F)
		| (A, B, C, D, E, F, G)
		| (A, B, C, D, E, F, G, H)
		| (A, B, C, D, E, F, G, H, I)
		| (A, B, C, D, E, F, G, H, I, J)
		| (A, B, C, D, E, F, G, H, I, J, K)
		| (A, B, C, D, E, F, G, H, I, J, K, L)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y)
		| (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z)
	where
		Self(..): WebSocketHandler2,
	{
	}
}
