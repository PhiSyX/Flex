<script setup lang="ts">
import type { ChannelActivity, ChannelMember } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";
import { inject } from "vue";

import ChannelName from "../channel_name/ChannelName.vue";
import ChannelNick from "../channel_nick/ChannelNick.vue";
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

// NOTE: nous n'utilisons jamais ce composant en tant qu'entité seul, il n'est
// pas non plus utilisé dans un design system.
//
// biome-ignore lint/style/noNonNullAssertion: lire la NOTE ci-haut.
const currentClientMember = inject<Option<ChannelMember>>(
	"currentClientMember",
)!;
</script>

<template>
	<li class="activities@activity [ flex gap=1 ]">
		<div class="[ flex:shrink=0 ]">
			<icon-event />
		</div>

		<div class="[ flex:full ]">
			<ChannelNick
				:nickname="activity.member.nickname"
				:classes="activity.member.className"
				:symbol="activity.member.accessLevel.highest.symbol"
				tag="bdo"
			/>

			<span> sur </span>

			<Match :maybe="currentClientMember">
				<template #some="{ data }">
					<ChannelName
						:name="activity.channel.name"
						:classes="data.accessLevel.highest.className"
						:symbol="data.accessLevel.highest.symbol"
					/>
				</template>
				<template #none>
					<ChannelName :name="activity.channel.name" />
				</template>
			</Match>

			<span>: </span>

			<p class="[ display-i hyphens ]">
				{{ activity.message.data.text }}
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
