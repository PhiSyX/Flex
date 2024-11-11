<script setup lang="ts">
import type { ChannelActivitiesView } from "@phisyx/flex-chat/channel/activity";
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { Option } from "@phisyx/flex-safety";

import { camelcase } from "@phisyx/flex-capitalization/camelcase";
import { computed, inject } from "vue";

import ChannelName from "../channel_name/ChannelName.template.vue";
import Match from "../match/Match.vue";
import ChannelActivity from "./ChannelActivity.vue";

// ---- //
// Type //
// ---- //

interface Props {
	name: ChannelActivitiesView["groups"][number]["name"];
	group: ChannelActivitiesView["groups"][number];
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

// biome-ignore lint/style/noNonNullAssertion: retourne un type Option (None dans le cas de nil).
let current_client_member = inject<Option<ChannelMember>>(
	"currentClientMember",
)!;
let room = inject<ChannelRoom>("room");

let activity_group_name = computed(() => camelcase(`${props.name}s`));
</script>

<template>
	<ul
		class="activities@activity-group [ list:reset ov:c flex! gap=2 ]"
		:data-event="name"
	>
		<li data-name="activity-name">
			<strong class="[ display-b align-t:center ]">
				{{ activity_group_name }}

				<Match :maybe="current_client_member">
					<template #some="{ data: member }">
						sur
						<ChannelName
							v-if="room"
							:name="room.name"
							:highest-access-level="member.access_level.highest"
						/>
					</template>
				</Match>

				|

				{{ group.createdAt }}
				<Match :maybe="group.updatedAt">
					<template #some="{ data: updatedAt }">
						à {{ updatedAt }}
					</template>
				</Match>
			</strong>
		</li>

		<li data-name="activity-groups">
			<ul class="[ list:reset ]">
				<ChannelActivity
					v-for="activity of group.activities"
					:activity="activity"
				/>
			</ul>
		</li>
	</ul>
</template>

<style scoped lang="scss">
strong {
	color: var(--color-grey500);
}

ul[data-event^="notice"] {
	color: var(--room-event-color);
}
</style>

<style lang="scss">
@use "@phisyx/flexsheets" as fx;

@include fx.class("room/channel:activities") {
	&:not(.is-expanded) {
		.activities\@activity-group {
			display: none;
		}
		.activities\@activity-group:last-child {
			display: initial;

			& > li:first-child,
			& > li > ul li:not(:last-child),
			& > li ul[data-name="activity-previous-messages"] {
				display: none;
			}
		}
	}
}
</style>
