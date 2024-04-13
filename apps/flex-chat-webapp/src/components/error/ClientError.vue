<script lang="ts" setup>
import { Alert } from "@phisyx/flex-uikit";

import { useChatStore } from "~/store/ChatStore";

import Match from "#/sys/match/Match.vue";

const chatStore = useChatStore();
</script>

<template>
	<Match :maybe="chatStore.store.clientError">
		<template #some="{ data: error }">
			<Teleport :to="`#${error.id}_teleport`">
				<Alert type="error" :can-close="false" class="[ max-w=56 ]">
					<h1 class="[ align-t:left ]">
						<IconError class="[ size=4 align-v:top ]" />
						Erreur
						<small v-if="error.title">: {{ error.title }}</small>
					</h1>

					<h2 v-if="error.subtitle" class="[ align-t:left ml=4 ]">
						{{ error.subtitle }}
					</h2>

					<ul v-if="error.problems">
						<li
							v-for="problem of error.problems"
							:data-pointer="problem.pointer"
							class="[ align-t:left ]"
						>
							<a
								v-if="problem.type"
								:href="problem.type"
								:title="problem.type"
								target="_blank"
								rel="help noreferrer nofollow"
							>
								{{ problem.pointer }}
							</a>
							<span v-else>{{ problem.pointer }}</span>
							: {{ problem.detail }}
						</li>
					</ul>

					<div v-if="error.problems && error.data">
						<strong>Les données concernées:</strong>
						<pre class="[ align-t:left ]">{{ error.data }}</pre>
					</div>
					<p v-else>{{ error.data }}</p>
				</Alert>
			</Teleport>
		</template>
	</Match>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

pre {
	padding: fx.space(1);
	border-radius: 2px;
	overflow: auto;

	@include fx.scheme using ($name) {
		@if $name == light {
			background-color: var(--color-grey100);
			color: var(--color-grey900);
		} @else if $name == ice {
			background-color: var(--color-black);
			color: var(--color-white);
		} @else if $name == dark {
			background-color: var(--color-black);
			color: var(--color-white);
		}
	}
}

a {
	@include fx.scheme using ($name) {
		@if $name == light {
			color: var(--color-white);
		} @else if $name == ice {
			color: var(--color-orange200);
		} @else if $name == dark {
			color: var(--color-orange200);
		}
	}
}
</style>
