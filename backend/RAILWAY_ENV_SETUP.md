# Railway环境变量配置指南

## 必需的环境变量

### 1. JWT_SECRET
- **用途**：用于JWT token签名
- **值**：随机生成的安全字符串
- **示例**：`your-super-secret-jwt-key-change-this-in-production`

### 2. MONGODB_URI
- **用途**：MongoDB数据库连接字符串
- **值**：MongoDB Atlas连接字符串
- **示例**：`mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### 3. PORT
- **用途**：服务器监听端口
- **值**：Railway自动设置，通常不需要手动配置
- **默认值**：5001

### 4. NODE_ENV
- **用途**：运行环境
- **值**：production
- **说明**：Railway会自动设置

## 可选的环境变量

### 1. CORS_ORIGIN
- **用途**：允许的CORS来源
- **值**：前端域名
- **示例**：`https://your-vercel-app.vercel.app`

## 在Railway中设置环境变量

### 步骤1：访问Railway项目
1. 访问 https://railway.app
2. 进入您的后端项目
3. 点击"Variables"标签

### 步骤2：添加环境变量
1. 点击"New Variable"按钮
2. 添加以下变量：

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=production
```

### 步骤3：保存并重新部署
1. 点击"Save"保存环境变量
2. Railway会自动重新部署应用
3. 等待部署完成

## 生成JWT_SECRET

### 方法1：使用Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 方法2：使用在线工具
访问 https://www.random.org/strings/ 生成随机字符串

## MongoDB Atlas配置

### 步骤1：创建MongoDB Atlas账户
1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费账户
3. 创建新集群

### 步骤2：获取连接字符串
1. 在MongoDB Atlas控制台中
2. 点击"Connect"按钮
3. 选择"Connect your application"
4. 复制连接字符串

### 步骤3：配置IP白名单
1. 在MongoDB Atlas中
2. 进入"Network Access"
3. 添加IP地址：`0.0.0.0/0`（允许所有IP）

### 步骤4：创建数据库用户
1. 在MongoDB Atlas中
2. 进入"Database Access"
3. 创建新用户
4. 设置用户名和密码

## 测试Railway后端

### 方法1：浏览器测试
在浏览器中访问：
```
https://your-railway-app.up.railway.app/
```

### 方法2：API测试
在浏览器中访问：
```
https://your-railway-app.up.railway.app/api/products
```

### 方法3：使用curl
```bash
curl https://your-railway-app.up.railway.app/api/products
```

## 故障排除

### 问题1：后端无法启动
**解决方案**：
1. 检查Railway日志
2. 确认所有依赖已安装
3. 检查环境变量是否正确

### 问题2：数据库连接失败
**解决方案**：
1. 检查MONGODB_URI是否正确
2. 确认MongoDB Atlas IP白名单配置
3. 检查数据库用户权限

### 问题3：API返回503错误
**解决方案**：
1. 确认数据库连接成功
2. 检查Railway日志中的数据库连接状态
3. 确认MongoDB Atlas集群正在运行

## 前端配置

### 设置Vercel环境变量
在Vercel中设置：
```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

### 重新部署Vercel前端
设置环境变量后，在Vercel中重新部署前端应用。