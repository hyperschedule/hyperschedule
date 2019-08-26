FROM ubuntu:19.04

ARG UID

COPY scripts/docker-install.bash /tmp/
RUN /tmp/docker-install.bash "$UID"

USER $UID
WORKDIR /home/docker/hyperschedule
RUN echo "yarn install" >> /home/docker/.bashrc

CMD bash
