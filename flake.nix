{
  description = "www.eth Nix Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    yarn2nix = {
      url = "github:nix-community/yarn2nix";
      flake = false;
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ self, nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};
      yarn2nix = import inputs.yarn2nix {inherit pkgs;};
      builtProject = yarn2nix.mkYarnPackage {
        name = "www-eth_infinitymint";
        src = ./.;
        packageJSON = ./package.json;
        yarnLock = ./yarn.lock;
        # NOTE: this is optional and generated dynamically if omitted
        # yarnNix = ./yarn.nix;
      };
      reactFrontend = yarn2nix.mkYarnPackage {
        name = "www-eth_react_build";
        src = ./.;
        yarnLock = ./yarn.lock;
        packageJSON = ./package.json;
      };
    in {
      devShells.default = import ./shell.nix { inherit pkgs; };

      installHook = ''
        yarn set version berry
        yarn
      '';

      packages.www_eth = builtProject;
      packages.reactFrontend = reactFrontend;
      packages.default = self.packages.${system}.www_eth;
    }
  );
}

