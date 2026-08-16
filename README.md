# TZT Game Hub

`tztgame.com` 的公开小游戏大厅，使用纯静态 HTML、CSS 和 JavaScript 构建，
可以直接部署到 Cloudflare Pages。

## 当前游戏

- 雀研所：已提供完整浏览器版本。
- Racing Line Pro：网页 2.6 版已支持手柄、触屏操作和三秒回溯复位。
- Neon Hold'em：已提供完整浏览器版本。

## Cloudflare Pages 配置

连接本仓库后使用以下配置：

| 设置 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `exit 0` |
| Build output directory | `.` |

部署成功后，在 Pages 项目的 **Custom domains** 中添加 `tztgame.com`。

## 全球排行榜 v1

赛车、蜘蛛纸牌、扫雷和 2048 已接入统一全球排行榜。玩家首次提交成绩时设置匿名昵称，身份凭证只保存在自己的浏览器中；原有本机记录继续保留。

后端使用 Cloudflare Worker + D1：

1. 在 Cloudflare D1 创建数据库 `tzt-game-leaderboard`。
2. 把数据库 ID 填入 `wrangler.jsonc` 的 `database_id`。
3. 部署命令使用 `npx wrangler deploy`。首次访问 `/api/*` 时会自动创建排行榜数据表。

本地测试：

```powershell
npx wrangler d1 migrations apply DB --local
npx wrangler dev
```

公开接口包括 `/api/players`、`/api/scores`、`/api/leaderboard` 和 `/api/health`。成绩提交带匿名玩家令牌、合理范围检查、提交频率限制和每位玩家每种模式只保留最佳成绩。

## 本地预览

```powershell
python -m http.server 8080
```

然后访问 `http://127.0.0.1:8080`。
