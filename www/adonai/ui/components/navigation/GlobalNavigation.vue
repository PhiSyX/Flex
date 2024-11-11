<script setup lang="ts">
import { usePage } from "@inertiajs/vue3";
import { computed } from "vue";

import InertiaLink from "../../components/link/InertiaLink.vue";

let current_page = usePage();
let current_user = computed(() => current_page.props.current_user);
</script>

<template>
	<nav
		role="navigation"
		class="[ flex:shrink=0 flex! gap=2 p=2 align-t:center ]"
	>
		<InertiaLink
			icon="home"
			href="/"
			:strict="true"
			title="Naviguer vers l'accueil"
		/>

		<InertiaLink
			icon="chat"
			href="/chat"
			title="Naviguer vers la page de Chat"
		/>

		<InertiaLink
			v-if="current_user"
			icon="dashboard"
			href="/@me"
			title="Naviguer vers la page de votre dashboard"
		/>

		<InertiaLink
			v-if="!current_user"
			icon="login"
			href="/auth"
			hide-when-active
			title="Se connecter"
		/>
		<InertiaLink
			v-else
			icon="logoff"
			href="/auth/logout"
			method="delete"
			hide-when-active
			title="Se déconnecter"
		/>
	</nav>
</template>

<style lang="scss" scoped>
@use "./GlobalNavigation";
</style>
