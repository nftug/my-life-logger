# My Life Logger

日々の活動をカテゴリごとに記録し、時間の使い方を振り返るためのデスクトップアプリです。  
React と Tauri、Rust で構築されています。

## 主な機能

- カテゴリの作成・名前変更・削除と色の設定
- 進行中の活動を開始・停止・編集・キャンセル
- 完了済み活動の手動追加、編集、削除
- 今日の活動をタイムラインとカテゴリ別の合計時間で確認
- 過去の日付の記録を確認・編集
- ライト／ダークテーマの切り替え
- SQLite によるローカルデータ保存

## 技術スタック

| 領域 | 使用技術 |
| --- | --- |
| デスクトップ基盤 | Tauri 2 |
| フロントエンド | React 19、TypeScript、Vite、Tailwind CSS、DaisyUI |
| バックエンド | Rust 2024 edition |
| 永続化 | SQLite、SeaORM |
| テスト | Rust test、Vitest、Testing Library |

## 必要な環境

- [Rust](https://www.rust-lang.org/tools/install)（stable）
- [Bun](https://bun.sh/)
- [`cargo-make`](https://github.com/sagiegurari/cargo-make)
- Tauri 2 の開発に必要な OS 依存パッケージ

OS ごとの依存パッケージは [Tauri の前提条件ガイド](https://v2.tauri.app/start/prerequisites/) を参照してください。

`cargo-make` が未導入の場合は、次のコマンドでインストールできます。

```bash
cargo install cargo-make
```

## 開発を始める

```bash
git clone <repository-url>
cd my-life-logger
cargo make run
```

初回起動時は、必要なフロントエンド依存関係が自動でインストールされます。起動後は Tauri のデスクトップウィンドウが開き、フロントエンドはホットリロードされます。

依存関係だけを先にインストールする場合は、以下を実行します。

```bash
bun install --cwd frontend
```

## よく使うコマンド

| コマンド | 内容 |
| --- | --- |
| `cargo make run` | 開発モードでアプリを起動 |
| `cargo make build` | 配布用デスクトップアプリをビルド |
| `cargo make test` | Rust のテストを実行 |
| `cargo make check` | Clippy による静的解析 |
| `cargo make typegen` | Rust の Tauri コマンドから TypeScript 型を生成 |
| `cargo make migrate` | SeaORM のマイグレーションファイルを生成 |
| `cargo make migrate-fresh` | データベースを作り直してマイグレーションを実行 |
| `cargo make generate-entity` | 現在のスキーマから SeaORM エンティティを生成 |

フロントエンドのコマンドは `frontend` ディレクトリで実行します。

```bash
cd frontend
bun run test    # Vitest
bun run check   # TypeScript の型チェック
bun run lint    # ESLint
bun run format  # Prettier のフォーマット確認
```

## プロジェクト構成

```text
.
├── backend/
│   ├── domain/          # ドメインモデル・集約・リポジトリの抽象
│   ├── application/     # ユースケース・コマンド／クエリ・DTO
│   ├── infrastructure/  # SeaORM の実装・SQLite 接続
│   └── migration/       # データベースマイグレーション
├── frontend/
│   ├── src/             # React UI
│   └── src-tauri/       # Tauri コマンド・アプリ状態・イベント
├── Cargo.toml           # Rust ワークスペース
└── Makefile.toml        # 開発タスク
```

バックエンドは `domain`、`application`、`infrastructure` に分かれたレイヤードアーキテクチャです。Tauri 層がアプリケーションサービスとフロントエンドをつなぎ、進行中の活動時間をイベントで UI に通知します。

## データ保存先

活動データはローカルの SQLite データベースに保存されます。初回起動時にマイグレーションが自動適用されます。

- macOS: `~/Library/Application Support/com.harakazu.my-life-logger/my_life_logger.db`
- Windows / Linux: Tauri が提供するアプリ設定ディレクトリ配下

## ライセンス

このプロジェクトの `Cargo.toml` では MIT ライセンスを指定しています。ライセンス本文を配布する際は `LICENSE` ファイルを追加してください。
