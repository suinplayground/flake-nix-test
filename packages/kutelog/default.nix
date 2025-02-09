{ pkgs, ... }:

let
  system = pkgs.stdenv.hostPlatform.system;
  isAmdLinux = system == "x86_64-linux";
  release = pkgs.lib.importJSON ./release.json;
  artifact = release.artifacts.${system} or (throw "Unsupported system: ${system}");
  pname = "kutelog";
  version = release.version;
  src = pkgs.fetchurl {
    inherit (artifact) url sha256;
  };

in
pkgs.stdenv.mkDerivation {
  inherit pname version src;

  nativeBuildInputs = with pkgs; lib.optionals isAmdLinux [
    autoPatchelfHook
  ];

  buildInputs = with pkgs; lib.optionals isAmdLinux [
    stdenv.cc.cc.lib
  ];

  dontUnpack = true;
  dontBuild = true;

  installPhase = ''
    mkdir -p $out/bin
    install -m755 $src $out/bin/${pname}
  '';
}
