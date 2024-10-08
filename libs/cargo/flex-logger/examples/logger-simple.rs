// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_logger::{Logger, LoggerBuilder, LoggerStdoutBuilderExtension};

fn main()
{
	/*
	use flex_logger::{LoggerInitiator, LoggerStdoutBuilder};

	// NOTE: Aucun paramètres n'est appliqués par défaut, sauf le format des logs.
	let logger_builder = LoggerStdoutBuilder::default()
		.with_level(log::LevelFilter::Debug)
		.with_color(true)
		.with_timestamp(true)
	;

	LoggerInitiator::stdout(logger_builder).expect("L'initialisation du logger (stdout)");
	*/

	// NOTE: Les fonctions de l'implémentation de `Logger` PEUVENT appliquer des
	// paramètres par défaut au builder. Ici, la fonction `stdout()`, applique
	// les paramètres suivants: `.with_colorized(true)` et
	// `.with_timestamp(true)`.
	//
	// NOTE: ces paramètres PEUVENT être désactivés explicitement ci-dessous.
	let logger = Logger::stdout();

	// logger.with_...
	#[cfg(not(feature = "tracing"))]
	let logger = logger.with_level(log::LevelFilter::Debug);
	#[cfg(feature = "tracing")]
	let logger = logger.with_level(tracing::level_filters::LevelFilter::DEBUG);

	// NOTE: L'extension `LoggerStdoutBuilderExtension` ajoute la fonction
	// `.initialize()` qui elle va s'occuper d'initialiser le logger.
	// NOTE: Cette fonction PEUT paniquer en cas d'erreur.
	logger.initialize();

	log::info!("Hello World");
}
