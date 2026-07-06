# 🎨 CodeCanvas - 创意代码画廊

**CodeCanvas** 是一个面向开发者的全栈创意游乐场。编写 HTML、CSS 和 JavaScript，即时预览效果，并与社区分享你的作品。

## ✨ 功能特性

- **🎯 实时代码编辑器** - 三栏编辑器 (HTML/CSS/JS)，集成 CodeMirror 6，实时 iframe 预览
- **🖼️ 画廊浏览** - 响应式网格布局，热门推荐，标签筛选
- **❤️ 社交互动** - 点赞、评论、复刻 (Fork) 你喜欢的作品
- **🔍 全文搜索** - 基于 FTS5 的强大搜索功能
- **🔔 实时通知** - WebSocket 驱动的点赞/评论/Fork 即时推送
- **🌐 中英文切换** - 一键切换界面语言
- **👤 用户系统** - JWT 认证，个人主页

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 |
| **编辑器** | CodeMirror 6 (HTML/CSS/JS 语法高亮) |
| **状态管理** | Zustand |
| **后端** | Go 1.25 + Gin + gorilla/websocket |
| **数据库** | SQLite (modernc.org/sqlite 纯Go实现) |
| **认证** | JWT + bcrypt |
| **国际化** | react-i18next + i18next-browser-languagedetector |

## 🚀 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+

### 1. 克隆并安装

```bash
git clone https://github.com/JasonBuildAI/CodeCanvas.git
cd CodeCanvas

# 安装前端依赖
cd client && npm install && cd ..

# 安装 Go 依赖
cd server && go mod tidy && cd ..
```

### 2. 启动后端

```bash
cd server
go run ./cmd/server/main.go
```

### 3. 启动前端

```bash
cd client
npm run dev
```

### 4. 打开浏览器

访问 **http://localhost:5173**

## 📁 项目结构

```
codecanvas/
├── server/                     # Go 后端
│   ├── cmd/server/main.go      # 入口文件
│   └── internal/
│       ├── config/             # 配置
│       ├── database/           # 数据库连接 + 迁移
│       ├── model/              # 数据模型
│       ├── service/            # 业务逻辑 (JWT认证)
│       ├── handler/            # HTTP 处理器
│       ├── middleware/         # 认证 + CORS 中间件
│       ├── websocket/          # WebSocket Hub
│       └── router/             # 路由注册
├── client/                     # React 前端
│   └── src/
│       ├── pages/              # 页面组件
│       ├── components/         # UI 组件
│       ├── services/           # API 客户端
│       ├── stores/             # Zustand 状态管理
│       ├── i18n/               # 国际化翻译
│       └── types/              # TypeScript 类型
└── start.ps1                   # 一键启动脚本
```

## 🔌 API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 作品
- `GET /api/code-pieces` - 作品列表 (分页)
- `GET /api/code-pieces/trending` - 热门作品
- `GET /api/code-pieces/:id` - 作品详情
- `POST /api/code-pieces` - 创建作品
- `PUT /api/code-pieces/:id` - 更新作品
- `DELETE /api/code-pieces/:id` - 删除作品

### 社交
- `POST /api/code-pieces/:id/like` - 点赞
- `DELETE /api/code-pieces/:id/like` - 取消点赞
- `POST /api/code-pieces/:id/comments` - 评论
- `POST /api/code-pieces/:id/fork` - 复刻

### 搜索
- `GET /api/search?q=关键词` - 全文搜索

### 通知
- `GET /api/notifications` - 通知列表
- WebSocket `/api/ws?token=xxx` - 实时通知

## 📸 截图

![首页](https://via.placeholder.com/800x450?text=CodeCanvas+首页)
![编辑器](https://via.placeholder.com/800x450?text=CodeCanvas+编辑器)

## 📄 许可证

MIT
