// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import vine, { SimpleMessagesProvider } from "@vinejs/vine";

vine.messagesProvider = new SimpleMessagesProvider({
	required: "Le champ « {{ field }} » est obligatoire.",

	string: "Le champ « {{ field }} » DOIT être une chaîne de caractères",
	email: "Le champ « {{ field }} » DOIT être une adresse e-mail valide",
	mobile: "Le champ « {{ field }} » DOIT être un numéro de téléphone valide",
	postalCode: "Le champ « {{ field }} » DOIT avoir un code postale valide",

	url: "Le champ « {{ field }} » DOIT être une URL valide",
	alpha: "Le champ « {{ field }} » DOIT contenir uniquement des lettres",
	alphaNumeric:
		"Le champ « {{ field }} » DOIT contenir uniquement des caractères alphanumérique, de A à Z et de 0 à 9.",
	minLength:
		"Le champ « {{ field }} » DOIT avoir au moins {{ min }} caractères",
	maxLength:
		"Le champ « {{ field }} » DOIT avoir au maximum {{ min }} caractères",
	confirmed:
		"Les champs « {{ field }} » & « {{ otherField }} » DOIVENT avoir la même valeur",

	range: "Le champ « {{ field }} » DOIT être entre {{ min }} et {{ max }} caractères.",

	"database.unique": "La valeur du champ « {{ field }} » existe déjà.",

	/*
  'required': 'The {{ field }} field must be defined',

  'string': 'The {{ field }} field must be a string',
  'email': 'The {{ field }} field must be a valid email address',
  'mobile': 'The {{ field }} field must be a valid mobile phone number',
  'creditCard': 'The {{ field }} field must be a valid {{ providersList }} card number',
  'passport': 'The {{ field }} field must be a valid passport number',
  'postalCode': 'The {{ field }} field must be a valid postal code',
  'regex': 'The {{ field }} field format is invalid',
  'ascii': 'The {{ field }} field must only contain ASCII characters',
  'iban': 'The {{ field }} field must be a valid IBAN number',
  'jwt': 'The {{ field }} field must be a valid JWT token',
  'coordinates': 'The {{ field }} field must contain latitude and longitude coordinates',
  'url': 'The {{ field }} field must be a valid URL',
  'activeUrl': 'The {{ field }} field must be a valid URL',
  'alpha': 'The {{ field }} field must contain only letters',
  'alphaNumeric': 'The {{ field }} field must contain only letters and numbers',
  'minLength': 'The {{ field }} field must have at least {{ min }} characters',
  'maxLength': 'The {{ field }} field must not be greater than {{ max }} characters',
  'fixedLength': 'The {{ field }} field must be {{ size }} characters long',
  'confirmed': 'The {{ field }} field and {{ otherField }} field must be the same',
  'endsWith': 'The {{ field }} field must end with {{ substring }}',
  'startsWith': 'The {{ field }} field must start with {{ substring }}',
  'sameAs': 'The {{ field }} field and {{ otherField }} field must be the same',
  'notSameAs': 'The {{ field }} field and {{ otherField }} field must be different',
  'in': 'The selected {{ field }} is invalid',
  'notIn': 'The selected {{ field }} is invalid',
  'ipAddress': 'The {{ field }} field must be a valid IP address',
  'uuid': 'The {{ field }} field must be a valid UUID',
  'ulid': 'The {{ field }} field must be a valid ULID',
  'hexCode': 'The {{ field }} field must be a valid hex color code',

  'boolean': 'The value must be a boolean',

  'number': 'The {{ field }} field must be a number',
  'number.in': 'The selected {{ field }} is not in {{ values }}',
  'min': 'The {{ field }} field must be at least {{ min }}',
  'max': 'The {{ field }} field must not be greater than {{ max }}',
  'range': 'The {{ field }} field must be between {{ min }} and {{ max }}',
  'positive': 'The {{ field }} field must be positive',
  'negative': 'The {{ field }} field must be negative',
  'decimal': 'The {{ field }} field must have {{ digits }} decimal places',
  'withoutDecimals': 'The {{ field }} field must be an integer',

  'accepted': 'The {{ field }} field must be accepted',

  'enum': 'The selected {{ field }} is invalid',

  'literal': 'The {{ field }} field must be {{ expectedValue }}',

  'object': 'The {{ field }} field must be an object',

  'array': 'The {{ field }} field must be an array',
  'array.minLength': 'The {{ field }} field must have at least {{ min }} items',
  'array.maxLength': 'The {{ field }} field must not have more than {{ max }} items',
  'array.fixedLength': 'The {{ field }} field must contain {{ size }} items',
  'notEmpty': 'The {{ field }} field must not be empty',
  'distinct': 'The {{ field }} field has duplicate values',

  'record': 'The {{ field }} field must be an object',
  'record.minLength': 'The {{ field }} field must have at least {{ min }} items',
  'record.maxLength': 'The {{ field }} field must not have more than {{ max }} items',
  'record.fixedLength': 'The {{ field }} field must contain {{ size }} items',

  'tuple': 'The {{ field }} field must be an array',
  'union': 'Invalid value provided for {{ field }} field',
  'unionGroup': 'Invalid value provided for {{ field }} field',
  'unionOfTypes': 'Invalid value provided for {{ field }} field',

  'date': 'The {{ field }} field must be a datetime value',
  'date.equals': 'The {{ field }} field must be a date equal to {{ expectedValue }}',
  'date.after': 'The {{ field }} field must be a date after {{ expectedValue }}',
  'date.before': 'The {{ field }} field must be a date before {{ expectedValue }}',
  'date.afterOrEqual': 'The {{ field }} field must be a date after or equal to {{ expectedValue }}',
  'date.beforeOrEqual':
    'The {{ field }} field must be a date before or equal to {{ expectedValue }}',

  'date.sameAs': 'The {{ field }} field and {{ otherField }} field must be the same',
  'date.notSameAs': 'The {{ field }} field and {{ otherField }} field must be different',
  'date.afterField': 'The {{ field }} field must be a date after {{ otherField }}',
  'date.afterOrSameAs': 'The {{ field }} field must be a date after or same as {{ otherField }}',
  'date.beforeField': 'The {{ field }} field must be a date before {{ otherField }}',
  'date.beforeOrSameAs': 'The {{ field }} field must be a date before or same as {{ otherField }}',

  'date.weekend': 'The {{ field }} field is not a weekend',
  'date.weekday': 'The {{ field }} field is not a weekday',

  "database.exists": 'The selected {{ field }} is invalid',
  */
});
