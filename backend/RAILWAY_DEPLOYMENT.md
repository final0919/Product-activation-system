# Railway 部署指南

## 问题描述
Railway 使用 Nixpacks 构建器时出现构建计划错误。

## 解决方案
我们提供了多个配置选项，请根据实际情况选择：

### 选项1：使用自动检测（推荐）
- **配置文件**: 删除所有 `railway*.json` 文件
- **说明**: Railway 会自动检测项目类型并配置构建
- **操作步骤**:
  1. 删除 `backend/railway.json`
  2. 删除 `backend/railway-simple.json`
  3. 删除 `backend/railway-minimal.json`
  4. 删除 `backend/railway-nodejs.json`
  5. Railway 将自动检测为 Node.js 项目

### 选项2：使用最小配置
- **配置文件**: `railway-minimal.json`
- **说明**: 最简单的配置，让 Railway 完全自动处理
- **操作步骤**:
  1. 重命名: `mv railway-minimal.json railway.json`
  2. 删除其他 railway*.json 文件

### 选项3：使用 Node.js 专用配置
- **配置文件**: `railway-nodejs.json`
- **说明**: 明确指定 Node.js 项目配置
- **操作步骤**:
  1. 重命名: `mv railway-nodejs.json railway.json`
  2. 删除其他 railway*.json 文件

### 选项4：使用当前配置
- **配置文件**: `railway.json`
- **说明**: 当前配置，如果问题仍然存在请尝试其他选项

## 部署步骤

1. **选择配置方案**（推荐选项1或2）
2. **提交代码到 GitHub**
3. **在 Railway 中重新部署**
4. **检查部署日志**确认构建成功

## 故障排除

### 如果仍然出现构建错误
1. **检查 package.json** 中的 main 字段是否正确指向 server.js
2. **确保所有依赖**在 package.json 中正确声明
3. **检查 Node.js 版本**兼容性

### 构建成功但应用无法启动
1. **检查环境变量**是否正确设置
2. **查看应用日志**确认启动过程
3. **验证端口绑定**是否正确

## 环境变量设置

在 Railway 控制台中设置以下环境变量：
- `ATLAS_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥
- `NODE_ENV`: production

## 支持

如果问题仍然存在，请检查 Railway 文档或联系支持。