{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript
    pkgs.nodePackages.pnpm
    pkgs.python3
    pkgs.gcc
    pkgs.pkg-config
    pkgs.openssl
    pkgs.libvips
    pkgs.cairo
    pkgs.pango
    pkgs.libjpeg
    pkgs.giflib
    pkgs.postgresql
    pkgs.redis
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.libffi
    pkgs.zlib
    pkgs.sqlite
  ];
}
