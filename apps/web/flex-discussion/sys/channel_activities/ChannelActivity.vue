<script setup lang="ts">
import type { ChannelActivity } from "@phisyx/flex-chat/channel/activity";

import ChannelNick from "../channel_nick/ChannelNick.template.vue";
import Match from "../match/Match.vue";

// ---- //
// Type //
// ---- //

interface Props {
	activity: ChannelActivity;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<ul
		v-if="activity.previousMessages.length"
		class="[ list:reset pt=2 ]"
		data-name="activity-previous-messages"
		style="opacity: 0.5"
		v-once
	>
		<li
			v-for="previous_message of activity.previousMessages"
			class="activities@activity [ flex gap=1 ]"
		>
			<Match :maybe="previous_message.message">
				<template #some="{ data: message }">
					<div class="[ flex:shrink=0 vis:h ]">
						<icon-event />
					</div>

					<Match :maybe="previous_message.member">
						<template #some="{ data: member }">
							<ChannelNick :member="member" />
						</template>
					</Match>

					<div>
						<span>: </span>

						<p class="[ display-i hyphens ]">
							{{ message }}
						</p>
					</div>
				</template>
			</Match>
		</li>
	</ul>

	<Match :maybe="activity.message">
		<template #some="{ data: message }">
			<li class="activities@activity [ gap=1 ]">
				<div class="[ flex:shrink=0 ]">
					<icon-event />
				</div>

				<Match :maybe="activity.member">
					<template #some="{ data: member }">
						<ChannelNick :member="member" />
					</template>
				</Match>

				<div>
					<span>: </span>

					<p class="[ display-i hyphens ]">
						{{ message }}
					</p>
				</div>
			</li>
		</template>
	</Match>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

@include fx.class("activities@activity") {
	display: grid;
	grid-template-columns: 24px auto auto 1fr;
	align-items: start;
	.expanded & {
		align-items: center;
	}
}

p {
	line-height: 24px;
	color: var(--channel-activities-color);
}
</style>
