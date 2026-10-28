# 词巢家庭同步服务

这个服务让所有设备只输入昵称，无需 GitHub 令牌。进度保存在 Cloudflare D1；GitHub Pages 继续承载网页。现有 GitHub 档案在该昵称第一次连接时自动合并。服务没有 GitHub 写权限，也不需要 GitHub PAT。

## 部署

1. 可使用 [部署入口](https://deploy.workers.cloudflare.com/?url=https://github.com/DDDDDDKing/King/tree/main/wordnest/server) 按指引创建服务。也可以在 Cloudflare Workers 中导入本仓库，项目根目录设为 `wordnest/server`，安装命令 `npm install`，部署命令 `npm run deploy`。配置中的 `DB` 为 D1 绑定；Cloudflare 部署流程会要求创建/绑定数据库。如果自动创建不适用，在控制台创建 D1，并将它的 `database_id` 加入 `wrangler.jsonc` 的 `d1_databases[0]`。
2. 部署命令先运行 `wrangler d1 migrations apply DB --remote`，再部署 Worker。不要跳过迁移。Worker 自带每五分钟执行的提醒定时器。
3. 打开部署地址的 `/api/health`，应返回 `ok: true`。
4. 在 `wordnest/config.js` 的 `cloudEndpoint` 中填入实际 Worker 地址（无末尾 `/`），提交 GitHub。此后新设备无需设置密钥。

命令行也可使用官方 Wrangler 登录自己的 Cloudflare 账户后，创建 D1、填入 ID，再运行 `npm run deploy`。项目可使用 Cloudflare 免费额度，实际额度和可用性以账户控制台为准。

## 数据与访问

- 家庭按昵称使用，同名共享档案；这不是身份认证系统。
- `/api/profiles` 是公开只读的数据导出，包含已同步的学习记录。网页管理台也公开。
- `/api/sync` 只合并词巢事件，不能执行 SQL、修改任意 GitHub 文件或删除已有记录。按事件 ID 去重，以免两设备覆盖彼此。
- 首次部署后数据库为空；旧 GitHub 用户首次登录时会导入其历史。管理台同时合并云端与 GitHub 历史，未迁移用户仍可查看。
- `subscriptions` 的浏览器推送端点、VAPID 私钥只留在数据库，不随公开导出返回。
- 部署前务必确认这是允许家庭公开查看进度的用途。无密码昵称模式允许别人使用同名录入新记录。
- 恢复或迁移时备份 D1，或保存 `/api/profiles` 的完整 JSON。GitHub 中的原有文件保持不变；中转启用后的新记录不自动回写 GitHub。

## 安卓提醒

学习设置提供系统日历和网页推送两种入口。日历页面需要用户点击保存并确认通知；ICS 是同一提醒的备用导入文件，二选一保存以免重复。

网页推送需要 Android Chrome 等支持 Push API 的浏览器、系统允许通知、网络能访问该浏览器的推送服务。用户点击开启后才申请权限。VAPID 密钥在数据库中首次生成并保留，服务端发送无正文的标准 Web Push，由 Service Worker 显示固定提醒。定时器每五分钟检查一次，最多一次/设备/日；完成当日任务则跳过。省电设置、推送服务网络条件可能延迟投递。部署代码检查已覆盖；真实手机投递需部署后另行验证。

## 检查

在 `wordnest` 目录运行 `node --test tests/*.test.cjs`。测试使用 SQLite 的 D1 适配器，验证多设备事件合并、重复提交、输入校验、只读管理和提醒状态。
