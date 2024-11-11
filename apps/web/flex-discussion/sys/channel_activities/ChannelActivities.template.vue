<script setup lang="ts">
import type { ChannelActivitiesView } from "@phisyx/flex-chat/channel/activity";
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";

import type { Option } from "@phisyx/flex-safety/option";
import { provide } from "vue";

import ChannelActivityGroup from "./ChannelActivityGroup.vue";

// ---- //
// Type //
// ---- //

interface Props {
	activities: ChannelActivitiesView;
	currentClientMember: Option<ChannelMember>;
	room: ChannelRoom;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

// NOTE: Les composants `ChannelActivityGroup` et `ChannelActivity` ne sont
// utilisés que dans ce composant. Ils ne sont pas utilisés dans un
// design-system. De ce fait, je peux me permettre d'utiliser cette
// fonctionnalité. (car d'habitude je me la déconseille)
provide("currentClientMember", props.currentClientMember);
provide("room", props.room);

let expanded = defineModel<boolean>("expanded", { required: true });

function expand_panel_handler() {
	expanded.value = true;
}

function shrink_panel_handler() {
	expanded.value = false;
}
</script>

<template>
	<div
		class="room/channel:activities [ ov:h min-h=6 px=2 pb=1 gap=1 ]"
		:class="{
			'pt=1 flex max-h=6 align-jc:end cursor:pointer': !expanded,
			'pt=2 flex! h:full is-expanded': expanded,
		}"
		@click="expand_panel_handler"
	>
		<section class="[ flex:full scroll:y scroll:hidden flex! gap=2 ]">
			<ChannelActivityGroup
				v-for="group of activities.groups"
				:group="group"
				:name="group.name"
				:key="group.name"
			/>
		</section>

		<div
			class="[ flex:shrink=0 box:shadow ]"
			:class="{
				'self.align:center align-t:center w:full cursor:pointer': expanded,
				'self.align:base': !expanded,
			}"
		>
			<icon-arrow-right v-if="!expanded"
				variant="chevron"
				@click.stop="expand_panel_handler"
			/>
			<icon-arrow-up v-else
				variant="chevron"
				@click.stop="shrink_panel_handler"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

@include fx.class("room/channel:activities") {
	border: 2px solid var(--color-red200);
	background: var(--channel-activities-bg);
	color: var(--channel-activities-color);
	border-radius: 2px;
}
</style>
