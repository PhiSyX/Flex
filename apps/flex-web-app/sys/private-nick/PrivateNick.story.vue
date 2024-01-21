<script lang="ts" setup>
import PrivateNick from "./PrivateNick.vue";

function initState() {
	return {
		nickname: "PhiSyX",
	};
}
</script>

<template>
	<Story
		title="Atoms/PrivateNick"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default" :init-state="initState">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" />
			</template>
		</Variant>

		<Variant title="Prefix" :init-state="initState">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" prefix="*" />
			</template>
		</Variant>

		<Variant title="Suffix" :init-state="initState">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" suffix=":" />
			</template>
		</Variant>

		<Variant title="Prefix/Suffix" :init-state="initState">
			<template #default="{ state }">
				<PrivateNick
					tag="span"
					:nickname="state.nickname"
					prefix="<"
					suffix=">"
				/>
			</template>
		</Variant>

		<Variant title="Myself" :init-state="initState">
			<template #default="{ state }">
				<PrivateNick
					tag="span"
					:is-me="true"
					:nickname="state.nickname"
				/>
			</template>
		</Variant>
	</Story>
</template>
