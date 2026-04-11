# スクリーンショット撮影メモ

## Windows でスクショを撮る方法

### 環境

このプロジェクトは devcontainer（Linux / WSL2 上の Docker）で開発しているため、
Windows 上で直接 `yarn dev` を実行することができない。
Wine で Electron を動かすのは Chromium との相性が悪くほぼ動作しないため、
以下の手順で Windows 向けバイナリをビルドして Windows 側から実行する。

---

### 手順

**1. devcontainer 内でビルド**

```bash
NODE_OPTIONS=--max-old-space-size=4096 yarn build && npx electron-builder --win --dir --publish never
```

インストーラーは作らず、`dist/win-unpacked/` に Windows 向けの実行ファイル一式を展開する。
Wine は不要。

> **メモ**: Monaco Editor のバンドルが大きいため、`NODE_OPTIONS` でヒープサイズを増やさないとビルド中に OOM で落ちる。
> devcontainer のメモリ割り当てが少ない場合は `8192` に上げる。
>
> **Wine エラーについて**: ビルド末尾に `wine is required` というエラーが出るが、これは exe へのバージョン情報書き込み（rcedit）が失敗しているだけ。`dist/win-unpacked/leavepad.exe` は生成済みで動作に支障はない。

**2. Windows にコピーして実行**

`\\wsl$\...` のネットワークパスから直接 `.exe` を実行しても起動しない。
必ず Windows のローカルパスにコピーしてから実行する。

WSL2 側から：

```bash
cp -r /workspaces/leavepad/dist/win-unpacked /mnt/c/tmp/leavepad
```

または Windows の PowerShell から：

```powershell
Copy-Item -Recurse "\\wsl$\Ubuntu\workspaces\leavepad\dist\win-unpacked" "C:\tmp\leavepad"
```

コピー後に `C:\tmp\leavepad\leavepad.exe` をダブルクリックで起動。

---

### スクリーンショットの撮り方

**ウィンドウサイズの固定: Sizer**

Sizer でウィンドウサイズを固定してからスクショを撮ると解像度が揃う。
タイトルバーを右クリック → Sizer メニューからサイズを指定する。

**スクショ撮影: PriScVista**

PriScVista でウィンドウ単位のキャプチャを撮る。

---

### サンプルデータ

`screenshots/sample-notes.json` をインポートすると見栄えのするノートが揃う。

Global Settings → General タブ → **Import notes** からファイルを選択する。

---

### ディレクトリ構成

```
screenshots/
├── README.ja.md        # このファイル
├── sample-notes.json   # スクショ用サンプルデータ
├── 20241104/           # 初期スクショ
├── 20241123/
└── 20260206/
```
