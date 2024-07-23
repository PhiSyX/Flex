<script lang="ts" setup>
import { Alert } from "@phisyx/flex-vue-uikit";

// const types = {
// 	warning: "Warning",
// 	error: "Error",
// };

function defaultState() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
	};
}

function lockableState() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		canClose: false,
	};
}

function leftContentState() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		leftContent: true,
	};
}

function delayState() {
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
		<Variant title="Default" :init-state="defaultState">
			<template #default="{ state }">
				<Alert :type="state.type">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Lockable" :init-state="lockableState">
			<template #default="{ state }" >
				<Alert :type="state.type" :can-close="state.canClose">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Left Content" :init-state="leftContentState">
			<template #default="{ state }" >
				<Alert :type="state.type" :content-center="!state.leftContent">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Close with delay" :init-state="delayState">
			<template #default="{ state }" >
				<Alert :type="state.type" :close-after-seconds="state.delay">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>
	</Story>
</template>
