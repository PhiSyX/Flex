# Notes

1. Les composants Vue à l'intérieur du dossier `src/` peuvent accéder aux stores. 

2. Les composants Vue à l'intérieur du dossier `sys/` n'accèdent pas aux stores. C'est totalement voulu.

## À améliorer

-   L'organisation. Encore et toujours.

-   Éviter d'utiliser `localStorage`. Ca n'est pas une priorité.

-	Éviter de caster avec `as`, surtout pour les types Opaque.

-   Utiliser des schémas de validation pour autoriser les données du serveur à être utiliser par notre application. 
    Ca n'est pas une priorité.

-   Accès aux assets, l'idéal est de créer un package npm à la racine du projet  `@phisyx/flex-assets`.

**assets/package.json**:

```json
{
	"name": "@phisyx/flex-assets",
	"version": "0.1.0",
	"private": true,
	"publishConfig": {
		"access": "public"
	}
}
```

**config/flex/server.yml**:

```yaml
static_resources:
  - url_path: /assets
    dir_path: /@fs/<root>/assets/ # par Vite (ex: /@fs/C:/Users/phisyx/Flex/assets/fonts/....)
```

    Pour le moment, il n'est pas possible avec notre serveur de pouvoir définir ce genre de chemin de répertoire.
    Notamment dû à une limitation de la bibliothèque `tower-http`, qui émet une erreur au runtime.

## Configuration TypeScript et les imports de types

Si l'import de type depuis un alias fait boguer la compilation + le runtime

**EXEMPLE** :

```js
import type { MyType } from "alias:~/types";
```

**ERROR**:

```sh
[vite] Internal server error: [@vue/compiler-sfc] Failed to resolve import source "alias:~/types".

/Flex/apps/flex-chat-webapp/src/MyFile.vue
5  |  import { MyType } from "alias:~/types";
6  |
7  |  const props = defineProps<MyType>();
   |                            ^^^^^^
8  |  </script>
9  |
  Plugin: vite:vue
  File: /Flex/apps/flex-chat-webapp/src/MyFile.vue
      <stacktrace>
```

Veillez à ce que le fichier de configuration de tsconfig inclue les fichiers TypeScript.

**EXEMPLE**:

```json
{
	"include": ["path/to/FILE.ts"]
}
```

À savoir que la configuration ci-bas est insuffisante:

**EXEMPLE Incorrect**:

```json
{
	"include": ["path/to/DIRECTORY"]
}
```

Il faut impérativement ajouter les caractères génériques `*` à la suite d'un nom de répertoire.

**EXEMPLE Correct**:

```json
{
	"include": ["path/to/DIRECTORY/**"]
}
```

## Déstructuration des `props` de Vue.

La déstructuration des propriétés fait perdre le signal de la réactivité.

**EXEMPLE** INCORRECT:

```ts
interface Props {
	num: number;
}
const derivedProps = ({ num }: Props) => computed(() => num * 2);
```

**EXEMPLE** CORRECT:

```ts
interface Props {
	num: number;
}
const derivedProps = (props: Props) => computed(() => props.num * 2);
```
