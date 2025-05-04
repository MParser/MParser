# 使用Node.js官方镜像作为基础镜像
FROM node:23.11-slim


# 安装OpenSSL， 备选（RUN apk add --no-cache openssl1.1-compat）
RUN apt-get update -y && \
    apt-get install -y wget build-essential && \
    wget https://www.openssl.org/source/openssl-1.1.1q.tar.gz && \
    tar -zxvf openssl-1.1.1q.tar.gz && \
    cd openssl-1.1.1q && \
    ./config && \
    make && \
    make install && \
    ln -sf /usr/local/lib/libssl.so.1.1 /usr/lib/x86_64-linux-gnu/libssl.so.1.1 && \
    ln -sf /usr/local/lib/libcrypto.so.1.1 /usr/lib/x86_64-linux-gnu/libcrypto.so.1.1 && \
    cd .. && \
    rm -rf openssl-1.1.1q openssl-1.1.1q.tar.gz

# 设置工作目录
WORKDIR /app

# 只复制必要的文件
COPY package.json yarn.lock ./
COPY prisma ./prisma


# 仅安装生产环境依赖
# RUN yarn install --production --frozen-lockfile
RUN yarn install
RUN yarn add @prisma/client && yarn prisma generate

# 启动应用
CMD ["node", "app.js"]
