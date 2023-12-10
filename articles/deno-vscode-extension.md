---
title: "deno.land/x/vscode を使って VSCode 拡張機能を作成する"
emoji: "🛠️"
type: "tech"
topics:
  - "deno"
  - "vscode"
published: true
published_at: "2022-12-10 20:00"
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

↓ 一部機能が Web Extensions に対応している 拡張機能[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) を vscode.dev で動作させている
![vscode-web-python-extension](/images/vscode-web-python-extension.png)

似たようなものに, Github Codespaces がありますが, これは GitHub のサーバー内でコンテナを起動させているので, Web Extensions じゃなくても動作させることができますが, ある程度使うとお金がかかります

# VSCode 拡張機能の構造

最終的に zip みたいに複数のファイルとフォルダーをまとめた VSIX というファイル形式にして拡張機能のレジストリにアップロードしますが, 以下のファイルの構造を出力すれば良いのです

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

つまり Node.js で開発する必要はありません

# サンプル拡張機能

解説する上で, Deno の恐竜をファイルサイズによって伸ばすというカスタムエディタを追加する拡張機能を作成しました

https://github.com/narumincho/vscode-file-size-counter

https://youtu.be/oPfSgk4Oacs

Deno の恐竜に似てないって...? そこまで作り込む時間がなかった 😢

