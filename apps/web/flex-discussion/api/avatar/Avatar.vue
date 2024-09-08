<script lang="ts">
// TODO: Récupérer l'URL depuis une les points d'entrées du site.
const API_V1_AVATAR_ENDPOINT = "/api/v1/avatars/:userid";
</script>

<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";

import { UiImage } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	alt?: HTMLImageElement["alt"];
	editable?: boolean;
	form?: string;
	id: string;
	vertical?: boolean;
	size?: number | string;
	endpoint?: string;
}

interface Emits
{
	// biome-ignore lint/style/useShorthandFunctionType: chut
	(event_name: "upload", file: File): void;
}


interface Slots
{
	"default": unknown;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	size: 3,
	vertical: false,
	endpoint: API_V1_AVATAR_ENDPOINT,
});
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let $upload = ref<HTMLInputElement>();
let uploaded_file = shallowRef<File>();

// TODO: Créer un URL builder
let image_url = computed(() => props.endpoint.replaceAll(":userid", props.id));
let image_alt = computed(() => props.alt || `Avatar #${props.id}`);

// ------- //
// Handler //
// ------- //

function click_handler()
{
	if (!props.editable) {
		return;
	}

	$upload.value?.click();
}

function on_upload_image_handler(evt: Event)
{
	let target = evt.currentTarget as HTMLInputElement;

	if (!target.validity.valid) {
		return;
	}

	let file = target.files?.item(0);
	if (!file || !file.type.match("image/*")) {
		return;
	}

	uploaded_file.value = file;

	emit("upload", file);
}
</script>

<template>
	<UiImage
		:src="image_url"
		:file="uploaded_file"
		:alt="image_alt"
		:rounded="true"
		:text-inline="!vertical"
		:size="size"
		root-class="[ pos-r ]"
		@click="click_handler"
	>
		<span v-if="vertical && editable">
			<icon-photo :height="size" :width="size" />

			<input
				ref="$upload"
				:form="form"
				accept="image/jpeg,image/jpg,image/png"
				type="file"
				tabindex="-1"
				name="avatar"
				class="[ pos-a:full opacity=0 cursor:pointer ]"
				@change="on_upload_image_handler"
			/>
		</span>

		<strong
			v-if="vertical && editable"
			class="[ display-ib pt=2 cursor:pointer ]"
			@click="click_handler"
		>
			Modifier l'avatar
		</strong>

		<slot />
	</UiImage>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

span {
	position: absolute;
	bottom: 4px;
	left: calc(50% - (v-bind(size) * 1px) + 4px);
	background-color: hsla(var(--color-white_hsl), 75%);
	padding: 6px;
	border-radius: 50%;
	margin-bottom: fx.space(2);

	&:hover {
		background-color: hsla(var(--color-white_hsl), 55%);
	}
}
</style>
