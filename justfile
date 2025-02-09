# List available recipes
default:
    @just --list

# Run tests with Docker
test arch="amd64":
    docker run -it --rm -v $(pwd):/workspace -v /workspace/node_modules test:{{arch}} bash -c 'sudo chown developer:developer node_modules && npm install && npm run test'

# Setup buildx builder and build Docker images for linux/amd64 and linux/arm64
build:
    docker buildx create --use --name test || true
    docker buildx build --platform linux/amd64 -t test:amd64 --load .
    docker buildx build --platform linux/arm64 -t test:arm64 --load .

fish arch="amd64":
    docker run -it --rm --platform linux/{{arch}} -v $(pwd):/workspace -v /workspace/node_modules test:{{arch}} bash -c 'sudo chown developer:developer node_modules && exec fish'

format:
    biome check --fix
    nixpkgs-fmt .
