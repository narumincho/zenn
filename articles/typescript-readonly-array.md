---
title: "TypeScript では T[] ではなく ReadonlyArray<T> を使おう"
emoji: "⚠️"
type: "tech"
topics:
  - "typescript"
  - "jsr"
published: true
published_at: "2025-08-11 18:00"
---

# TL;DR
公開 API では `T[]` を避け, `ReadonlyArray<T>` を使いましょう. 内部実装でのみ`Array<T>`を使うのはok

# Array<T> ではなく ReadonlyArray<T> を使おう

以下のコードには受け取った配列をソートして表示する sortLog 関数と, 0番目の要素を 999 にして表示する setLog 関数を定義して使用しています

```ts
const sortLog = (array: Array<number>): void => {
  console.log(array.sort((a, b) => a - b));
};

const setLog = (array: Array<number>): void => {
  array[0] = 999;
  console.log(array);
};

const array = [2, 1, 3];
sortLog(array); // [ 1, 2, 3 ]
setLog(array); // [ 999, 2, 3]
console.log(array); // [ 999, 2, 3]
```

[`Array.prototype.sort`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) や `array[index] = value` は破壊的変更をする仕様なため, 意図せず呼び出し元の配列を変更してしまいます. これを防ぐために `ReadonlyArray<T>` を使います

![typescript-readonly-array-error](/images/typescript-readonly-array-error.png)

このように [`Array.prototype.sort`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) や `array[index] = value` をしようとすると型エラーになり間違いに気づくことができます

破壊的変更をしない代わりのメソッドを使うと以下のようになります

```ts
const sortLog = (array: ReadonlyArray<number>): void => {
  console.log(array.toSorted((a, b) => a - b));
};

const setLog = (array: ReadonlyArray<number>): void => {
  console.log(array.with(0, 999));
};

const array: ReadonlyArray<number> = [2, 1, 3];
sortLog(array); // [ 1, 2, 3 ]
setLog(array); // [ 999, 1, 3]
console.log(array); // [ 2, 1, 3]
```

React のコンポーネントの Props など破壊的変更を使うことを意図していないのなら必ず `ReadonlyArray<T>` で指定することを強くおすすめします. そうすることによって`Array<T>` を「破壊的変更を意図している」という意味で使うことができます

