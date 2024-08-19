import { test } from "@playwright/test";
import { ChatBrowserContext } from "./helpers/context.js";


test("connect multiple users", async ({ browser }) => {
    let chat_ctx = await ChatBrowserContext.connect_many(25, browser, "#iBug");
    await chat_ctx.all_users_with_access_level();

    await chat_ctx.timeout(1_000_000);
});