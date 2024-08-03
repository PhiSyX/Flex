<script lang="ts" setup>
import ChannelName from "./ChannelName.template.vue";

function initState() {
	return {
		name: "#iBug",
	};
}
</script>

<template>
	<Story
		title="Atoms/ChannelName"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" />
			</template>
		</Variant>

		<Variant title="Symbol" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="@" />
			</template>
		</Variant>

		<Variant title="Owner" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="~" classes="is-owner" />
			</template>
		</Variant>

		<Variant title="Admin operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="&" classes="is-admin-operator" />
			</template>
		</Variant>

		<Variant title="Operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="@" classes="is-operator" />
			</template>
		</Variant>

		<Variant title="Half Operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="%" classes="is-half-operator" />
			</template>
		</Variant>

		<Variant title="VIP" :init-state="initState">
			<template #default="{ state }">
				<ChannelName :name="state.name" symbol="+" classes="is-vip" />
			</template>
		</Variant>
	</Story>
</template>
