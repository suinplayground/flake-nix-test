{
  description = "AppThrust Nix Packages";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        thispkgs = import ./. { inherit system nixpkgs; };
      in
      {
        packages = thispkgs;
        devShells =
          let
            # Auto-generate devShell for each package
            individualShells = builtins.mapAttrs
              (name: package:
                pkgs.mkShell {
                  buildInputs = [ package ];
                }
              )
              thispkgs;

            # Default devShell containing all packages
            defaultShell = pkgs.mkShell {
              buildInputs = builtins.attrValues thispkgs;
            };

            # Internal devShell
            internalShell = pkgs.mkShell {
              buildInputs = with pkgs; [
                biome
                nodejs_22
                nixpkgs-fmt
                fish
                just
              ];
            };
          in
          individualShells // {
            default = defaultShell;
            internal = internalShell;
          };
      });
}
