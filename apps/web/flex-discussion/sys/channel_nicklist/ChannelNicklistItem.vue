<script setup lang="ts">
import type {
    ChannelMember,
    ChannelMemberFiltered,
    ChannelMemberUnfiltered
} from "@phisyx/flex-chat";

import ChannelNickComponent from "#/sys/channel_nick/ChannelNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	list: Array<ChannelMemberFiltered | ChannelMemberUnfiltered | ChannelMember>;
    title: string;
	open?: boolean;
}

interface Emits
{
	(event_name: "open-private", origin: Origin): void;
	(event_name: "select-member", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();


let channel_member_title_attribute = (
	"· Simple clique: ouvrir le menu du membre du salon... \n" +
	"· Double clique: ouvrir la discussion privé avec le membre du salon\n"
);

// -------- //
// Handlers //
// -------- //

const open_private_handler = (member: ChannelMember) => emit("open-private", member);
const select_user_handler  = (member: ChannelMember) => emit("select-member", member);;
</script>

<template>
    <details :open="open">
        <summary class="[ f-size=15px pos-s ]">
            {{ title }}
        </summary>

        <ul class="[ flex! gap=2 list:reset f-size=14px ]">
            <template v-for="filtered_member in list" :key="filtered_member.id">
                <ChannelNickComponent
                    tag="li"
                    :id="filtered_member.id"
                    :classes="filtered_member.class_name"
                    :hits="
                        'search_hits' in filtered_member
                            ? filtered_member.search_hits
                            : []
                    "
                    :is-current-client="filtered_member.is_current_client"
                    :nickname="filtered_member.nickname"
                    :symbol="filtered_member.access_level.highest.symbol"
                    :title="channel_member_title_attribute"
                    class="channel/nick"
                    @dblclick="open_private_handler(filtered_member)"
                    @click="select_user_handler(filtered_member)"
                />
            </template>
    </ul>
    </details>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

details[open] > summary {
    margin-top: fx.space(-1);
    margin-bottom: fx.space(2);
	padding-block: fx.space(1);
}

summary {
	list-style-type: none;
	text-transform: uppercase;

	color: var(--room-userlist-group-color);
	backdrop-filter: blur(8px);
}

@include fx.class("channel/nick") {
	padding: 4px;
	border-radius: 4px;
}
</style>