FROM ubuntu:focal

ARG UID

COPY scripts/docker-install.bash /tmp/
RUN /tmp/docker-install.bash "$UID"

USER $UID
WORKDIR /home/docker/hyperschedule

ENTRYPOINT ["/usr/local/bin/pid1.bash"]
CMD bash

COPY scripts/pid1.bash /usr/local/bin/
