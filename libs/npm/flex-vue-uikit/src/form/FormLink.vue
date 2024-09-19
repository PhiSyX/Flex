<script setup lang="ts">
import { useTemplateRef } from "vue";

// ---- //
// Type //
// ---- //

type Method = "post" | "delete" | "patch" | "put";

interface Props {
	href: string;
	data?: Record<string, string>;
	method: Lowercase<Method> | Uppercase<Method>;
}

// TODO: valider les données avec Zod
interface Emits {
	(event_name: "redirect", url: string): void;
	// biome-ignore lint/suspicious/noExplicitAny: lire TODO ci-haut
	(event_name: "error", err: any): void;
	// biome-ignore lint/suspicious/noExplicitAny: lire TODO ci-haut
	(event_name: "success", res: any): void;
}

// --------- //
// Composant //
// --------- //

const { href, method } = defineProps<Props>();
const emit = defineEmits<Emits>();

let $form = useTemplateRef("$form");

// ------- //
// Handler //
// ------- //

async function submit_handler(evt: Event) {
	if (!$form.value) {
		return;
	}

	evt.preventDefault();

	let fetch_headers = new Headers();
	fetch_headers.append("Accept", "application/json");
	fetch_headers.append("Content-Type", "application/json");

	let form_data = new FormData($form.value);
	let form_json = Object.fromEntries(form_data);

	fetch(href, {
		headers: fetch_headers,
		redirect: "follow",
		method: method,
		body: JSON.stringify(form_json),
	})
		.then((response) => {
			if (response.redirected === true) {
				emit("redirect", response.url);
			}

			if (response.ok) {
				emit("success", response);
				return;
			}

			return Promise.reject(response);
		})
		.catch((err) => emit("error", err));
}
</script>

<template>
	<form ref="$form" :action="href" :method="method" @submit="submit_handler">
		<input
			v-if="data"
			v-for="[k, v] of Object.entries(data)"
			type="hidden"
			:name="k"
			:value="v"
		/>
		<button type="submit"><slot /></button>
	</form>
</template>
