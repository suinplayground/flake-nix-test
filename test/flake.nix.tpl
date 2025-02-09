{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    tools.url = "path:{{ workspaceRoot }}";
  };

  outputs = { self, nixpkgs, flake-utils, tools }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        toolpkgs = import tools { inherit system nixpkgs; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            toolpkgs.{{ packageName }}
          ];
        };
      });
}
