// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use console::style;
use tokio::sync::mpsc;

// ---- //
// Type //
// ---- //

pub(crate) type LoggerReaderHandle = (
	/* warning */ tokio::task::JoinHandle<()>,
	/* error */ tokio::task::JoinHandle<()>,
);

// --------- //
// Structure //
// --------- //

pub struct LoggerSignal(pub LoggerReaderHandle, LoggerWriter);

pub(crate) struct LoggerReader
{
	/// Nom de l'application.
	pub(crate) name: String,
	/// Version de l'application.
	pub(crate) version: String,
	/// Gestion des erreurs.
	pub(crate) error: mpsc::UnboundedReceiver<String>,
	/// Gestion des warnings.
	pub(crate) warning: mpsc::UnboundedReceiver<String>,
}

pub(crate) struct LoggerWriter
{
	/// Gestion des erreurs.
	pub(crate) error: mpsc::UnboundedSender<String>,
	/// Gestion des warnings.
	pub(crate) warning: mpsc::UnboundedSender<String>,
}

// -------------- //
// Implémentation //
// -------------- //

impl LoggerSignal
{
	/// Crée le signal.
	pub fn create(
		application_name: impl ToString,
		application_version: impl ToString,
	) -> Self
	{
		let (sender_error, recv_error) = mpsc::unbounded_channel();
		let (sender_warning, recv_warning) = mpsc::unbounded_channel();

		let lrx = LoggerReader {
			name: application_name.to_string(),
			version: application_version.to_string(),
			error: recv_error,
			warning: recv_warning,
		};
		let lrx = lrx.spawn();
		let ltx = LoggerWriter {
			error: sender_error,
			warning: sender_warning,
		};

		Self(lrx, ltx)
	}

	/// Stop le signal.
	pub(crate) fn terminated(&self)
	{
		self.send_error("terminated");
		self.send_warning("terminated");
	}

	/// Émet une erreur critique (cela quitte le programme après l'émission).
	pub fn send_critical(&self, msg: impl ToString) -> !
	{
		self.1
			.error
			.send(msg.to_string())
			.expect("Impossible de logger l'erreur");
		std::thread::sleep(std::time::Duration::from_millis(16));
		self.terminated();
		std::process::exit(1)
	}

	/// Émet une erreur.
	pub fn send_error(&self, msg: impl ToString)
	{
		self.1
			.error
			.send(msg.to_string())
			.expect("Impossible de logger l'erreur");
		std::thread::sleep(std::time::Duration::from_millis(16));
	}

	/// Émet un avertissement.
	pub fn send_warning(&self, msg: impl ToString)
	{
		self.1
			.warning
			.send(msg.to_string())
			.expect("Impossible de logger le warning");
		std::thread::sleep(std::time::Duration::from_millis(16));
	}
}

impl LoggerReader
{
	/// Lis les messages d'avertissements, d'erreurs, etc... en tâche de fond.
	pub(crate) fn spawn(mut self) -> LoggerReaderHandle
	{
		let name: &'static str = self.name.leak();
		let version: &'static str = self.version.leak();

		let warning_handling = move |warn: &str| {
			eprintln!(
				"{}[{}@{}]: {}",
				style("warning").yellow(),
				style(&name).yellow(),
				style(&version).blue(),
				style(warn).yellow().blink_fast(),
			);
		};

		let error_handling = move |err: &str| {
			eprintln!(
				"{}[{}@{}]: {}",
				style("error").red(),
				style(&name).red(),
				style(&version).blue(),
				style(err).red().blink_fast(),
			);
		};

		let wh = tokio::spawn(async move {
			while let Some(warn) = self.warning.recv().await {
				if warn == "terminated" {
					break;
				}
				warning_handling(&warn);
			}
		});

		let eh = tokio::spawn(async move {
			while let Some(err) = self.error.recv().await {
				if err == "terminated" {
					break;
				}
				error_handling(&err);
			}
		});

		(wh, eh)
	}
}
