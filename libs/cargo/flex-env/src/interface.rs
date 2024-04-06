// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt::Debug;
use std::path;

// --------- //
// Interface //
// --------- //

pub trait EnvInterface
	: Sized
	+ Debug
	+ Clone
	+ Send 
	+ Sync
	+ serde::de::DeserializeOwned
{
	type Settings;

	// NOTE(phisyx): ici typiquement pouvoir définir la fonction en "MaybeAsync"
	//               aurait été vraiment sympa. Par exemple dans le cas où l'on
	//               voudrait récupérer les variables d'environnement depuis un
	//               serveur distant, et non pas depuis les fichiers systèmes.
	//
	// https://blog.rust-lang.org/inside-rust/2022/07/27/keyword-generics.html
	//                              Result<Self, impl std::error::Error>
	fn setup(_: &Self::Settings) -> Result<Self, super::Error>;

	/// Récupère les variables d'environnement à partir du contenu d'un fichier
	/// et retourne une structure avec les données du contenu du fichier en
	/// guise de valeurs pour chaque champ.
	fn from_file(path: impl AsRef<path::Path>) -> Result<Self, super::Error>
	{
		super::from_file(path)
	}
}
