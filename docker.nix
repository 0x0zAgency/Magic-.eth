{ pkgs, buildDocker, buildImage, buildLayeredImage, fakeNss, pullImage, shadowSetup, buildImageWithNixDb, pkgsCross, streamNixShellImage ? import <nixpkgs> { } , pkgsLinux ? import <nixpkgs> { system = "x86_64-linux"; } }:

let
  # For now just overwrite these before you deploy.
  project_name = "infinitymint.app";
  project_path_in_server = "infinitymint_app";
  evalMinimalConfig = module: nixosLib.evalModules { modules = [ module ]; };
in rec {

  bash = buildImage {
    name = "bash";
    tag = "latest";
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      paths = [ pkgs.bashInteractive ];
      pathsToLink = [ "/bin" ];
    };
  };


  redis = buildImage {
    name = "redis";
    tag = "latest";

    # for example's sake, we can layer redis on top of bash or debian
    fromImage = bash;
    # fromImage = debian;

    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      paths = [ pkgs.redis ];
      pathsToLink = [ "/bin" ];
    };

    runAsRoot = ''
      mkdir -p /data
    '';

    config = {
      Cmd = [ "/bin/redis-server" ];
      WorkingDir = "/data";
      Volumes = {
        "/data" = {};
      };
    };
  };

  nginx = let
    nginxPort = "80";
    nginxConf = pkgs.writeText "nginx.conf" ''
            user nobody nobody;
            daemon off;
            error_log /dev/stdout info;
            pid /dev/null;
            events {}
            http {
              access_log /dev/stdout;
              server {
                listen ${nginxPort};
                index index.html;
                location / {
                  root ${nginxWebRoot};
                }
              }
            }
      			server {

              root /var/www/${project_path_in_server}/html;
              index index.html index.htm;

              server_name ${project_name};

              location / {
                try_files $uri $uri/ /index.html$is_args$args;
              }

      		    listen 80;
              listen [::]:80;

      			}
    '';
  in buildLayeredImage {
    name = "nginx-container";
    tag = "latest";
    contents = [ fakeNss pkgs.nginx ];

    extraCommands = ''
      mkdir -p tmp/nginx_client_body
      # nginx still tries to read this directory even if error_log
      # directive is specifying another file :/
      mkdir -p var/log/nginx
    '';

    config = {
      Cmd = [ "nginx" "-c" nginxConf ];
      ExposedPorts = { "${nginxPort}/tcp" = { }; };
    };
  };

  # 4. example of pulling an image. could be used as a base for other images
  nixFromDockerHub = pullImage {
    imageName = "nixos/nix";
    imageDigest = "sha256:85299d86263a3059cf19f419f9d286cc9f06d3c13146a8ebbb21b3437f598357";
    sha256 = "19fw0n3wmddahzr20mhdqv6jkjn1kanh6n2mrr08ai53dr8ph5n7";
    finalImageTag = "2.2.1";
    finalImageName = "nix";
  };
  # Same example, but re-fetches every time the fetcher implementation changes.
  # NOTE: Only use this for testing, or you'd be wasting a lot of time, network and space.
  testNixFromDockerHub = pkgs.testers.invalidateFetcherByDrvHash pullImage {
    imageName = "nixos/nix";
    imageDigest = "sha256:85299d86263a3059cf19f419f9d286cc9f06d3c13146a8ebbb21b3437f598357";
    sha256 = "19fw0n3wmddahzr20mhdqv6jkjn1kanh6n2mrr08ai53dr8ph5n7";
    finalImageTag = "2.2.1";
    finalImageName = "nix";
  };

  # 5. example of multiple contents, emacs and vi happily coexisting
  editors = buildImage {
    name = "editors";
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      pathsToLink = [ "/bin" ];
      paths = [
        pkgs.coreutils
        pkgs.bash
        pkgs.emacs
        pkgs.vim
        pkgs.nano
      ];
    };
  };

  # 6. nix example to play with the container nix store
  # docker run -it --rm nix nix-store -qR $(nix-build '<nixpkgs>' -A nix)
  nix = buildImageWithNixDb {
    name = "nix";
    tag = "latest";
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      pathsToLink = [ "/bin" ];
      paths = [
        # nix-store uses cat program to display results as specified by
        # the image env variable NIX_PAGER.
        pkgs.coreutils
        pkgs.nix
        pkgs.bash
      ];
    };
    config = {
      Env = [
        "NIX_PAGER=cat"
        # A user is required by nix
        # https://github.com/NixOS/nix/blob/9348f9291e5d9e4ba3c4347ea1b235640f54fd79/src/libutil/util.cc#L478
        "USER=nobody"
      ];
    };
  };

  # 7. example of adding something on top of an image pull by our
  # dockerTools chain.
  onTopOfPulledImage = buildImage {
    name = "onTopOfPulledImage";
    tag = "latest";
    fromImage = nixFromDockerHub;
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      pathsToLink = [ "/bin" ];
      paths = [ pkgs.hello ];
    };
  };

  # 8. regression test for erroneous use of eval and string expansion.
  # See issue #34779 and PR #40947 for details.
  runAsRootExtraCommands = pkgs.dockerTools.buildImage {
    name = "runAsRootExtraCommands";
    tag = "latest";
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      pathsToLink = [ "/bin" ];
      paths = [ pkgs.coreutils ];
    };
    # The parens here are to create problematic bash to embed and eval. In case
    # this is *embedded* into the script (with nix expansion) the initial quotes
    # will close the string and the following parens are unexpected
    runAsRoot = ''echo "(runAsRoot)" > runAsRoot'';
    extraCommands = ''echo "(extraCommand)" > extraCommands'';
  };

  # 9. Ensure that setting created to now results in a date which
  # isn't the epoch + 1
  unstableDate = pkgs.dockerTools.buildImage {
    name = "unstable-date";
    tag = "latest";
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      pathsToLink = [ "/bin" ];
      paths = [ pkgs.coreutils ];
    };
    created = "now";
  };

  # 10. Create a layered image
  layered-image = pkgs.dockerTools.buildLayeredImage {
    name = "layered-image";
    tag = "latest";
    extraCommands = ''echo "(extraCommand)" > extraCommands'';
    config.Cmd = [ "${pkgs.hello}/bin/hello" ];
    contents = [ pkgs.hello pkgs.bash pkgs.coreutils ];
  };

  # 11. Create an image on top of a layered image
  layered-on-top = pkgs.dockerTools.buildImage {
    name = "layered-on-top";
    tag = "latest";
    fromImage = layered-image;
    extraCommands = ''
      mkdir ./example-output
      chmod 777 ./example-output
    '';
    config = {
      Env = [ "PATH=${pkgs.coreutils}/bin/" ];
      WorkingDir = "/example-output";
      Cmd = [
        "${pkgs.bash}/bin/bash" "-c" "echo hello > foo; cat foo"
      ];
    };
  };


}
