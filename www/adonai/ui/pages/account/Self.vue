<script setup lang="ts">
import type { InferPageProps } from "@adonisjs/inertia/types";
import type AccountSelfWebController from "#ui/web/account/controller/self";

import { Head, Link } from "@inertiajs/vue3";

type Links = InferPageProps<AccountSelfWebController, "view">["links"];
type User = InferPageProps<AccountSelfWebController, "view">["user"];

defineProps<{ user: User; links: Links }>();
</script>

<template>
	<Head title="Mon compte" />

	<div>
		<h1>Mon compte</h1>

		<pre>{{ user }}</pre>

		<Link :href="links.logout.href" :method="links.logout.type" as="button">
			Se déconnecter
		</Link>
	</div>
</template>
