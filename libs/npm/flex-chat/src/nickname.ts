/**
 * Attribut `maxlength` de l'élément `<input name="nickname">`.
 *
 * Taille maximale d'un pseudonyme.
 */
export const MAXLENGTH_NICKNAME: number = 30;

/**
 * Attribut `placeholder` de l'élément `<input name="nickname">`.
 */
export const PLACEHOLDER_NICKNAME: string = `Pseudonyme (max. ${MAXLENGTH_NICKNAME} caractères)`;

/**
 * Attribut `title` de l'élément `<input name="nickname">`.
 *
 * Utilisé pour indiquer à l'utilisateur la valeur attendue pour un pseudonyme.
 */
export const VALIDATION_NICKNAME_INFO: string = `
Pour qu'un pseudonyme soit considéré comme valide, ses caractères doivent
respecter, un format précis, les conditions suivantes :
	- Il ne doit pas commencer par le caractère '-' ou par un caractère
	  numérique '0..9' ;
	- Il peut contenir les caractères: alphanumériques, 'A..Z', 'a..z',
	  '0..9'. Les caractères alphabétiques des langues étrangères sont
	  considérés comme valides. Par exemple: le russe, le japonais, etc.
	- Il peut contenir les caractères spéciaux suivants: []\`_^{|}
`.trim();
