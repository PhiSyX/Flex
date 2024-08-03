# Style de codage

Ce projet utilise différents langages de programmation.

Pour chaque langage, un style de codage PEUT être imposé.

## Largeur maximale de chaque ligne

`80` caractères max. est recommandé.

## Indentation

`Tabulation`.

Nombre d'espaces par tabulation: `4`

## Fin de ligne

`Unix`

Les fins de ligne DOIVENT être converties en LF (`\n`).

## Accolades

Obligatoires, et sur la **même ligne** que les instructions.

Sauf pour les fonctions nommées, les méthodes nommées, les structures, les enums, les classes, les implémentations où
les accolades doivent se placer sur la ligne suivante. À noter que les fonctions anonymes sauvegardées dans des
variables ne sont pas des fonctions nommées.

## Virgule

Les virgules de fin d'éléments de n'importe quel type sont obligatoires.

**Exemple**:

```diff
let arr = [
	"hello",
+	"world", 	# correct
-	"world" 	# incorrect
];

let obj = {
 	a: "a",
+ 	b: "b", 	# correct
- 	b: "b" 		# incorrect
};
```

# Quote

Double pour les chaînes de caractères.
Simple pour un seul caractère.

**Exemple**:

```diff
+let str = "hello world";
-let str = 'hello world';

+ let ch = 'h';
- let ch = "h";

+let strch = `${ch}ello world`;
-let strch = ch + "ello world";
```

# Point-virgule

Obligatoire.

# Ordre du code

## Rust

1. Les imports (`mod`)
2. Les exports (`pub use`)
3. Les types / interfaces
4. Les constantes / variables statiques
5. Les structures / énumérations
6. Les implémentations
7. Les implémentations d'interfaces
8. Les fonctions
9. Les tests

On peut également s'aider de bloc de commentaires pour séparer les parties de
codes.

**Exemple**:

```rust
// ---- //
// Type //
// ---- //

type Alias1 = Type;
type Alias2 = Type2;
type Alias3 = Type3;

// --------- //
// Interface //
// --------- //

trait Interface 
{
	fn fn_without_body();
	fn fn_with_body() { ... }
}

// -------- //
// Constant //
// -------- //

const CONSTANT1: &str = "hello world";
const CONSTANT2: &str = "hello world";
const CONSTANT3: &str = "hello world";

// ------ //
// Static //
// ------ //

static STATIC1: Type = Type::static(CONSTANT1);
static STATIC2: Type = Type::static(CONSTANT2);
static STATIC3: Type = Type::static(CONSTANT3);

// --------- //
// Structure //
// --------- //

struct Structure 
{
	field1: Alias1,
	field2: Alias2,
	field3: Alias3,
}

// ----------- //
// Énumération //
// ----------- //

enum Enum 
{
	Alias1(Alias1),
	Alias2 { inner: Alias2, },
	Alias3(Alias3),
}

// -------------- //
// Implémentation //
// -------------- //

impl Structure 
{
	...
}

impl Enum 
{
	...
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Interface for Structure
{
	...
}

impl std::fmt::Display for Enum
{
	...
}

// ---- //
// Test //
// ---- //

#[cfg(test)]
mod tests {
	#[test]
	fn test_xxx() 
	{
		assert!(1 == 1);
	}
}
```

## TypeScript

1. Les imports
    1. Les imports de types (`import type`)
    2. Les imports (`import {}`)
2. Les types / interfaces
3. Les constantes
4. Les énumérations
5. Les classes
6. Les implémentations d'interfaces
7. Les fonctions
8. Les exports
    1. Les exports de types (`export type`)
    2. Les exports (`export {}`, `export default`)

```ts
import type Type from "...";
import type { Type } from "...";

import Toto from "...";
import Toto, { Tata } from "...";

// ---- //
// Type //
// ---- //

type Alias1 = Type;
type Alias2 = Type2;
type Alias3 = Type3;

// --------- //
// Interface //
// --------- //

interface Interface 
{
	field1: Alias1;
	field2: Alias2;

	method1(): this;
	method2();
}

// -------- //
// Constant //
// -------- //

const CONSTANT1: string = "hello world";
const CONSTANT2: string = "hello world";
const CONSTANT3: string = "hello world";

// ----------- //
// Énumération //
// ----------- //

const enum Enum 
{
	Alias1 = "alias1",
	Alias2 = "alias2",
	Alias3 = "alias3",
}

enum Enum 
{
	Alias1,
	Alias2,
	Alias3,
}

// -------------- //
// Implémentation //
// -------------- //

class Class1
{
	... 
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

class Class2 implements Interface
{
	...
}

// ------ //
// Export //
// ------ //

export type { Alias1, Alias2 };
export default Toto;
export { Toto, Tata };
```
