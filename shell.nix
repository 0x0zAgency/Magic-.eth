{ pkgs ? import <nixpkgs> { } }:
with pkgs;

mkShell {
    buildInputs = [
        jq
        nodejs
		ripgrep
		git-up
		postgresql_12
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        alias scripts='jq ".scripts" package.json'
		alias run='npm run'
        alias g='git' \
            ga='g add' \
            gl='g pull' \
            gf='g fetch' \
            gp='g push' \
            gst='g status' \
            gcm='g commit -m' \
            gcmsg='g add -A; g commit -am'
    '';
}