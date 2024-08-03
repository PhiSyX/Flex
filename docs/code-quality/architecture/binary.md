# Binaire

- Un fichier source d'**exemple** DOIT être à l'intérieur d'un répertoire `examples/`.

- Un fichier source de **binaire** DOIT être à l'intérieur d'un répertoire `bin/` SAUF pour les cas suivants qui PEUVENT
ne pas respecter cette règle :

## Applications

Les modules à l'intérieur du répertoire [apps/**](apps/): 

1. Un nom de fichier binaire DOIT être nommé en `kebab-case`.

## Exemple

```bash
┌───(PhiSyX@フィジックス)
└── λ ls
    └── my-module/
        ├── bin/
        |   └── my-bin.ext
        └── examples/
            └── my-example.ext
```
