---
title: "TypeScriptでオーバーロードありのメソッドの型定義をreadonlyにする"
emoji: "🍞"
type: "tech"
topics: ["typescript", "jsr"]
published: true
---

## 問題点と解決策

Array の reduce メソッドはオーバーロードで設計されています
(オーバーロードを使わず[Elm](https://elm-lang.org/)のように初期値を指定する[foldl](https://package.elm-lang.org/packages/elm/core/latest/List#foldl)と初期値を指定しない[foldl1](https://package.elm-lang.org/packages/elm-community/list-extra/latest/List-Extra#foldl1)のように名前を変える設計の方が僕は好きですが...)

https://github.com/microsoft/TypeScript/blob/6d3be985c82bead3b41348de76efec8110c677c5/src/lib/es5.d.ts#L1458-L1470

間違ってすることはほぼないと思いますが,
`es5.d.ts`で使用されているメソッドの型定義の書き方では上書き可能です.
動作的にも合ってはいます.

```ts
const a = [1, 2, 3];
console.log(a.reduce((acc, val) => acc + val)); // 6
a.reduce = () => 999;
console.log(a.reduce((acc, val) => acc + val)); // 999

class Vector {
  constructor(readonly x: number, readonly y: number) {}

  distance() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

const v = new Vector(3, 4);
console.log(v.distance()); // 5
v.distance = () => 999;
console.log(v.distance()); // 999
```

ただ, このようなメソッドの上書きによるこの挙動は, 分かりずらいため このように
readonlyの関数のプロパティとして定義して上書きを禁止した方が良いです

```ts
class Vector {
  constructor(readonly x: number, readonly y: number) {}

  readonly distance = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
}

const v = new Vector(3, 4);
console.log(v.distance()); // 5
v.distance = () => 999; // Error: Cannot assign to 'distance' because it is a read-only property.
```

そして, オーバーロードの場合,
プロパティとして普通に定義すると重複の名前としてエラーになってしまいます

```ts
type Reduce<T> = {
  readonly reduce: (
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: number,
      array: T[],
    ) => T,
  ) => T;

  readonly reduce: <U>( // Duplicate identifier 'reduce'.
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[],
    ) => U,
    initialValue: U,
  ) => U;
};
```

以下の `FnA` と `FnB` が同じになることを利用して

```ts
import type { Equal, Expect } from "npm:@type-challenges/utils";

type FnA = (a: number, b: number) => number;

type FnB = {
  (a: number, b: number): number;
};

type cases = [
  Expect<Equal<FnA, FnB>>, // エラーなし
];
```

このように定義すれば,
オーバーロードありのメソッドの型定義をreadonlyにすることができるわけです

```ts
type Reduce<T> = {
  readonly reduce: {
    (
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => T,
    ): T;
    <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ): U;
  };
};
```

## @narumincho/readonly

`ReadonlyArray`, `ReadonlyMap`, `ReadonlySet` のような JavaScript
で標準的に使われる型のReadonlyバージョンをまとめた
[@narumincho/readonly](https://jsr.io/@narumincho/readonly)
というJSRのパッケージを開発しているので, 何か思いついたら Issue, Pull Request
を作成してくれるとありがたいです

https://github.com/narumincho/readonly

## 参考

https://qiita.com/suin/items/4a4582083f64171116f9
