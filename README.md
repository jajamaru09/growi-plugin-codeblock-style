# growi-plugin-codeblock-style

GROWI 用コードブロックスタイルプラグイン。Prism.js によるシンタックスハイライト、行番号、行ハイライト、diff表示、コマンドライン表示などの機能を提供します。

## 基本構文

コードブロックの言語指定に `prism-` プレフィックスを付け、コロン区切りでオプションを指定します。

````
```prism-言語名:オプション1:オプション2=値
コード
```
````

**例:**

````
```prism-javascript:toolbar:lineNumbers
const greeting = "Hello, World!";
console.log(greeting);
```
````

## オプション一覧表

| オプション | 形式 | デフォルト | 記述例 | 説明 |
|-----------|------|-----------|--------|------|
| `toolbar` | フラグ | off | `:toolbar` | 言語ラベルとコピーボタンを表示 |
| `lineNumbers` | フラグ | off | `:lineNumbers` | 行番号を表示 |
| `start` | 数値 | `1` | `:start=10` | 行番号の開始値 |
| `highlight` | 範囲 | なし | `:highlight=1,3-5,7` | 指定行をハイライト表示 |
| `diffHighlight` | フラグ | off | `:diffHighlight` | `+`/`-` による差分ハイライト |
| `commandLine` | フラグ | off | `:commandLine` | コマンドラインモード |
| `prompt` | 文字列 | `$` | `:prompt=#` | プロンプト文字列 |
| `user` | 文字列 | なし | `:user=root` | ユーザー名 (`user@host $` 形式) |
| `host` | 文字列 | なし | `:host=localhost` | ホスト名 (`user@host $` 形式) |
| `output` | 範囲 | なし | `:output=2-4` | 出力行 (プロンプトなし) |
| `filterOutput` | 文字列 | なし | `:filterOutput=(out)` | 出力行の接頭辞 (表示時に除去) |
| `continuationStr` | 文字列 | なし | `:continuationStr=\\` | 行継続マーカー |
| `continuationPrompt` | 文字列 | `>` | `:continuationPrompt=>` | 継続行のプロンプト |
| `filterContinuation` | 文字列 | なし | `:filterContinuation=(con)` | 継続行の接頭辞 (表示時に除去) |
| `copyText` | 文字列 | `Copy` | `:copyText=コピー` | コピーボタンのテキスト |
| `copySuccess` | 文字列 | `Copied!` | `:copySuccess=完了!` | コピー成功時のメッセージ |
| `copyTimeout` | 数値(ms) | `2000` | `:copyTimeout=3000` | 成功メッセージの表示時間 |

> **フラグ**: オプション名のみで有効化 (例: `:toolbar`)
> **範囲**: カンマ区切りで個別行・範囲を指定 (例: `1,3-5,7`)

## オプション詳細

### 表示系

| オプション | 形式 | 説明 |
|-----------|------|------|
| `toolbar` | フラグ | 言語ラベルとコピーボタンを表示 |
| `lineNumbers` | フラグ | 行番号を表示 |
| `start=N` | 値 | 行番号の開始値 (デフォルト: 1) |
| `highlight=範囲` | 値 | 指定行をハイライト (例: `1,3-5,7`) |

### Diff表示

| オプション | 形式 | 説明 |
|-----------|------|------|
| `diffHighlight` | フラグ | `+`/`-` による差分ハイライトを有効化 |

言語名を `diff-言語名` とすると、diff表示と言語別ハイライトを同時に適用できます。

````
```prism-diff-javascript:toolbar
-const old = "before";
+const updated = "after";
```
````

### コマンドライン

| オプション | 形式 | 説明 |
|-----------|------|------|
| `commandLine` | フラグ | コマンドラインモードを有効化 |
| `prompt=文字列` | 値 | プロンプト文字列 (デフォルト: `$`) |
| `user=名前` | 値 | ユーザー名 (例: `root`) |
| `host=名前` | 値 | ホスト名 (例: `localhost`) |
| `output=範囲` | 値 | 出力行の範囲 (プロンプトなし) |
| `filterOutput=接頭辞` | 値 | 出力行を示す接頭辞 (表示時に除去) |
| `continuationStr=文字列` | 値 | 行継続マーカー (例: `\\`) |
| `continuationPrompt=文字列` | 値 | 継続行のプロンプト (デフォルト: `>`) |
| `filterContinuation=接頭辞` | 値 | 継続行を示す接頭辞 (表示時に除去) |

`user` と `host` を指定すると `user@host $` (rootの場合は `#`) 形式のプロンプトが自動生成されます。

### コピーボタン

| オプション | 形式 | 説明 |
|-----------|------|------|
| `copyText=文字列` | 値 | コピーボタンのテキスト |
| `copySuccess=文字列` | 値 | コピー成功時のメッセージ |
| `copyTimeout=ミリ秒` | 値 | 成功メッセージの表示時間 |

## 使用例

### ツールバー付きコードブロック

````
```prism-python:toolbar
def hello():
    print("Hello, World!")
```
````

### 行番号 + 行ハイライト

````
```prism-javascript:lineNumbers:highlight=2,4-5
const a = 1;
const b = 2;  // ハイライトされる
const c = 3;
const d = 4;  // ハイライトされる
const e = 5;  // ハイライトされる
```
````

### 行番号の開始値を指定

````
```prism-javascript:lineNumbers:start=10
// 10行目から開始
const x = 42;
```
````

### コマンドライン (カスタムプロンプト)

````
```prism-bash:commandLine:user=root:host=server
apt update
apt install nginx
systemctl start nginx
```
````

上記は各行の先頭に `root@server #` が表示されます。

### コマンドライン (出力行あり)

````
```prism-bash:commandLine:prompt=$:output=2-4
ls -la
total 32
drwxr-xr-x  5 user user 4096 Mar 29 10:00 .
-rw-r--r--  1 user user  256 Mar 29 10:00 file.txt
echo "done"
```
````

2〜4行目は出力としてプロンプトなしで表示されます。

### Diff + 言語ハイライト

````
```prism-diff-typescript:toolbar:lineNumbers
-interface OldConfig {
-  name: string;
-}
+interface NewConfig {
+  name: string;
+  version: number;
+}
```
````

### 全部入り

````
```prism-javascript:toolbar:lineNumbers:highlight=3-4:start=1
function greet(name) {
  const message = `Hello, ${name}!`;
  console.log(message);   // ハイライト
  return message;          // ハイライト
}
```
````

## 対応言語

| カテゴリ | 言語 (エイリアス) |
|---------|-----------------|
| Web | JavaScript (`js`), JSX, TypeScript (`ts`), TSX, CSS, SCSS, JSON, YAML (`yml`), TOML, GraphQL, Regex, HTML/XML |
| Systems | C, C++, C# (`cs`), Rust, Go, Java, Swift, Kotlin |
| Scripting | Python (`py`), Ruby (`rb`), Bash (`sh`, `shell`), PowerShell (`ps1`), Perl, PHP, Batch (`bat`), AutoHotkey (`ahk`) |
| .NET | VB (`vbnet`, `vba`), Razor C# (`cshtml`, `razor`) |
| Other | SQL, MongoDB, Markdown (`md`), Diff, Docker (`dockerfile`), Git, .ignore (`gitignore`), Apache Conf, Apex, Arduino, Smalltalk |

## テーマ

GROWI のダーク/ライトモード設定に自動対応します。

- ダークモード: One Dark テーマ
- ライトモード: One Light テーマ
