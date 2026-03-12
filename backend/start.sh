#!/bin/bash

# 设置环境变量
if [ -f .env ]; then
    echo "Loading environment variables from .env file"
    export $(cat .env | grep -v '^#' | xargs)
fi

# 检查Node.js是否可用
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# 检查server.js文件是否存在
if [ ! -f "server.js" ]; then
    echo "Error: server.js file not found"
    exit 1
fi

echo "Starting Node.js application..."

# 启动Node.js应用
node server.js