---
title: "deno.land/x/vscode を使って VSCode 拡張機能を作成する"
emoji: "🛠️"
type: "tech"
topics:
  - "deno"
  - "vscode"
published: false
published_at: "2022-12-10 10:00"
---

[Deno Advent Calendar 2023](https://qiita.com/advent-calendar/2023/deno) 10 日目の記事です

deno って便利ですよね. 複雑な設定なしに TypeScript を動作させることができ, [アドベントカレンダー 1 日目の記事](https://zenn.dev/magurotuna/articles/run-zenn-cli-with-deno)に書かれているように zenn CLI も Deno で動かすことができます. (現在動かしてみたところ macOS では動きましたが, Windows ではなぜか型エラーが発生してしまっています 😢)
https:// で始まる URL で TypeScript を import するところが好きです. 同じパッケージの違うバージョンを import してベンチマークをすることも簡単です

ところで VSCode 拡張機能を作成したことがありますか? 今回は Node.js を使わず Deno を使って VSCode 拡張機能を作成し公開する方法を解説します

# VSCode 拡張機能とは

Visual Studio Code 略して VSCode は Microsoft が開発しているオープンソースのテキストエディタです. このエディタのあらゆる機能を拡張できるのが VSCode 拡張機能です. [公式のドキュメント](https://code.visualstudio.com/api)

例えば, [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) という拡張機能を入れると, Git のブランチをグラフで表示でき, [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) という拡張機能を入れると, スペルミスを検出してくれます. [Luna Paint — Image Editor](https://marketplace.visualstudio.com/items?itemName=Tyriar.luna-paint)という画像エディタもあります. 拡張機能の[Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)のおかげで Deno のコードを書くときに色々補完してくれています

VSCode 拡張機能だからといって 「VSCode でのみ動く」というわけではありません.

- VSCode から Microsoft によるトラッキングコードなどを除いた [VSCodium](https://vscodium.com/)
- オンライン IDE [GitPod](https://www.gitpod.io/)
- 最近話題の AI を中心として設計されたエディタ [Cursor](https://cursor.sh/)

などで動作させることができます

また, [Web Extensions](https://code.visualstudio.com/api/extension-guides/web-extensions)の仕様に従っていれば, Web 版 VSCode の https://vscode.dev/ で動かすこともできます. GitHub リポジトリで `.` キーを押すことで開くことができる https://github.dev/ でも動かすことができます.

↓Web Extensions に一部機能が対応している拡張機能[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) を vscode.dev で動作させている
![vscode-web-python-extension](/images/vscode-web-python-extension.png)

似たようなものに, Github Codespaces がありますが, これは GitHub のサーバー内でコンテナを起動させているので, Web Extensions じゃなくても動作させることができますが, ある程度使うとお金がかかるようになっています.

# VSCode 拡張機能の構造

最終的に zip みたいに複数のファイルとフォルダーをまとめた VSIX というファイル形式にして拡張機能のレジストリにアップロードしますが, 以下のファイルの構造を出力すれば良いのです.

- package.json

  拡張機能の名前や作成者、ライセンス、拡張機能が提供するコマンド一覧、機能一覧、コード本体のパスなど

- README.md

  拡張機能の説明. 拡張機能のページに表示される

- CHANGELOG.md

  変更履歴. 拡張機能のページに表示される(用意しなくても公開できる)

- コード本体
  ファイル名は package.json で指定したパス. JavaScript で書かれている必要がある. Web Extensions に対応しないなら Node.js の標準モジュールを require することもできる

- アイコン画像
  ファイル名は package.json で指定されたパス. 拡張機能のページに表示される

その他

# VSCode 拡張機能の開発方法

公式ドキュメントでは, yo や generator-code をインストールしていますが, 不要です

## サンプル拡張機能の機能

## メイン

## クライアント

# VSCode 拡張機能の公開方法

オープンソースのほうも説明

https://open-vsx.org/extension/denoland/vscode-deno

VSCode の拡張機能を開発するには [VSCode Extension API](https://code.visualstudio.com/api) を使います

deno.land/x/vscode を使って VSCode 拡張機能を作成する方法を紹介します
