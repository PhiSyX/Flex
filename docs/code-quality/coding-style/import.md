# Import

## Ordre des imports

Alphabétiquement.

1. Les types
2. Les modules natifs (node:, deno)
3. Les dépendances externes (module)
4. Nos paquets (@flex/module)
5. Fichiers locaux (@alias/file.ts, ../file.ts, ./file.ts)

## Taille max.

80

## Rust

Grouper les imports. Ne pas utiliser `self::*`, ni `crate::*`.

### Exemple

```diff
-use self::e::E
-use self::f::F;
-use crate::A;
-use crate::B;
-use crate::c::C;
-use crate::D;

+use self::{
+	e::E,
+	f::F,
+};
+
+use crate::{
+	A,
+	B,
+	c::{
+		C,
+	},
+	D,
+};

+ mod io {
+ 	pub(super) use std::io::*;
+
+ 	pub(super) use terminal::io::{confirm, Prompt};
+ }
+
+ use io::{Result, Prompt};
```

Essayer de n'importer que le dernier module d'une crate, et non chaque élément
d'un module à la fois (sauf pour les traits/interfaces).

### Exemple

```diff
use crate::MyTrait;
-use std::net::TcpStream;
+use std::net;
-use std::sync::mpsc::{Receiver, Sender};
+use std::sync::mpsc;

-type MyReceiver = Receiver<()>;
+type MyReceiver = mpsc::Receiver<()>;
-type MySender = Sender<()>;
+type MySender = mpsc::Sender<()>;

-fn process(stream: TcpStream, interface: impl MyTrait) {
+fn process(stream: net::TcpStream, interface: impl MyTrait) {
	// code...
}
```
