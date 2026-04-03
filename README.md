# GitHub Repository Search App

GitHubの公開リポジトリを検索し、一覧と詳細ページを表示する `Next.js App Router` ベースのWebアプリです。選考課題として、要件充足だけでなく、API境界の明確化、型安全性、テスト容易性、READMEの説明責務を意識して実装しています。

口頭説明・面談用に、設計判断の深掘りや想定Q&Aを [docs/interview-prep.md](docs/interview-prep.md) にまとめています（READMEとは役割を分け、こちらは理解・リハーサル向けです）。

## 動作環境

- Node.js 18.20.x 以上
- npm 10 以上

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 環境変数

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 任意 | GitHub APIのレート制限を緩和するためのトークン。未設定でも動作します。 |

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
  lib/utils/                         表示ユーティリティ
tests/
  components/                        UIテスト
  lib/                               GitHubクライアントのテスト
  mocks/                             MSW設定
```

## 実装上の工夫

- GitHub APIの生レスポンスをそのままUIへ流さず、一覧表示用・詳細表示用の型に整形しています。
- 失敗系として、入力バリデーションエラー、API取得失敗、レート制限、0件ヒットを考慮しています。
- 一覧は無限スクロールではなくページネーションにしています。
  - 課題の主眼に対して実装コストと検証容易性のバランスが良く、URL共有もしやすいためです。
- 詳細画面はモーダルではなくページ遷移にし、戻る導線で一覧に復帰しやすいUXにしています。
- `GITHUB_TOKEN` はサーバー側でのみ利用し、クライアントへ露出しない構成にしています。

## テスト戦略

- `tests/lib/github-client.test.ts`
  - GitHub APIレスポンス整形、0件時、詳細取得、レート制限時のエラーマッピングを検証します。
- `tests/components/repository-search-result.test.tsx`
  - 検索結果一覧とページネーション、0件時表示を検証します。
- `tests/components/repository-detail-view.test.tsx`
  - 詳細ページで必要な主要情報が描画されることを検証します。

## 実行コマンド

```bash
npm run lint
npm run test
npm run build
```

## AI利用レポート

この課題ではAIを以下の用途で利用しました。

- 要件整理
  - 課題文を機能要件、非機能要件、提出要件に分解し、実装優先順位を整理しました。
- 設計検討
  - GitHub APIを直接叩く構成と、Route Handler/サービス層を挟む構成を比較し、提出品質の観点から後者を採用しました。
- テスト観点の洗い出し
  - 正常系だけでなく、0件、API失敗、レート制限、戻る導線などの観点を洗い出しました。
- READMEの構成整理
  - 採点者が意思決定を追いやすい章立てと記述観点を整理しました。

AIの出力をそのまま採用せず、以下は必ず確認・修正しました。

- GitHub APIのレスポンス項目と要件の対応関係
- Next.js App Routerでのページ設計
- テストが実装の表面をなぞるだけになっていないか
- READMEが単なる手順書で終わらず、技術選定理由まで説明できているか

また、AIに対しては以下のような制約を与えて利用しました。

- 課題要件から外れた過剰実装を避ける
- 依存ライブラリの採用理由を説明可能にする
- サーバー側にトークンを閉じ込める
- READMEにAI利用内容を明記する

最終的な設計判断、コード修正、検証の責任は自分で持つ前提で利用しています。

## 今後の改善余地

- 詳細ページ用の `generateMetadata` を実装し、SEOと共有時の情報量を改善する
- 検索条件の拡張（ソート、言語フィルターなど）を追加する
- PlaywrightによるE2Eテストを追加し、検索から詳細遷移までを実ブラウザで担保する
- GitHub APIのキャッシュ戦略を要件に応じて調整する
