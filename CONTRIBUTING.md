# Contributing Guide

## パッケージのハッシュ値の取得方法

パッケージのsha256ハッシュ値を取得する際は、必ずSRI（Subresource Integrity）フォーマットを使用してください。base32形式は場合によって正しく動作しないことがあるため、避けてください。

### 正しい方法

```bash
nix hash to-sri --type sha256 $(nix-prefetch-url https://github.com/appthrust/kutelog/releases/download/v0.1.0/kutelog-linux-arm64)
```

### 避けるべき方法

```bash
nix-prefetch-url https://github.com/kcl-lang/kcl/releases/download/v0.11.1/kclvm-v0.11.1-linux-arm64.tar.gz
```

SRIフォーマットを使用することで、パッケージの整合性を確実に検証することができ、より安定したビルドが可能になります。

## 実行可能ファイルのインストール方法

実行可能ファイルをインストールする際は、以下の2つのアプローチがあります：

### fetchurl での executable = true の使用

```nix
src = pkgs.fetchurl {
  url = "...";
  sha256 = "...";
  executable = true;
};

installPhase = ''
  mkdir -p $out/bin
  cp $src $out/bin/program    # 単純なコピー
'';
```

### install -m755 の使用（推奨）

```nix
src = pkgs.fetchurl {
  url = "...";
  sha256 = "...";
};

installPhase = ''
  mkdir -p $out/bin
  install -m755 $src $out/bin/program
'';
```

`install -m755` を使用するアプローチが推奨される理由：

1. **パーミッションの明示性**
   - `install -m755` は意図を明確に示します
   - ビルドスクリプトを読む人にとって権限設定が明確です

2. **Nixの慣習**
   - 多くのNixパッケージが `install` コマンドを使用しています
   - コミュニティの標準的なアプローチに従います

3. **柔軟性**
   - インストール時に異なる権限を設定する必要が出た場合に対応が容易です
   - パーミッション管理が一箇所に集中します

4. **再現性**
   - `install` コマンドの動作は予測可能で一貫性があります
   - システムに依存しない挙動が保証されます

従って、kutelogのパッケージでは現在の実装のように `install -m755` を使用するアプローチが適切です。`fetchurl` の `executable` フラグは特別な理由がない限り必要ありません。
