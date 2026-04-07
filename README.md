# GitHub Repository Search App

GitHubの公開リポジトリを検索し、一覧と詳細ページを表示する `Next.js App Router` ベースのWebアプリです。選考課題として、要件充足だけでなく、API境界の明確化、型安全性、テスト容易性、READMEの説明責務を意識して実装しています。

口頭説明・面談用に、設計判断の深掘りや想定Q&Aを [docs/interview-prep.md](docs/interview-prep.md) にまとめています（READMEとは役割を分け、こちらは理解・リハーサル向けです）。

## 動作環境

- Node.js **20.x** 推奨（Netlify / `.nvmrc` / CI と一致）
- npm 10 以上

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Netlify で公開する（無料枠・トークンなし）

ポートフォリオ用の**公開デモは `GITHUB_TOKEN` を設定しない**運用で問題ありません（未認証の GitHub API のレート制限内で動作します）。

1. このリポジトリを GitHub に push する（まだなら [GitHub で New repository](https://github.com/new) を作成し、remote を追加）。
2. [Netlify](https://www.netlify.com/) にログインし、「Add new site」→「Import an existing project」から該当リポジトリを選ぶ。
3. ビルド設定はリポジトリ直下の [`netlify.toml`](netlify.toml) が使われます（`NODE_VERSION=20`、`@netlify/plugin-nextjs`）。
4. **Environment variables には `GITHUB_TOKEN` を入れない**（空のままデプロイでよい）。必要なら `GITHUB_API_RATE_LIMIT_*` だけ調整可能。
5. 「Deploy site」を実行する。

CLI でデプロイする場合（要 `netlify login`）:

```bash
npm install
npx netlify deploy --build --prod
```

初回はブラウザまたはトークンで Netlify にログインする必要があります。サイト URL はデプロイ完了後に Netlify ダッシュボードで確認できます。

## 環境変数

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 任意 | GitHub APIのレート制限を緩和するためのトークン。未設定でも動作します。 |
| `GITHUB_API_RATE_LIMIT_MAX` | 任意 | Route Handler 経由の GitHub API 呼び出しの、クライアントキーあたりの最大回数（既定: 60）。 |
| `GITHUB_API_RATE_LIMIT_WINDOW_MS` | 任意 | 上記の集計ウィンドウ（ミリ秒、既定: 60000）。 |

## 主な技術選定

- `Next.js 15` + `App Router`
  - 課題要件に適合し、一覧ページと詳細ページを自然に分割しやすいためです。
- `TypeScript`
  - GitHub APIレスポンスの境界を明確にし、意図しないUI破壊を防ぎやすくするためです。
- `zod`
  - 外部APIレスポンスをパースし、壊れたレスポンスや型のズレを検出しやすくするためです。
- `Tailwind CSS`
  - コンポーネント単位でレイアウト調整を素早く行いやすく、課題の実装速度と一貫性を両立しやすいためです。
- `Vitest` + `React Testing Library` + `MSW`
  - GitHub APIへ直接依存しない安定したテストを用意し、主要導線の検証を自動化するためです。

## アーキテクチャ方針

- GitHub API呼び出しは `src/lib/github/client.ts` に集約しました。
- `src/app/api/github/...` の Route Handler からも同じロジックを利用できるようにし、UIからGitHub APIの仕様を直接意識しない構造にしています。
- 検索結果一覧と詳細ページはサーバーコンポーネントで描画し、URLクエリに検索状態を載せています。
- 一覧から詳細へ遷移する際に `q` と `page` を引き継ぎ、戻り導線で検索状態を維持できるようにしています。

## ディレクトリ構成

```text
src/
  app/
    api/github/                      Route Handlers
    repositories/[owner]/[repo]/    詳細ページ
    page.tsx                         検索一覧ページ
  components/                        UIコンポーネント
  lib/github/                        GitHub API連携とスキーマ
  lib/security/                      レート制限など
  lib/utils/                         表示ユーティリティ
tests/
  components/                        UIテスト
  lib/                               GitHubクライアントのテスト
  mocks/                             MSW設定
```

## 工夫した点・拘ったポイント

本課題は見た目の派手さより、**採点者がリポジトリだけで設計意図を追えるか**を重視しました。まず GitHub との通信を `src/lib/github/client.ts` に集約し、UI と Route Handler の両方から同じ関数を呼ぶようにしています。こうすると「トークンやレート制限、レスポンス整形の方針がどこで決まっているか」が一箇所にまとまり、課題文の「プロダクションを想定した実装」にもつながる境界の切り方だと考えています。`GITHUB_TOKEN` は `NEXT_PUBLIC_` を付けず、サーバー上でのみ参照する前提に固定しました。

一覧と詳細の関係では、ワイヤーにあった「ページネーションまたは無限スクロールの配慮」に対し、**ページネーション**を選びました。GitHub の検索 API が `page` / `per_page` 前提であること、`/?q=&page=` のように URL に状態を載せられること、テストで期待挙動を書きやすいこと、が主な理由です。詳細はモーダルではなく別ルートとし、一覧から遷移するときに `q` と `page` をクエリで引き継ぐので、**戻る操作で検索結果の文脈に戻りやすい**ようにしています。

データの扱いでは、GitHub の JSON をそのまま画面に流さず、アプリ内の一覧用・詳細用の型へ整形しています。あわせて `zod` でレスポンスをパースし、形が崩れている場合はユーザー向けに安全なエラーに落とすようにしました。入力側でも検索キーワードの最大長、`owner` / `repo` スラッグの形式検証、`encodeURIComponent` によるパス組み立てを行い、**想定外のパスや過長入力を早い段階で弾く**ように拘りました。ユーザー向けのエラーメッセージは、GitHub が返す生テキストをそのまま出さず、意図が伝わる固定文言に寄せています。

課題で求められる以上に、**公開 API としての運用リスク**にも触れたかったため、Route Handler にはクライアント識別子に基づくレート制限（インメモリ）と、`next.config` による主要なセキュリティヘッダを入れています。水平展開する本番では Redis 等への差し替えが必要になる点は README とコードコメントの意図として残しています。

### セキュリティ・運用（要点一覧）

- `owner` / `repo` の形式検証と `encodeURIComponent` によるパス構築
- 検索クエリ `q` の最大長（256 文字）
- ユーザー向けに GitHub の生エラーを返さない方針
- スキーマ不一致のレスポンスは 502 相当で扱い、破損データを UI に流さない
- `app/api/github/*` のレート制限（環境変数で閾値調整可）と 429 / `Retry-After`
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` 等のヘッダ

## テスト戦略

外部 API にテストが依存しないよう、**MSW で GitHub の応答を差し替え**たうえで、ドメイン層と主要 UI を分けて検証しています。E2E はコストとの兼ね合いで今回は入れていませんが、上記でデータ境界と表示の筋は押さえています。

- `tests/lib/github-client.test.ts` … 検索・詳細の整形、0 件、不正スラッグ・過長クエリの拒否、レート制限相当のエラー、汎用エラー時に内部メッセージがユーザー向け文言に漏れないこと
- `tests/lib/rate-limit.test.ts` … API 用レート制限のしきい値
- `tests/components/repository-search-result.test.tsx` … 一覧・ページネーション・空状態
- `tests/components/repository-detail-view.test.tsx` … 詳細の主要指標と戻るリンク

## 実行コマンド

```bash
npm run lint
npm run test
npm run build
```

## AI利用レポート

### 利用したもの

生成 AI は主に **Cursor 上のエディタ統合アシスタント**として利用しました。リポジトリ内のファイルをコンテキストに含めながら、実装・リファクタ・テスト追加・README 起稿を対話形式で進めています。別途 `cursor.md` や `.cursor/rules` に課題専用のルールファイルを置いたわけではありませんが、チャット上で **「課題要件」「App Router」「トークンはサーバーのみ」「テストと README を含める」** などの制約を繰り返し明示して利用しました。

### 何に使ったか（フェーズ別）

**要件・設計**では、課題文を機能要件・非機能要件・提出要件に分解し、実装の順序（設定 → API 層 → UI → テスト → ドキュメント）を整理するのに使いました。GitHub API をブラウザから直接呼ぶ案と、サーバー側に閉じたクライアント＋ Route Handler の案を比較する際も、論点の洗い出しに役立てました。

**実装**では、Next.js のルーティング、コンポーネント分割、`zod` によるスキーマ、MSW を使ったテストの骨子などを生成してもらい、**その都度**公式ドキュメントや型定義と突き合わせて修正しました。後半の **セキュリティ・プロダクション配慮**（スラッグ検証、レート制限、エラーメッセージの抑制、セキュリティヘッダ）も、指摘とコード案のたたき台として利用し、挙動とテストはローカルで確認しています。

**ドキュメント**では、README の章立て案、`docs/interview-prep.md` の面談用メモの構成案を出してもらい、内容は自分の説明できる範囲で書き直し・追記しました。

### 使い方の方針（プロンプトの考え方）

- 一度に広げすぎず、**「今のディレクトリ構成の前提で」「課題外の機能は増やさない」** と範囲を固定する。
- 出力は **コピペ一発で終わらせず**、`npm run lint` / `test` / `build` と実機操作で検証する。
- 不明な点は AI の断定を信じず、**GitHub REST API のエンドポイントや Next.js の挙動をドキュメントで確認**する。

### 人間側で必ず行った検証

- GitHub API のフィールドと課題で求められる表示項目の対応
- `search/repositories` と `GET /repos/{owner}/{repo}` の使い分け
- トークン・環境変数がクライアントバンドルに含まれないこと
- テストが仕様を表しているか（正常系だけで終わっていないか）

### 責任の所在

構成案やコード片の生成には AI を使いましたが、**採用する設計・マージする差分・提出物としての正しさの責任は自分**にあります。AI の提案をそのまま鵜呑みにした箇所はなく、最終的な文言とロジックはレビュー可能な状態になるよう整えています。

## 今後の改善余地

- 詳細ページ用の `generateMetadata` を実装し、SEOと共有時の情報量を改善する
- 検索条件の拡張（ソート、言語フィルターなど）を追加する
- PlaywrightによるE2Eテストを追加し、検索から詳細遷移までを実ブラウザで担保する
- GitHub APIのキャッシュ戦略を要件に応じて調整する