- Deno KV の [Deno.KvKey](https://docs.deno.com/api/deno/~/Deno.KvKey)
- GraphQL サーバーの実装にほぼ使うであろう, 取得をまとめてするためのライブラリ [dataloader](https://github.com/graphql/dataloader) の DataLoader 定義に使う keys
  ![dataloader-keys-type.png](/images/dataloader-keys-type.png)
- サーバーレスデータベースの[xata lite](https://lite.xata.io/)のTypeScript SDK のIDの配列から一度に複数取得する`read`メソッド https://github.com/xataio/client-ts/issues/1286 (私が提案しました)

などで使われています


また, `ReadonlyArray<T>` の方が必要なメソッドが少ないため, `Array<T>` をそのまま受け取ることもできます

```ts
const sortLog = (array: ReadonlyArray<number>): void => {
  console.log(array.toSorted((a, b) => a - b));
};

const array: Array<number> = [2, 1, 3];

sortLog(array);     // [ 1, 2, 3 ]
console.log(array); // [ 2, 1, 3 ]
```

ほとんどの場合 `ReadonlyArray<T>` を使えばOKです

## Array<T> の方が分かりやすい例

直列でHTTP APIを呼ぶ例です

```ts
const apiGenerator = async function* (): AsyncGenerator<string, void, unknown> {
  for (const v of Array.from({ length: 3 }, (_, i) => i)) {
    const url = new URL("https://postman-echo.com/get");
    url.searchParams.set("v", `${v}`);
    yield (await (await fetch(url)).json()).args.v;
  }
};

const callApis = async (): Promise<ReadonlyArray<string>> =>
  await Array.fromAsync(apiGenerator());

console.log(await callApis()); // [ "0", "1", "2" ]
```

Async Generator を作るのが面倒なのも分かるので, `Array<T>` の変数の範囲が関数内に収まるのなら このように`Array<T>` を使っても良いと思います

```ts
const callApis = async (): Promise<ReadonlyArray<string>> => {
  const result: Array<string> = [];
  for (const v of Array.from({ length: 3 }, (_, i) => i)) {
    const url = new URL("https://postman-echo.com/get");
    url.searchParams.set("v", `${v}`);
    result.push((await (await fetch(url)).json()).args.v);
  }
  return result;
};

console.log(await callApis()); // [ "0", "1", "2" ]
```

# readonly T[] より ReadonlyArray<T> が好き

ReadonlyArray<T> と readonly T[] は意味は同じですが, ReadonlyArray<T> の方が以下の理由で好んで使っています

- T[] という配列のための専用構文ではなく, 他のジェネリックを使った指定と揃えることができる
- 入れ子になっていても分かりやすい
  ```ts
  type OuterA = readonly number[][];
  type OuterB = readonly (number[])[];
  type OuterC = ReadonlyArray<Array<number>>;

  type InnerA = (readonly number[])[];
  type InnerB = Array<ReadonlyArray<number>>;
  ```
  OuterA, OuterB, OuterC は外側の配列が読み取り専用で, 内側は変更可能
  InnerA, InnerB は外側の配列が変更可能で, 内側は読み取り専用
- VSCodeでCtrl+クリックなどでできる「定義への移動」でメソッドの一覧を見ることができる

要素数が事前に決まっている場合は readonly の記法しか使えないため 仕方ないですが readonly の記法で書きましょう

```ts
type Position = readonly [number, number, number];

const a: Position = [1, 2, 3];
```

# ReadonlyMap, ReadonlySet

`ReadonlyArray` の他にも TypeScript の標準ライブラリには `ReadonlySet<T>`, `ReadonlyMap<K, V>` があります. 積極的に使いましょう

```ts
const readonlySet: ReadonlySet<string> = new Set(["C", "B"]);
console.log(readonlySet.isSubsetOf(new Set(["A", "B", "C"]))); // true
const newSet: ReadonlySet<string> = new Set([...readonlySet, "D"]);
console.log(newSet); // Set(3) { "C", "B", "D" }
console.log(readonlySet); // Set(2) { "C", "B" }
```

```ts
const readonlyMap: ReadonlyMap<number, string> = new Map([
  [1, "A"],
  [2, "B"],
  [3, "C"],
]);
console.log(readonlyMap.get(2)); // B
const newMap: ReadonlyMap<number, string> = new Map([...readonlyMap, [
  2,
  "BB",
]]);
console.log(newMap); // Map(3) { 1 => "A", 2 => "BB", 3 => "C" }
console.log(readonlyMap); // Map(3) { 1 => "A", 2 => "B", 3 => "C" }
```

`ReadonlyArray` に比べて非破壊的に操作するメソッドがないため. 色々操作するときはスコープを関数中に収めて `Set` `Map` を使いましょう

# ReadonlyUint8Array, ReadonlyURL...

- Array に対応する ReadonlyArray
- Set に対応する ReadonlySet
- Map に対応する ReadonlyMap

があるなら

- Uint8Array に対応する ReadonlyUint8Array
- URL に対応する ReadonlyURL

などがあっても良いと思われますが, この Issue に書かれているように TypeScript の標準ライブラリには含めない方針のようです

https://github.com/microsoft/TypeScript/issues/37792

---

代わりに 私が JSRパッケージを作ったので良かったら使ってくださいね
- [ReadonlyUint8Array](https://jsr.io/@narumincho/readonly/doc/~/ReadonlyUint8Array)
- [ReadonlyURL](https://jsr.io/@narumincho/readonly/doc/~/ReadonlyURL)

https://jsr.io/@narumincho/readonly

他のReadonlyの型は適宜追加しようと思います. Issue, Pull Request 歓迎です

# オブジェクトの readonly

オブジェクトのプロパティに対しても `readonly` を指定することができます

```ts
type Account = {
  readonly id: string;
  readonly name: string;
};

const account: Account = {
  id: crypto.randomUUID(),
  name: "A",
};

account.name = "B"; // Cannot assign to 'name' because it is a read-only property.
```

できるだけ `readonly` を指定する方が良いと思います. タイプ数を少しでも減らしたい人は `Readonly<{ id: string; name: string }>` を使うこともできますが,

- React Props で使ったとき, StoryBook で型が解釈できないため [Controls](https://storybook.js.org/docs/essentials/controls)の表示が一部なくなる
- 再帰的には適用されない

ことに注意が必要です

私の個人のプロジェクトでは読み取り専用としか使わない場合は, 全部 readonly をつけています. 私は少しでも型安全性が上がるならタイプ数が増えても良いと考えていますが, タイプ数や余計な修飾子を付けたくない人もいるようです

## Object.freeze

[Object.freeze](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) を使って型チェック時だけでなく, 実行時にも読み取り不可にすることもできます

```ts
type Account = {
  readonly id: string;
  readonly name: string;
};

const account: Account = Object.freeze({
  id: crypto.randomUUID(),
  name: "A",
});

account.name = "B"; // Cannot assign to 'name' because it is a read-only property.
```

有名な読み取り専用のプロパティは `window.undefined` ですね

ただ あまり使われないため V8 などの JavaScript 実行エンジンの最適化が発揮されず遅くなることがあります. readonly を使った型チェック時だけの読み取り専用で充分バグを見つけられるため `Object.freeze` を使うことは少ないでしょう

# JavaScript への機能追加の提案の状況

## JavaScript Records & Tuples Proposal (撤回)
「JavaScript Records & Tuples Proposal」という提案がありましたが 今年 2025年に撤回されました

https://github.com/tc39/proposal-record-tuple/blob/d19ccc0372cb7140e6a9b7a010f6219233e552f1/README.md#L108-L127

https://github.com/tc39/proposal-record-tuple/issues/394

デフォルトで読み取り専用のステキな提案でしたが, 新たに構文とプリミティブ型を追加するのはとても大変なので撤回されたのは仕方ないと思います

## proposal Composites (Stage 1)

https://github.com/tc39/proposal-composites/blob/ae5ea98e7c966581f46af37e80f954335ad78948/README.md#L72-L80

https://github.com/tc39/proposal-composites

`Object.freeze` のようにオブジェクトをつくってから読み取り専用にするアプローチ. 例で挙げられているように`Set`, `Map` のキーでの活用が進みそう. それ以外のオブジェクトでは, 実行エンジンの最適化とTypeScriptが対応すれば使われると思われます

# 最後に

デフォルトが変更可能になってしまったTypeScriptでReadonlyを使おうという啓蒙活動をするよりも, デフォルトで読み取り専用になっているRustなどの言語の啓蒙活動のほうが, 各個人が覚えることが少なくて間違うことも減り良い気もする

# 参考

似たような主張の記事

https://azukiazusa.dev/blog/q-typescript-readonly-shorts/

諦めて readonly を使わない主張の記事

https://zenn.dev/snamiki1212/scraps/9006206a583a70
