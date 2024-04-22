// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PlaywrightTestConfig } from "@playwright/test";

import * as path from "node:path";
import { env } from "node:process";
import { devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
	testDir: path.resolve("tests", "e2e"),
	outputDir: path.resolve("tests", "e2e", "output"),
	snapshotDir: path.resolve("tests", "e2e", "snapshot"),

	/* Maximum time one test can run for. */
	// timeout: 30 * 1000,
	timeout: 10000 * 1000,

	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 5000,
	},

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!env.CI,
	/* Retry on CI only */
	retries: env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	// FIXME: valeur arbitraire
	workers: env.CI ? 4 : "75%",
	fullyParallel: !env.CI,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		[
			"html",
			{
				outputFolder: path.resolve("tests", "e2e", "report"),
				open: "never",
			},
		],
	],

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 0,
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "https://localhost:5174",
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		/* Only on CI systems run the tests headless */
		headless: !!env.CI,
	},

	/* Configure projects for major browsers */
	projects: [
		// {
		// 	name: "firefox",
		// 	use: {
		// 		...devices["Desktop Firefox"],
		// 	},
		// },

		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},

		// {
		// 	name: "webkit",
		// 	use: {
		// 		...devices["Desktop Safari"],
		// 	},
		// },

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: {
		//     ...devices['Pixel 5'],
		//   },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: {
		//     ...devices['iPhone 12'],
		//   },
		// },

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: {
		//     channel: 'msedge',
		//   },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: {
		//     channel: 'chrome',
		//   },
		// },
	],

	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	// outputDir: 'test-results/',

	/* Run your local dev server before starting the tests */
	webServer: {
		/**
		 * Use the dev server by default for faster feedback loop. Use the
		 * preview server on CI for more realistic testing. Playwright will
		 * re-use the local server if there is already a dev-server running.
		 */
		command: `${env.CI ? "pnpm preview --port 5174" : "pnpm run dev --port 5174"}`,
		reuseExistingServer: false,
	},
};

export default config;
