FROM mcr.microsoft.com/vscode/devcontainers/base:0-buster

ENV DENO_INSTALL=/home/vscode/
RUN mkdir -p $DENO_INSTALL \
    && curl -fsSL https://deno.land/x/install/install.sh | sh \
    && chown -R vscode $DENO_INSTALL

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno

USER vscode
RUN deno install -qfAn vr https://deno.land/x/velociraptor/cli.ts

USER root
RUN ls /usr/local/bin
RUN mv /home/vscode/.deno/bin/vr /usr/local/bin


# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#    && apt-get -y install --no-install-recommends <your-package-list-here>
