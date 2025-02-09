{ system, nixpkgs }:

let
  pkgs = import nixpkgs { inherit system; };

  packageDirs = builtins.attrNames (builtins.readDir ./packages);
  packages = builtins.listToAttrs (map
    (name: {
      inherit name;
      value = pkgs.callPackage (./packages + "/${name}") { };
    })
    packageDirs);
in
packages
