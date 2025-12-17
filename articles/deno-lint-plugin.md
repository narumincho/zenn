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

Deno Lint は Deno に同梱された `deno lint` コマンドや VSCode 拡張機能で利用することができる TypeScript の Linter です

:::message
`deno lint .` ではなく `deno lint` だけで良くなりました `deno check` `deno fmt` も同様?
:::

詳しくは [17 日の記事](TODO) で書かれています

ESLint のプラグインと比較してファイルやネットワークへの外部アクセスがないことが保証されているところが好きです

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

![クイック編集のメニューを開いている](/images/deno-lint-plugin-fix.png)

なぜ, この書き方が好きか理由は この記事に書きました

https://zenn.dev/narumincho/articles/typescript-readonly-array

実装は Google Antigravity の Gemini 3 Pro に任せたところ `as any` を無駄に使っているコードだったので, 直接編集して調整しました

ESLint のプラグインと近い作りだったので AI

他のファイルを読み取れるか確認?

eslint.config.js のように TypeScript のコードではないため ルールの補完がでない (Deno LSP を変えれば補完がでるようにすることができるが難しそう)

パラメーターはなさそう
