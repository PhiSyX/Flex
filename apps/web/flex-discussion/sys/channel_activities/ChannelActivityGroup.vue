<script setup lang="ts">
import { camelCase } from "@phisyx/flex-capitalization";
import type { ChannelActivitiesView } from "@phisyx/flex-chat";
import { computed } from "vue";

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

const activityGroupName = computed(() => camelCase(`${props.name}s`));
</script>

<template>
	<ul
		class="activities@activity-group [ list:reset ov:c flex! gap=2 ]"
		:data-event="name"
	>
		<li data-name="activity-name">
			<strong class="[ display-b align-t:center ]">
				{{ activityGroupName }} | {{ group.createdAt }}
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
@use "scss:~/flexsheets" as fx;

@include fx.class("room/channel:activities") {
	&:not(.is-expanded) {
		.activities\@activity-group {
			display: none;
		}
		.activities\@activity-group:last-child {
			display: initial;

			& > li:first-child,
			& > li > ul li:not(:last-child),
			& > li ul[data-name="activity-previous-messages"]{
				display: none;
			}
		}
	}
}
</style>
