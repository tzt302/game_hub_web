# Racing Line Pro Web

基于桌面版 2.5 的纯静态浏览器版本，无需构建步骤。

## 网站路径

- 独立页面：`/games/racing/`
- 嵌入页面：`/games/racing/?embed=1`

## iframe 示例

```html
<iframe
  src="/games/racing/?embed=1"
  title="Racing Line Pro"
  allow="gamepad; fullscreen"
  loading="lazy"
  style="width:100%;aspect-ratio:16/9;border:0"
></iframe>
```

页面使用相对资源路径，因此也可将整个 `games/racing` 目录部署到其他静态网站的任意子目录。

## 本地验证

```powershell
python -m http.server 8080
```

从 `game_hub_web` 目录启动服务器后，访问 `http://127.0.0.1:8080/games/racing/`。

测试需要 Node.js：

```powershell
node --test games/racing/tests/core.test.js
```
