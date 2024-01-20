// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ GNU General Public License v3.0+:                                         ┃
// ┃    see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt                ┃
// ┃ SPDX-License-Identifier: GPL-3.0-or-later                                 ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃ This file is part of phisyRC.                                             ┃
// ┃                                                                           ┃
// ┃ phisyRC is free software: you can redistribute it and/or modify it under  ┃
// ┃ the terms of the GNU General Public License as published by the           ┃
// ┃ Free Software Foundation, either version 3 of the License, or (at your    ┃
// ┃ option) any later version.                                                ┃
// ┃                                                                           ┃
// ┃ phisyRC is distributed in the hope that it will be useful, but WITHOUT    ┃
// ┃ ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or     ┃
// ┃ FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for  ┃
// ┃ more details.                                                             ┃
// ┃                                                                           ┃
// ┃ You should have received a copy of the GNU General Public License along   ┃
// ┃ with phisyRC.                                                             ┃
// ┃                                                                           ┃
// ┃ If not, see <https://www.gnu.org/licenses/>.                              ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::command_response;

command_response! {
	struct PRIVMSG
	{
		/// La cible du message.
		target: &'a str,
		/// Le texte.
		text: &'a str,
	}
}
