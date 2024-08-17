<script setup lang="ts">
import { type ChannelActivity, is_channel_member } from "@phisyx/flex-chat";

import ChannelNick from "../channel_nick/ChannelNick.template.vue";
import Match from "../match/Match.vue";

// ---- //
// Type //
// ---- //

interface Props
{
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
			<div class="[ flex:shrink=0 ]" style="visibility: hidden">
				<icon-event />
			</div>

			<div class="[ flex:full ]">
				<Match :maybe="previous_message.member">
					<template #some="{ data: member }">
						<ChannelNick
							:id="member.id"
							:is-current-client="member.is_current_client"
							:nickname="member.nickname"
							:classes="member.class_name"
							:symbol="is_channel_member(member) ? member.access_level.highest.symbol : undefined"
						/>
					</template>
					<template #none>
						<ChannelNick
							:is-current-client="previous_message.message.is_current_client"
							:nickname="previous_message.message.nickname"
						/>
					</template>
				</Match>

				<span>: </span>

				<p class="[ display-i hyphens ]">
					{{ previous_message.message.message }}
				</p>
			</div>
		</li>
	</ul>

	<li class="activities@activity [ gap=1 ]">
		<div class="[ flex:shrink=0 ]">
			<icon-event />
		</div>

		<Match :maybe="activity.member">
			<template #some="{ data: member }">
				<ChannelNick
					:id="member.id"
					:is-current-client="member.is_current_client"
					:nickname="member.nickname"
					:classes="member.class_name"
					:symbol="is_channel_member(member) ? member.access_level.highest.symbol : undefined"
				/>
			</template>
			<template #none>
				<ChannelNick
					:is-current-client="activity.message.is_current_client"
					:nickname="activity.message.nickname"
				/>
			</template>
		</Match>
			
		<div>
			<span>: </span>

			<p class="[ display-i hyphens ]">
				{{ activity.message.message }}
			</p>
		</div>
	</li>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

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
