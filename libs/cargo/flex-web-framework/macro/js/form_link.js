/* */
let fetch_headers = new Headers();
fetch_headers.append("Content-Type", "application/json");

/**
 * @type {HTMLFormElement}
 */
let $form = document.querySelector('form[id="{id}"]');
/**
 * @type {HTMLAnchorElement}
 */
let $link = document.querySelector('a[form="{id}"]');
$link.addEventListener("click", (evt) => {
	evt.preventDefault();

	let form_data = new FormData($form);
	let form_json = Object.fromEntries(form_data);

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
		.catch((err) => {
			console.error(err);
		});
});
