FROM mcr.microsoft.com/vscode/devcontainers/base:0-buster

ENV DENO_INSTALL=/home/vscode/
RUN mkdir -p $DENO_INSTALL \
    && curl -fsSL https://deno.land/x/install/install.sh | sh \
    && chown -R vscode $DENO_INSTALL

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno

USER vscode
RUN deno install -qfAn vr https://deno.land/x/velociraptor/cli.ts

ENV PATH="/home/vscode/.deno/bin:$PATH"
# FIX VR ERROR
RUN mkdir /home/vscode/.deno/hatcher/
RUN echo '{"lastUpdateCheck":0}' > /home/vscode/.deno/hatcher/deno.land-velociraptor-_.json
# RUN echo  $VR_PATH >> ~/.zshrc
# RUN echo  $VR_PATH >> ~/.bashrc

RUN vr -V