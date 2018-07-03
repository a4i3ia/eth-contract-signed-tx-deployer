FROM heroku/heroku:16

RUN apt-get update 

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node#release-team
RUN set -ex \
  && for key in \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
    77984A986EBC2AA786BC0F66B01FBB92821C587A \
  ; do \
    gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done

ENV NODE_VERSION 8.10.0

RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
  && case "${dpkgArch##*-}" in \
    amd64) ARCH='x64';; \
    ppc64el) ARCH='ppc64le';; \
    s390x) ARCH='s390x';; \
    arm64) ARCH='arm64';; \
    armhf) ARCH='armv7l';; \
    i386) ARCH='x86';; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.gz" \
  && curl -SLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-$ARCH.tar.gz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-$ARCH.tar.gz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.gz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

RUN apt-get install -y build-essential

RUN mkdir /opt/blockchain && \
    mkdir /opt/blockchain/datadir && \
    mkdir /etc/my_init.d

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN apt-get update
RUN apt-get install -y supervisor ethereum

COPY  CustomGenesis.json /opt/blockchain/CustomGenesis.json
#RUN geth -identity "a4i3ia2" init "/opt/blockchain/CustomGenesis.json" -datadir "/opt/blockchain/datadir"
#RUN chmod 777 -R /opt/blockchain/datadir
#VOLUME /opt/blockchain/datadir
#VOLUME /opt/blockchain/datadir/keystore
COPY  a4i3ia2.conf /etc/supervisor/conf.d/a4i3ia2.conf

COPY  autostart.sh /etc/my_init.d/autostart.sh
RUN chmod +x /etc/my_init.d/autostart.sh
CMD /etc/my_init.d/autostart.sh && tail -f /var/log/supervisor/geth.err.log
EXPOSE 8055 55555

WORKDIR /opt/blockchain/
