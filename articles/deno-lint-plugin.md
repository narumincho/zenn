---
title: "Deno Lint Plugin で T[] を Array<T> にさせる"
emoji: "✒️"
type: "tech"
topics:
  - "deno"
  - "lint"
published: true
published_at: "2025-12-19 00:00"
---

[Deno Advent Calendar 2025](https://qiita.com/advent-calendar/2025/deno) 19 日目の記事です

Deno Lint は Deno に同梱された TypeScript の Linter です. `deno lint` コマンドや Deno VSCode 拡張機能から利用することができます

:::message
ちなみに Deno のバージョンアップで `deno check .` ではなく `deno check` [だけで良くなりました](https://github.com/denoland/deno/pull/28655) `deno lint` `deno fmt` も同様(いつからできていたかは忘れました)
:::

Deno Lint について詳しくは [17 日の記事](TODO) で書かれています

ESLint のプラグインと比較してファイルやネットワークへの外部アクセスがないことが保証されておりセキュリティ的に優れているところが好きです

欲を言えば, Web ブラウザの Monaco Editor で動いて欲しいのですが 難しそうではありますね

この Deno Lint には ESLint と同様にプラグインを作成することができます

https://docs.deno.com/runtime/reference/lint_plugins/

Deno Advent Calendar を 4 年連続で書くネタを作るために, Deno Lint の 簡単な Plugin を作成してみました

# jsr:@narumincho/type-lint

https://jsr.io/@narumincho/type-lint

![VSCodeでreadonly number[]が警告されている](/images/deno-lint-plugin-warn.png)

README.md に書かれているように

- `T[]` → `Array<T>`
- `readonly T[]` → `ReadonlyArray<T>`

というように, 配列の書き方を 他のジェネリクスと揃えさせます

![VSCodeでクイック編集のメニューを開いている](/images/deno-lint-plugin-fix.png)

`deno lint --fix` やクイック編集の fix で このコードになります

```ts
const array: ReadonlyArray<number> = [1, 2, 3, 4, 5];
```

なぜ, この書き方が好きか理由は この記事に書きました

https://zenn.dev/narumincho/articles/typescript-readonly-array

実装は Google Antigravity の Gemini 3 Pro に任せたところ 無駄に `as any` を使っているコードを生成しました

`as any`を使わないように直接調整し JSR に公開しました

ESLint のプラグインと近い API だったので AI 的にも生成しやすかったと思います

# もっと高度な Lint Plugin を実装するとしたら

```ts
function removeEmptyStringInArray(array: Array<string>): Array<string> {
  return array.filter((item) => item !== "");
}
```

のような破壊的メソッドを使っていない `array` の型を `ReadonlyArray` にする Lint ルールを作ろうとしました

以下のように他のモジュールの関数を import して使う場合も考えられます

```ts
import { otherFunction } from "./other-module.ts";

function sampleFunction(array: Array<string>): void {
  otherFunction(array);
}
```

:::message

```ts:other-module.ts
export function otherFunction(array: Array<string>) {}
```

か

```ts:other-module.ts
export function otherFunction(array: ReadonlyArray<string>) {}
```

かわからない
:::

他のファイルの関数の型や実装の情報が欲しくなりますが, Deno Lint Plugin では他のファイルを読み取って使うことはできないようです

React の フックのように関数名で `use` から始まるみたいな制約があれば, 厳密に作れたかなと思います

コンポーネント(大文字で始まる関数)やフックではない普通の関数でフックを使うとエラーになる React フック の Lint ルール は Deno Lint Plugin で作れると思います

# その他

ESLint の設定ファイルは `eslint.config.ts` で TypeScript の import 文を使ってプラグインを指定するため, 指定ミスを設定ファイル上ですぐに確認することができるが

Deno Lint の設定ファイルは `deno.json` であるため TypeScript のチェック機能を利用することはできません

Deno VSCode 拡張機能/Deno LSP で deno.json の補完を強化させようと思ったが, 現状 固定の JSON Schema を指定しているだけなので

https://github.com/denoland/vscode_deno/blob/c7ad27c8b2077946b1f64d90269be4de5be968f0/package.json#L609

動的にチェックするようにしても, deno.json は多くの機能で使われておりメンテナンスが大変そう & `deno lint`コマンドを実行すれば指定ミスがわかるので 特になにもしないことに決めました

あと, Lint ルールを調整するパラメーターを定義, 使う方法はなさそうです
