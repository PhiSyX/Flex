<script lang="ts" setup>
import { ChannelAccessLevel, ChannelAccessLevelFlag } from "@phisyx/flex-chat";

import ChannelName from "./ChannelName.template.vue";

function init_state() {
	let owner = new ChannelAccessLevel().with(ChannelAccessLevelFlag.Owner);

	let admin_operator = new ChannelAccessLevel().with(
		ChannelAccessLevelFlag.AdminOperator,
	);

	let operator = new ChannelAccessLevel().with(
		ChannelAccessLevelFlag.Operator,
	);

	let half_operator = new ChannelAccessLevel().with(
		ChannelAccessLevelFlag.HalfOperator,
	);

	let vip_user = new ChannelAccessLevel().with(ChannelAccessLevelFlag.Vip);

	return {
		name: "#iBug",
		owner: owner.highest,
		admin_operator: admin_operator.highest,
		operator: operator.highest,
		half_operator: half_operator.highest,
		vip_user: vip_user.highest,
	};
}
</script>

<template>
	<Story
		title="Atoms/ChannelName"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName :name="state.name" />
			</template>
		</Variant>

		<Variant title="Owner" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName
					:name="state.name"
					:highest-access-level="state.owner"
				/>
			</template>
		</Variant>

		<Variant title="Admin operator" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName
					:name="state.name"
					:highest-access-level="state.admin_operator"
				/>
			</template>
		</Variant>

		<Variant title="Operator" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName
					:name="state.name"
					:highest-access-level="state.operator"
				/>
			</template>
		</Variant>

		<Variant title="Half Operator" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName
					:name="state.name"
					:highest-access-level="state.half_operator"
				/>
			</template>
		</Variant>

		<Variant title="VIP" :init-state="init_state">
			<template #default="{ state }">
				<ChannelName
					:name="state.name"
					:highest-access-level="state.vip_user"
				/>
			</template>
		</Variant>
	</Story>
</template>
