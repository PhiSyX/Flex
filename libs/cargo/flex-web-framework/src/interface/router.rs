// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::routing::RouterCollection;
use crate::AxumState;

// ----- //
// Macro //
// ----- //

macro_rules! impl_router_interface {
	(
		impl RouterInterface for
			$( | ( $( $generic:ident ),* ) )*
			where
				Self(..): RouterInterface,
		{
			fn routes() -> RouterCollection
			{
				let mut router_collection = Self::collection();
				for type GENERIC in Self(..) {
					router_collection.extends(GENERIC::routes());
				}
				router_collection
			}
		}
	) => {$(

		impl<UserState, $($generic),* > RouterInterface<UserState> for ( $($generic),* )
		where
			   $( $generic : RouterInterface<UserState> ),*
		{
			   fn routes(s: &$crate::AxumState<UserState>) -> $crate::routing::RouterCollection<UserState>
			   {
					   let mut router_collection = Self::collection();
					   $( router_collection.extends( $generic::routes(s) ); )*
					   router_collection
			   }
		}

	)*};
}

// --------- //
// Interface //
// --------- //

pub trait RouterInterface<S>
{
	/// Collection de routeurs.
	fn collection() -> RouterCollection<S>
	{
		RouterCollection::<S>::default()
	}

	/// Collection de routeurs groupés.
	fn group() -> RouterCollection<S>
	where
		Self: RouterGroupInterface,
	{
		RouterCollection::<S>::default().with_group(Self::GROUP)
	}

	/// Alias vers la collection.
	fn routes(state: &AxumState<S>) -> RouterCollection<S>;
}

pub trait RouterGroupInterface
{
	const GROUP: &'static str;
}

pub trait RouteIDInterface
{
	/// Chemin d'une route préfixé du groupe.
	fn fullpath(&self) -> impl ToString;

	/// Chemin d'une route.
	fn path(&self) -> impl ToString;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> RouterInterface<S> for ()
{
	fn routes(_: &AxumState<S>) -> RouterCollection<S>
	{
		Self::collection()
	}
}

impl_router_interface! {
	impl RouterInterface for
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
		Self(..): RouterInterface,
	{
		fn routes() -> RouterCollection
		{
			let mut router_collection = Self::collection();
			for type GENERIC in Self(..) {
				router_collection.extends(GENERIC::routes());
			}
			router_collection
		}
	}
}
