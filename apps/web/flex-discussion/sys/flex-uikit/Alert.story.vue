<script lang="ts" setup>
import Alert from "@phisyx/flex-uikit-vue/alert/Alert.vue";

function default_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
	};
}

function lockable_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		closable: false,
	};
}

function content_center_state() {
	return {
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt esse cumque enim modi dolorum, ex recusandae asperiores facilis! In adipisci maiores suscipit eum velit neque dolore dolorem veniam, odit deleniti.",
		type: "warning",
		content_center: "center",
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
				<Alert appearance="error">
					Type Error: {{ state.content }}
				</Alert>
				<Alert appearance="info">
					Type Info: {{ state.content }}
				</Alert>
				<Alert appearance="success">
					Type Success: {{ state.content }}
				</Alert>
				<Alert appearance="warning">
					Type Warning: {{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Lockable" :init-state="lockable_state">
			<template #default="{ state }">
				<Alert :appearance="state.type" :closable="state.closable">
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Left Content" :init-state="content_center_state">
			<template #default="{ state }">
				<Alert
					:appearance="state.type"
					:content-align="state.content_center"
				>
					{{ state.content }}
				</Alert>
			</template>
		</Variant>

		<Variant title="Close with delay" :init-state="delay_state">
			<template #default="{ state }">
				<Alert
					:appearance="state.type"
					:close-after-seconds="state.delay"
				>
					{{ state.content }}
				</Alert>
			</template>
		</Variant>
	</Story>
</template>
