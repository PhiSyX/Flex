# Qualité du code

## Conventions de nommage

-   Architecture: [Paquet de module](./architecture/package.md),
    [binaire](./architecture/binary.md),
    [répertoire](./architecture/directory.md),
    [fichier](./architecture/file.md),
    [composant vue](./architecture/component.md),
    [custom element](./architecture/custom-element.md)

-   [Style de codage](./coding-style/index.md): [Type](./coding-style/type.md),
    [Interface / Trait](./coding-style/interface.md),
    [Constante/Static](./coding-style/constant.md),
    [Énumération](./coding-style/enum.md),
    [Structure](./coding-style/struct.md),
    [Variable](./coding-style/variable.md),
    [Fonction/méthode](./coding-style/function.md)

Quelque soit le nom / l'identifiant, chaque élément DOIT être assez explicite pour comprendre ce qu'il fait ou ce qu'il
contient. Un nom d'élément de à 1 ~ 3 caractères est à bannir de la codebase, sauf pour les noms standards / sigles
liées aux termes de l'informatique ou du métier.

## Exemple correct

1.  `id`, `ip`, `rx/tx`, ...
2.  `src` (`source`), `app` (`application`), `err` (`error`), `fmt`
    (`format`), ...
3.  `API`, `CLI`, `SQL`, `IRC`, `HTML`, ...

## Exemple correct, mais préférence pour...

1.  `cfg`. Préférer `config`.
2.  `db`. Préférer `database`.
3.  `msg`. Préférer `message`.

## Exemple incorrect

1.  `a1`
2.  `b2`
3.  `c3`
