---
title: "deno.land/x/vscode を使って VSCode 拡張機能を作成する"
emoji: "🛠️"
type: "tech"
topics:
  - "deno"
published: false
published_at: "2022-12-10 10:00"
---

[Deno Advent Calendar 2023](https://qiita.com/advent-calendar/2023/deno) 10 日目の記事です

deno って便利ですよね [アドベントカレンダー 1 日目の記事](https://zenn.dev/magurotuna/articles/run-zenn-cli-with-deno)に書かれているように zenn CLI も Deno で動かすことができます. (現在動かしてみたところ macOS では動きましたが, Windows ではなぜか型エラーが発生してしまっています 😢)
https:// で始まる URL で TypeScript を import するところが好きです. 同じパッケージの違うバージョンを import してベンチマークをすることも簡単です

ところで VSCode 拡張機能を作成したことがありますか? 今回は Node.js を使わず Deno を使って VSCode 拡張機能を作成し公開する方法を解説します

# VSCode 拡張機能とは

Visual Studio Code 略して VSCode は Microsoft が開発しているオープンソースのテキストエディタです. このエディタのあらゆる機能を拡張できるのが VSCode 拡張機能です.

例えば, [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) という拡張機能を入れると, Git のブランチをグラフで表示でき, [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) という拡張機能を入れると, スペルミスを検出してくれます.

# VSCode 拡張機能の構造

# VSCode 拡張機能の開発方法

## サンプル拡張機能の機能

## メイン

## クライアント

# VSCode 拡張機能の公開方法

オープンソースのほうも説明

VSCode の拡張機能を開発するには [VSCode Extension API](https://code.visualstudio.com/api) を使います

deno.land/x/vscode を使って VSCode 拡張機能を作成する方法を紹介します
