<script lang="ts" setup>
import { Alert } from "@phisyx/flex-vue-uikit";

// const types = {
// 	warning: "Warning",
// 	error: "Error",
// };

function default_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
	};
}

function lockable_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		can_close: false,
	};
}

function left_content_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		left_content: true,
	};
}

function delay_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		delay: 2,
	};
}
</script>

<template>
	<Story title="Molecules/Alert" responsive-disabled>
		<Variant title="Default" :init-state="default_state">
			<template #default="{ state }">
				<Alert :type="state.type">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Lockable" :init-state="lockable_state">
			<template #default="{ state }" >
				<Alert :type="state.type" :can-close="state.can_close">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Left Content" :init-state="left_content_state">
			<template #default="{ state }" >
				<Alert :type="state.type" :content-center="!state.left_content">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Close with delay" :init-state="delay_state">
			<template #default="{ state }" >
				<Alert :type="state.type" :close-after-seconds="state.delay">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>
	</Story>
</template>
