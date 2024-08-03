<script lang="ts" setup>
import ChannelNick from "./ChannelNick.template.vue";

function initState() {
	return {
		nickname: "PhiSyX",
	};
}
</script>

<template>
	<Story
		title="Atoms/ChannelNick"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick tag="span" :nickname="state.nickname" />
			</template>
		</Variant>

		<Variant title="Prefix" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick tag="span" :nickname="state.nickname" prefix="*" />
			</template>
		</Variant>

		<Variant title="Suffix" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick tag="span" :nickname="state.nickname" suffix=":" />
			</template>
		</Variant>

		<Variant title="Prefix/Suffix" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					prefix="<"
					suffix=">"
				/>
			</template>
		</Variant>

		<Variant title="Myself" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:is-current-client="true"
					:nickname="state.nickname"
				/>
			</template>
		</Variant>

		<Variant title="Channel: Owner" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					symbol="~"
					classes="is-owner"
				/>
			</template>
		</Variant>

		<Variant title="Channel: Admin Operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					symbol="&"
					classes="is-admin-operator"
				/>
			</template>
		</Variant>

		<Variant title="Channel: Operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					symbol="@"
					classes="is-operator"
				/>
			</template>
		</Variant>

		<Variant title="Channel: Half Operator" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					symbol="%"
					classes="is-half-operator"
				/>
			</template>
		</Variant>

		<Variant title="Channel: VIP" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					symbol="+"
					classes="is-vip"
				/>
			</template>
		</Variant>

		<Variant title="Channel: User" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick tag="span" :nickname="state.nickname" />
			</template>
		</Variant>

		<Variant title="Channel: User Away" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					classes="is-away"
				/>
			</template>
		</Variant>

		<Variant title="Channel: User Busy" :init-state="initState">
			<template #default="{ state }">
				<ChannelNick
					tag="span"
					:nickname="state.nickname"
					classes="is-busy"
				/>
			</template>
		</Variant>
	</Story>
</template>
