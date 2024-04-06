// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_wildcard_matching::WildcardMatching;

#[test]
fn test_iswm_question_mark()
{
	assert!("test".iswm("t?st"));
	assert!(!"t?st".iswm("test"));

	assert!(!"PhiSyX[absent]".iswm("PhiSyX[absent?]"));
	assert!("PhiSyX[absente]".iswm("PhiSyX[absent?]"));
	assert!("PhiSyX[occupée]".iswm("PhiSyX[occup?e]"));
	assert!("PhiSyX[bot]".iswm("PhiSyX[???]"));
	assert!("PhiSyX[BOT]".iswm("PhiSyX[???]"));
	assert!("PhiSyX[BOT]".iswmcs("PhiSyX[???]"));
	assert!(!"PhiSyX[bot]".iswm("PhiSyX[??]"));
}
