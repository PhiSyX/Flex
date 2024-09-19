<script lang="ts" setup>
import { Panel } from "@phisyx/flex-vue-uikit";

import { use_chat_store } from "~/store";

import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
</script>

<template>
	<Match :maybe="chat_store.client_error">
		<template #some="{ data: error }">
			<Teleport defer :to="`#${error.id}_teleport`">
				<Panel
					type="error"
					class="problem [ max-w=56 f-size=14px ]"
					:with-padding="false"
				>
					<template #heading>
						<h1 class="[ align-t:left m=0 f-size=24px ]">
							<IconError class="[ size=4 align-v:top ]" />
							Erreur :
							<small v-if="error.title">
								{{ error.title }}
							</small>
						</h1>

						<h2
							v-if="error.subtitle"
							class="[ align-t:left m=0 f-size=18px ]"
						>
							<IconError class="[ size=4 align-v:top vis:h ]" />
							<small>{{ error.subtitle }}</small>
						</h2>
					</template>

					<ol v-if="error.problems" class="">
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
					</ol>

					<div v-if="error.problems && error.data">
						<strong>Les données concernées:</strong>
						<pre class="[ align-t:left ]">{{ error.data }}</pre>
					</div>
					<p v-else class="p:reset [ align-t:center ]">
						{{ error.data }}
					</p>
				</Panel>
			</Teleport>
		</template>
	</Match>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.problem {
	--panel-heading-bg: var(--color-red400);
	--panel-bg: var(--body-bg);

	@include fx.scheme using ($name) {
		@if $name == light {
			--panel-color: var(--color-black);
		} @else if $name == ice {
			--panel-color: var(--color-white);
		} @else if $name == dark {
			--panel-color: var(--color-white);
		}
	}
}

pre {
	padding: fx.space(1);
	border-radius: 2px;
	overflow: auto;

	@include fx.scheme using ($name) {
		background-color: var(--room-bg);
	}
}

a {
	@include fx.scheme using ($name) {
		@if $name == light {
			color: var(--color-blue500);
		} @else if $name == ice {
			color: var(--color-blue200);
		} @else if $name == dark {
			color: var(--color-orange200);
		}
	}
}
</style>
