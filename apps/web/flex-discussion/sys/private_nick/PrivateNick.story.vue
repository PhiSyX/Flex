<script lang="ts" setup>
import PrivateNick from "./PrivateNick.template.vue";

function init_state()
{
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
		<Variant title="Default" :init-state="init_state">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" />
			</template>
		</Variant>

		<Variant title="Prefix" :init-state="init_state">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" prefix="*" />
			</template>
		</Variant>

		<Variant title="Suffix" :init-state="init_state">
			<template #default="{ state }">
				<PrivateNick tag="span" :nickname="state.nickname" suffix=":" />
			</template>
		</Variant>

		<Variant title="Prefix/Suffix" :init-state="init_state">
			<template #default="{ state }">
				<PrivateNick
					tag="span"
					:nickname="state.nickname"
					prefix="<"
					suffix=">"
				/>
			</template>
		</Variant>

		<Variant title="Myself" :init-state="init_state">
			<template #default="{ state }">
				<PrivateNick
					tag="span"
					:is-current-client="true"
					:nickname="state.nickname"
				/>
			</template>
		</Variant>
	</Story>
</template>
