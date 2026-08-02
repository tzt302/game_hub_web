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

## 本地预览

```powershell
python -m http.server 8080
```

然后访问 `http://127.0.0.1:8080`。
