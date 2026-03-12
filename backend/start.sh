#!/bin/bash

# 设置环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 启动Node.js应用
node server.js