FROM ubuntu:22.04

ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=1000

# Package Installation
#
# curl and xz-utils are required for Nix installation. sudo is needed for
# user creation, and ca-certificates is required for fetching dependencies
# from remote repositories like GitHub when executing nix develop.
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    sudo \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create Non-root User
#
# Since root user is not recommended in nix, we create a regular user.
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
USER $USERNAME
WORKDIR /home/$USERNAME


# Install Nix
#
# This installation method is a single-user installation that doesn't require
# a daemon. In single-user installation, packages are installed in the user's
# home directory and are not visible to other users, thus not affecting them.
# Details: https://nixos.org/manual/nix/stable/#sect-single-user-installation
#
# Installation must be performed by the created user. Therefore, we first
# create the user and then perform the installation as that user.
#
# By adding experimental-features = nix-command flakes to nix.conf,
# we enable the flakes feature of the nix command. This setting is essential
# as this project uses flake.nix.
RUN curl -L https://nixos.org/nix/install | sh -s -- --no-daemon \
    && mkdir -p ~/.config/nix \
    && echo "experimental-features = nix-command flakes" > ~/.config/nix/nix.conf
ENV PATH=/home/$USERNAME/.nix-profile/bin:$PATH \
    NIX_PATH=/home/$USERNAME/.nix-defexpr/channels

# Set Working Directory
ENV WORKSPACE_DIR=/workspace
RUN sudo mkdir -p $WORKSPACE_DIR \
    && sudo chmod 777 $WORKSPACE_DIR \
    && sudo chown $USERNAME:$USERNAME $WORKSPACE_DIR
WORKDIR $WORKSPACE_DIR

# Copy flake.nix
COPY flake.nix .
COPY flake.lock .
COPY default.nix .
COPY packages/ packages

# Execute nix develop
RUN nix develop --show-trace .#internal -c true

# Launch shell
ENTRYPOINT ["nix", "develop", "--show-trace", ".#internal", "-c"]
CMD ["fish"]
