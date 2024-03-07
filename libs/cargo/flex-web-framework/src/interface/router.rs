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
			   fn routes() -> $crate::routing::RouterCollection<UserState>
			   {
					   let mut router_collection = Self::collection();
					   $( router_collection.extends( $generic::routes() ); )*
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

	/// Alias vers la collection.
	fn routes() -> RouterCollection<S>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

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
