# 使用Node.js官方镜像作为基础镜像
FROM node:23.11-slim

# 设置工作目录
WORKDIR /app

# 只复制必要的文件
COPY package.json yarn.lock ./
COPY prisma ./prisma


# 仅安装生产环境依赖
RUN yarn install --production --frozen-lockfile && yarn add @prisma/client && yarn prisma generate


# 启动应用
CMD ["node", "app.js"]
