<script lang="ts" setup>
import { ChannelAccessLevelFlag, ChannelMember, User } from "@phisyx/flex-chat";

import ChannelNick from "./ChannelNick.template.vue";

let user = User.from({
	id: "0000-0000-0000-0000" as UserID,
	nickname: "PhiSyX",
	ident: "PhiSyX",
	host: {
		cloaked: "cloaked-host",
		vhost: "flex.chat",
	},
});

let def = new ChannelMember(user);
let myself = new ChannelMember(user).with_is_current_client(true);
let owner = new ChannelMember(user).with_access_level(
	ChannelAccessLevelFlag.Owner,
);
let admin_operator = new ChannelMember(user).with_access_level(
	ChannelAccessLevelFlag.AdminOperator,
);
let operator = new ChannelMember(user).with_access_level(
	ChannelAccessLevelFlag.Operator,
);
let half_operator = new ChannelMember(user).with_access_level(
	ChannelAccessLevelFlag.HalfOperator,
);
let vip_user = new ChannelMember(user).with_access_level(
	ChannelAccessLevelFlag.Vip,
);
let member = new ChannelMember(user);
let member_away = new ChannelMember(user);
member_away.marks_as_away();
</script>

<template>
	<Story
		title="Atoms/ChannelNick"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default">
			<ChannelNick :member="def" :with-avatar="false" />
		</Variant>

		<Variant title="Prefix">
			<ChannelNick :member="def" prefix="*" :with-avatar="false" />
		</Variant>

		<Variant title="Suffix">
			<ChannelNick :member="def" :with-avatar="false" suffix=":" />
		</Variant>

		<Variant title="Prefix/Suffix">
			<ChannelNick
				:member="def"
				:with-avatar="false"
				prefix="<"
				suffix=">"
			/>
		</Variant>

		<Variant title="Myself">
			<ChannelNick :member="myself" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: Owner">
			<ChannelNick :member="owner" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: Admin Operator">
			<ChannelNick :member="admin_operator" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: Operator">
			<ChannelNick :member="operator" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: Half Operator">
			<ChannelNick :member="half_operator" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: VIP">
			<ChannelNick :member="vip_user" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: User">
			<ChannelNick :member="member" :with-avatar="false" />
		</Variant>

		<Variant title="Channel: User Away">
			<ChannelNick :member="member_away" :with-avatar="false" />
		</Variant>
	</Story>
</template>
