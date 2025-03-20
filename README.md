# ブロックワールド

直感的3D積木体験アプリケーション

## プロジェクト概要

「ブロックワールド」は、子供たちがWebブラウザ上で直感的に3D積木体験ができるアプリケーションです。様々な形状のブロックを自由に配置し、創造性を発揮できる環境を提供します。

## 主な機能

- 3D空間での積木配置
- 複数種類のブロック（立方体、直方体、円柱、三角形、アーチなど）
- 直感的な操作（ドラッグ＆ドロップ、クリック操作）
- プロジェクト管理（保存、読み込み）
- 環境設定（背景色、地面テクスチャ、光源設定）

## 技術スタック

- React.js
- TypeScript
- Three.js
- React Three Fiber
- Zustand
- Styled-components

## インストール方法

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/block-world.git

# プロジェクトディレクトリに移動
cd block-world

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 使い方

1. 画面左上のボタンからブロックを選択
2. 3D空間上にブロックが配置されます
3. ブロックをクリックして選択し、移動または回転
4. Shiftキー + クリックまたはダブルクリックでブロックを削除

## 開発者向け情報

### プロジェクト構造

```
block-world/
├── src/
│   ├── components/       # UIコンポーネント
│   │   ├── blocks/       # 3Dブロックコンポーネント
│   │   └── ui/           # ユーザーインターフェース
│   ├── scenes/           # 3Dシーン
│   ├── store/            # 状態管理
│   ├── types/            # 型定義
│   └── utils/            # ユーティリティ関数
├── public/               # 静的ファイル
└── ...
```

### 将来の拡張予定

- ユーザー認証システム
- プロジェクト共有機能
- テンプレートライブラリ
- 物理演算機能
- モバイル対応

## ライセンス

MIT

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## お問い合わせ

質問や提案は[Issues](https://github.com/yourusername/block-world/issues)にてお願いします。
