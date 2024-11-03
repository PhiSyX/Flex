import router from "@adonisjs/core/services/router";

import { middleware } from "#start/kernel";

import { AccountRouteWebID } from "@phisyx/adonai-domain/account/http.js";

const AccountSelfWebController = () =>
	import("#ui/web/account/controller/self");

router
	.group(() => {
		router
			.get(AccountRouteWebID.Self, [AccountSelfWebController, "view"])
			.as("web.account.self");
	})
	.use(middleware.auth());
