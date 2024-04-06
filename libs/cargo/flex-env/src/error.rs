// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::any;

// ---- //
// Type //
// ---- //

type VariableName = &'static str;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error(
	"\n\t[{}]: erreur liée aux variables d'environnement. Raison: {0}",
	any::type_name::<Self>()
)]
pub enum Error
{
	IO(#[from] std::io::Error),
	/// L'analyse de la déclaration de la variable a échouée.
	#[error("La déclaration n'a pas pu être analysée")]
	ParseLineDeclaration,
	/// La variable d'environnement est mal formée.
	#[error("Impossible d'analyser la variable d'environnement « {0} ».")]
	BadFormat(VariableName),
	/// La variable d'environnement est manquante.
	#[error("La variable d'environnement « {0} » est manquante.")]
	NotFound(VariableName),
	/// Erreur interne.
	#[error("Erreur interne: {0}")]
	Internal(String),
}
