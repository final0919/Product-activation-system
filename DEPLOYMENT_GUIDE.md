# 🌐 电商产品激活系统 - 免费部署指南

本指南将帮助您使用免费方案将电商产品激活系统部署到线上。

## 📋 部署架构

- **前端**: Vercel (免费)
- **后端**: Railway (免费额度)
- **数据库**: MongoDB Atlas (免费512MB)

## 🚀 部署步骤

### 第一步：设置MongoDB Atlas数据库

1. **注册MongoDB Atlas账号**
   - 访问 https://cloud.mongodb.com
   - 注册免费账号

2. **创建集群**
   - 选择"免费套餐" (M0)
   - 选择云提供商和区域（推荐选择离您用户最近的区域）
   - 创建集群（大约需要5-10分钟）

3. **设置数据库访问**
   - 在"Database Access"中创建数据库用户
   - 设置用户名和强密码
   - 授予"Read and write to any database"权限

4. **设置网络访问**
   - 在"Network Access"中添加IP地址
   - 推荐：添加`0.0.0.0/0`（允许所有IP访问）

5. **获取连接字符串**
   - 在"Database"页面点击"Connect"
   - 选择"Connect your application"
   - 复制连接字符串
   - 格式：`mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce-activation`

### 第二步：部署后端到Railway

1. **注册Railway账号**
   - 访问 https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"
   - 选择您的电商产品激活系统仓库
   - 选择`backend`目录作为部署目录

3. **设置环境变量**
   - 在Railway项目的"Variables"标签页添加：
   ```
   ATLAS_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce-activation
   JWT_SECRET=your-production-jwt-secret-here
   NODE_ENV=production
   ```

4. **等待部署完成**
   - Railway会自动检测到package.json并开始部署
   - 部署完成后，记下生成的域名（如：https://your-app.up.railway.app）

### 第三步：部署前端到Vercel

1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击"New Project"
   - 选择您的电商产品激活系统仓库
   - 选择`frontend`目录作为根目录

3. **配置项目设置**
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **设置环境变量**
   - 添加环境变量：
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```
   - 将`your-railway-app`替换为您的Railway应用域名

5. **部署**
   - 点击"Deploy"
   - 等待构建和部署完成
   - 获得前端域名（如：https://your-app.vercel.app）

### 第四步：测试部署

1. **访问前端域名**
2. **测试功能**
   - 注册新用户
   - 登录管理员账号
   - 创建产品和激活码
   - 测试激活功能

## 🔧 故障排除

### 常见问题

1. **CORS错误**
   - 确保后端CORS配置允许前端域名
   - 在Railway环境变量中添加：`NODE_ENV=production`

2. **数据库连接失败**
   - 检查MongoDB Atlas连接字符串
   - 确认网络访问设置正确
   - 检查数据库用户名和密码

3. **API调用失败**
   - 确认前端环境变量`REACT_APP_API_URL`设置正确
   - 检查后端是否正常运行

### 日志查看

- **Railway日志**: 在Railway控制台的"Logs"标签页
- **Vercel日志**: 在Vercel控制台的"Functions"标签页

## 📊 监控和维护

### 免费额度限制

- **Railway**: 每月$5免费额度，约500小时运行时间
- **Vercel**: 无限部署，100GB带宽/月
- **MongoDB Atlas**: 512MB存储，共享RAM

### 性能优化建议

1. **启用缓存**: 在Vercel中配置缓存策略
2. **压缩图片**: 优化产品图片大小
3. **数据库索引**: 为常用查询字段添加索引

## 🔄 更新部署

当代码有更新时：

1. **推送代码到GitHub**
2. **Railway和Vercel会自动重新部署**
3. **检查部署日志确认无错误**

## 📞 支持

如果遇到问题：

1. 检查本指南的故障排除部分
2. 查看平台文档：
   - Railway: https://docs.railway.app
   - Vercel: https://vercel.com/docs
   - MongoDB Atlas: https://docs.atlas.mongodb.com

## 🎯 成功部署后的操作

1. **测试所有功能**
2. **备份数据库连接信息**
3. **设置自定义域名（可选）**
4. **配置SSL证书（自动）**

---

**部署完成时间预估**: 30-60分钟
**月成本**: $0（免费方案）
**支持用户数**: 适合中小规模使用