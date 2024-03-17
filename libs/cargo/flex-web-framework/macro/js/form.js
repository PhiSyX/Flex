/* */
let fetch_headers = new Headers();
fetch_headers.append("Content-Type", "application/json");

/**
 * @type {HTMLFormElement}
 */
let $form = document.querySelector('form[data-js-id="{id}"]');

$form.addEventListener("submit", (evt) => {
	let form_data = new FormData($form);

	for (const key in $form.dataset) {
		form_data.append(key, $form.dataset[key]);
	}

	let form_json = Object.fromEntries(form_data);

	evt.preventDefault();

	fetch($form.action, {
		headers: fetch_headers,
		redirect: "follow",
		method: "{method}",
		body: JSON.stringify(form_json),
	})
		.then((response) => {
			if (response.redirected === true) {
				window.location = response.url;
			}
		})
		.catch(console.error);
});
