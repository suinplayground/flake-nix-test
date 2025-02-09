{ pkgs, ... }:

let
  system = pkgs.stdenv.hostPlatform.system;
  release = pkgs.lib.importJSON ./release.json;
  artifact = release.artifacts.${system} or (throw "Unsupported system: ${system}");
  pname = "kcl-cli";
  version = release.version;
  src = pkgs.fetchurl {
    inherit (artifact) url sha256;
  };

in
pkgs.stdenv.mkDerivation {
  inherit pname version src;

  dontBuild = true;

  meta = {
    mainProgram = "kcl";
  };

  setSourceRoot = ''
    sourceRoot=$PWD
  '';

  installPhase = ''
    mkdir -p $out/bin
    install -m755 kcl $out/bin/kcl
  '';
}
