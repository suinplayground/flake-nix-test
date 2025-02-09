{ pkgs, ... }:

let
  system = pkgs.stdenv.hostPlatform.system;
  release = pkgs.lib.importJSON ./release.json;
  artifact = release.artifacts.${system} or (throw "Unsupported system: ${system}");
  pname = "kubectl-kcl";
  version = release.version;
  src = pkgs.fetchurl {
    inherit (artifact) url sha256;
  };

in
pkgs.stdenv.mkDerivation {
  inherit pname version src;

  dontBuild = true;

  sourceRoot = ".";

  installPhase = ''
    mkdir -p $out/bin $out/share/doc/${pname}
    install -m755 kubectl-kcl/bin/kubectl-kcl $out/bin/${pname}
  '';
}
