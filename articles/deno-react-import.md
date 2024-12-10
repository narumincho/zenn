---
title: 'Deno で import "npm:react" したときに型を扱えるように'
emoji: "🙌"
type: "tech"
topics:
  - "deno"
  - "react"
published: true
published_at: "2024-12-10 00:00"
---

[Deno Advent Calendar 2024](https://qiita.com/advent-calendar/2024/deno) 10 日目の記事です

「Monaco Editor で https インポートしたものモジュールの型を利用できるように」について書くつもりでしたが, 考慮するところが多くまとまらなかったため. Deno で React を使う上で遭遇した問題と対処法について書きます

## npm:react だけでは 型定義が利用できない問題

Deno では npm のパッケージを利用するときに npm プロトコルで指定して import することができます

```tsx
import React, { useState } from "npm:react";

export const App = () => {
  const [state, setState] = useState(false);

  return <div>{state}</div>;
};
```

しかし 一部のnpmパッケージでは型が読み取れず, エラーになってしまう場合がよくあります

![setStateを利用して作成した変数の型がanyになっている](/images/deno-react-import-any.png)

この例では, `setState`を利用して作成した変数の型が`any`になってしまっています

## npm:@types/react を利用して解決する方法

npmパッケージ自体に型定義を含めていない場合は, このように `npm:@types/パッケージ名` を利用する方法があります

```tsx
// @ts-types="npm:@types/react"
import React, { useState } from "npm:react";
```

![型が読み取れていてエラーがなくなっている](/images/deno-react-import-ok.png)

昔は `// @ts-types=` ではなく `// @deno-types=` でしたが, いつのまにか変わったようですね. deno の名前が消えたので, 共通で使えるようにしたいのでしょうか? Deno以外でこの`// @ts-types=`を利用するツールは見つけられませんでした

## esm.sh を利用して解決する方法

```tsx
// @ts-types="https://esm.sh/react@19.0.0"
import React, { useState } from "npm:react";
```

esm.shの場合, 対応する `@types/` のパッケージを指定することなく型定義を利用することができます

Denoの場合, 対応する`@types/`のパッケージを自動的に利用しません. 型定義が同一のバージョンで提供されている保証がないため. Deno では暗黙の`@types/`パッケージの利用はしないそうです

https://github.com/denoland/deno/issues/20455

@types/パッケージ名 で提供されるこの仕組みは分かりづらいため, Denoが期待するようにパッケージ自体に型定義を含めて欲しいですね. なぜ react パッケージに型定義を含めないのだろうか

bun のように `npm:` をつけなくても npmパッケージだと解釈し動かす. そんな短絡的な実装をしないDenoらしい選択ですね

## [番外] esm.sh で jsr を利用する方法

jsrパッケージ を`jsr:`でインポートしたときに 型定義エラーになることはありえないため利用することはあまり利用することがありませんが, npm と同様に 対応するesm.shのURLがあります

```ts
import {
  encodeBase64 as encodeBase64FromJsr,
  encodeBase64Url as encodeBase64UrlFromJsr,
} from "jsr:@std/encoding";
import {
  encodeBase64 as encodeBase64FromEsm,
  encodeBase64Url as encodeBase64UrlFromEsm,
} from "https://esm.sh/jsr/@std/encoding@1.0.5";
```

`https://esm.sh/jsr/` の次にjsrのパッケージ名ですね

`@`でバージョンを指定しているのは, 指定しないと青い波線が表示されるからですね. 今は `deno.lock` ファイルでリダイレクトがどう行われたかを残しているので, 指定しなくても良いと思いますが, 波線があると気になるのでバージョン名を指定しています. `https://esm.sh/react@19.0.0` も同様です

![Update specifier to its redirected specifier](/images/deno-import-redirect.png)

esm.sh のドキュメントどこにも書かれてる場所を見つけられませんでしたが, ここに jsr のパスを解釈するコードがあるのを見つけました

https://github.com/esm-dev/esm.sh/blob/a7cf10c171b359e24ae4e23419ec69e321d9cec9/server/path.go#L91

ありがたいことに, 型定義ファイルもHTTPレスポンスヘッダーで `Access-Control-Allow-Origin: *`を指定してくれているので, CORSエラーを気にすることなく, クライアントから直接型定義を取得して活用できます

---

今度は逆に, esm.sh の方が型定義を一部理解できていないようでした. https://esm.sh/v135/@jsr/std__encoding@1.0.5/_dist/base64url.d.ts が意図せず空になっています

```
Check file:///Users/narumi/Documents/GitHub/my-repo/main.ts
error: TS2724 [ERROR]: '"https://esm.sh/v135/@jsr/std__encoding@1.0.5/_dist/mod.d.ts"' has no exported member named 'encodeBase64Url'. Did you mean 'encodeBase64'?
  encodeBase64Url as encodeBase64UrlFromEsm,
  ~~~~~~~~~~~~~~~
    at file:///Users/narumi/Documents/GitHub/my-repo/main.ts:7:3

    'encodeBase64' is declared here.
     */ export declare function encodeBase64(data: ArrayBuffer | Uint8Array | string): string;
                                ~~~~~~~~~~~~
        at https://esm.sh/v135/@jsr/std__encoding@1.0.5/_dist/base64.d.ts:16:29
```

TypeScriptの型定義を対応漏れなく扱うのは難しいですね. esm.sh の Issues で報告しました

https://github.com/esm-dev/esm.sh/issues/947
