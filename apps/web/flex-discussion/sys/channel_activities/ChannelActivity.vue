<script setup lang="ts">
import { type ChannelActivity, isChannelMember } from "@phisyx/flex-chat";

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
			v-for="previousMessage of activity.previousMessages"
			class="activities@activity [ flex gap=1 ]"
		>
			<div class="[ flex:shrink=0 ]" style="visibility: hidden">
				<icon-event />
			</div>

			<div class="[ flex:full ]">
				<Match :maybe="previousMessage.member">
					<template #some="{ data: member }">
						<ChannelNick
							:nickname="member.nickname"
							:classes="member.className"
							:symbol="isChannelMember(member) ? member.accessLevel.highest.symbol : undefined"
						/>
					</template>
					<template #none>
						<ChannelNick
							:nickname="previousMessage.message.nickname"
						/>
					</template>
				</Match>

				<span>: </span>

				<p class="[ display-i hyphens ]">
					{{ previousMessage.message.data.text }}
				</p>
			</div>
		</li>
	</ul>

	<li class="activities@activity [ flex gap=1 ]">
		<div class="[ flex:shrink=0 ]">
			<icon-event />
		</div>

		<div class="[ flex:full ]">
			<Match :maybe="activity.member">
				<template #some="{ data: member }">
					<ChannelNick
						:nickname="member.nickname"
						:classes="member.className"
						:symbol="isChannelMember(member) ? member.accessLevel.highest.symbol : undefined"
					/>
				</template>
				<template #none>
					<ChannelNick :nickname="activity.message.nickname" />
				</template>
			</Match>

			<span>: </span>

			<p class="[ display-i hyphens ]">
				{{ activity.message.message }}
			</p>
		</div>
	</li>
</template>

<style lang="scss" scoped>
p {
	line-height: 24px;
	color: var(--channel-activities-color);
}
</style>

<style lang="scss">
p {
	line-height: 24px;
	color: var(--channel-activities-color);
}
</style>
