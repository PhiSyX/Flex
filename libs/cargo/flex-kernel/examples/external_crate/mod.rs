/*
 * Any copyright is dedicated to the Public Domain.
 * https://creativecommons.org/publicdomain/zero/1.0/
 */

use flex_kernel::{
	ApplicationAdapterInterface,
	ApplicationStartupExtension,
	AsyncApplicationStartupExtension,
};

pub struct AnyApplicationAdapter<E = (), C = ()>
{
	#[allow(dead_code)]
	pub env: Option<E>,
	#[allow(dead_code)]
	pub cli: Option<C>,
}

impl<E, C> ApplicationAdapterInterface for AnyApplicationAdapter<E, C>
{
	type Settings = ();

	fn new(_: Self::Settings) -> Self
	{
		Self {
			env: None,
			cli: None,
		}
	}
}

impl<E, C> ApplicationStartupExtension for AnyApplicationAdapter<E, C>
{
	fn run(self)
	{
		println!("Sync AnyApplicationAdapter");
	}
}

impl<E, C> AsyncApplicationStartupExtension for AnyApplicationAdapter<E, C>
{
	async fn run(self)
	{
		println!("Async AnyApplicationAdapter");
	}
}