[Custom Editor API](https://code.visualstudio.com/api/extension-guides/custom-editors)を利用してカスタムエディタを作成します

# VSCode 拡張機能の開発方法

[公式ドキュメント](https://code.visualstudio.com/api/get-started/your-first-extension)では, yo や generator-code をインストールしていますが, 自前でファイルやビルドスクリプトを用意すれば不要です

まず最初に読み込まれる`package.json`拡張機能の名前, 開発者名, ライセンス, そして拡張機能が提供する機能を記述します. 型定義は用意されていない & まだ作ってないのでドキュメントを見ながら書きましょう

https://github.com/narumincho/vscode-file-size-counter/blob/6b55e53a518dfdf09d6db8cef731161e14c33abc/build.ts#L58-L96

`contributes` に拡張機能が提供する機能を記述しますが, ここに記述した機能が必要になったタイミングで, `browser` (Web Extension に対応しない機能の分は `main`) に指定した JavaScript の `activate` 関数が呼び出されます

https://github.com/narumincho/vscode-file-size-counter/blob/6b55e53a518dfdf09d6db8cef731161e14c33abc/main.tsx#L1-L24

TypeScript の記法と import があるので, ビルドスクリプト内で [deno.land/x/esbuild](https://deno.land/x/esbuild) と [deno.land/x/esbuild_deno_loader](https://deno.land/x/esbuild_deno_loader) を呼び VSCode 拡張機能向けの JavaScript に変換しています. 今回のサンプル拡張機能の機能は SSR だけで完結するので必要なかったのですが WebView 内で動作させるスクリプトも esbuild でビルドしています

## deno.land/x/vscode が必要な理由

ややこしいことに, Node.js の環境でもないのに `require("vscode")` で VSCode API をインポート形になってます

例として, このように記述すること, 右下の通知欄からメッセージを表示することができます.

```js
require("vscode").window.showInformationMessage("Hello World!");
```

![vscode-notification](/images/vscode-notification.png)

そしてこの VSCode API の型定義は, npm にて[@types/vscode](https://www.npmjs.com/package/@types/vscode)として公開されていますが, npm パッケージの[vscode](https://www.npmjs.com/package/vscode)は非推奨で使い物になりません! そのため, そのまま Deno で import して使うことはできないのです

そこで, Deno で使えるように調整した [deno.land/x/vscode](https://deno.land/x/vscode) を私が作成しました. VSCode のバージョンが上がるたびに手動で更新してます. 今日も更新しました.

手動と言っても, GitHub で公開されている型定義ファイルから Rust の [SWC](https://swc.rs/) を使って TypeScript のコードを解析して生成しています. class を型と値で分けるみたいなことなど. 完全には自動化できなかったので, 一部手動で修正しています

https://github.com/narumincho/vscode/blob/11a708181074ebef86ca32b41cacbbd527c34cbd/gen/src/main.rs#L9-L19

SWC の使い方メモはこちらに

https://zenn.dev/narumincho/articles/299f91c9ab3100

SWC は TypeScript のコードの解析だけじゃなくて実は生成もできるというね. あまり使われていないのかバグを見つけて報告しました. 速攻で修正されました. 活発なプロジェクトですね. Deno 内部で使われているだけありますね

https://github.com/swc-project/swc/issues/7079

## カスタムエディタの登録方法

activate 関数内でカスタムエディタの開かれたとき, 保存したときどうするかといった設定の`CustomEditorProvider`を [`vscode.window.registerCustomEditorProvider`](https://code.visualstudio.com/api/references/vscode-api#window.registerCustomEditorProvider) に渡してあげれば, カスタムエディタを登録できます

https://github.com/narumincho/vscode-file-size-counter/blob/6b55e53a518dfdf09d6db8cef731161e14c33abc/main.tsx#L46-L124

## WebView 内のスクリプト

WebView 内のスクリプトで完全な VSCode API は直接呼び出すことができませんが, メッセージを送るための API は window に生えているだけなので, npm パッケージの[vscode-webview](https://www.npmjs.com/package/@types/vscode-webview)を type import するだけで型定義を使えます

![import-vscode-webview](/images/import-vscode-webview.png)

メッセージの受け取りは `addEventListener("message", (e) => { ... })` でできます

https://github.com/narumincho/vscode-file-size-counter/blob/6b55e53a518dfdf09d6db8cef731161e14c33abc/client.tsx#L37-L41

## デバッグ方法

https://github.com/narumincho/vscode-file-size-counter/blob/main/.vscode/launch.json に設定を記述したので, VSCode の「実行とデバッグ」機能からデバッグできます. 左のメニューの再生のところです

# 配布するための形式の VSIX ファイルの作成

作成したファイルへカレントディレクトリを移動した後, 以下のコマンドで VSIX ファイルを作成できたらよかったのですが, Windows では型エラーで動作しませんでした...

```sh
deno run -A npm:@vscode/vsce package
```

Deno の Node.js 互換性が向上するまでは, 仕方なく Node.js で実行しましょう 🥺

```sh
npm install -g @vscode/vsce
vsce package
```

# VSCode 拡張機能の公開方法

VSCode の拡張機能のメニュー「Install from VSIX...」からインストールしてもらう形でもインストールできますが, レジストリにアップロードすることによって検索で引っかかり, アップデートの配布がしやすくなります.

- VSCode, vscode.dev, Github Codespaces 向けには, [Visual Studio Marketplace の VSCode](https://marketplace.visualstudio.com/vscode)
- VSCodium, GitPod 向けには, [Open VSX Registry](https://open-vsx.org/)

で公開する必要があります

実は主要なレジストリが 2 つあるんですね. たまに Visual Studio Marketplace でしか公開されていない拡張機能があるので, その場合は VSCodium, GitPod では使えません. 拡張機能の Deno は両方に公開しています. しっかりしてますね

- Visual Studio Marketplace 向け https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno
- Open VSX Registry 向け https://open-vsx.org/extension/denoland/vscode-deno

公開方法はドキュメントを参照してください

- [Visual Studio Marketplace での公開方法](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Registry での公開方法](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)

Open VSX Registry での名前空間を作成したあと, 認証マークを付けるには指定されたリポジトリで自分が所有している名前だと主張する Issue を作成することになります

僕の作成した narumincho の所有主張の issue はこちら

https://github.com/EclipseFdn/open-vsx.org/issues/1621

# まとめ

VSCode 拡張機能の実装は esbuild と 僕の作成した deno.land/x/vscode を利用することで比較的簡単にできます

VSIX ファイルの作成が現状 Deno でできないのが残念でしたが, Node.js で TypeScript の設定と向き合うよりは楽だと思います. ぜひ VSCode 拡張機能を開発するときは Deno で開発してみてください
