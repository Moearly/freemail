# FreeMail SEO 优化计划

## 一、审计发现与已完成优化

### 1.1 首页 (landing.html) — 核心收录页

| 检查项 | 优化前 | 优化后 |
|--------|--------|--------|
| title | 有 (58字符) | 保持不变 |
| meta description | 有 (147字符) | 保持不变 |
| meta keywords | 有 | 保持不变 |
| canonical | 相对路径 `/` | 绝对路径 `https://freemail.best/` |
| Open Graph | 缺 `og:url`、`og:image` | 已补全 `og:url`、`og:image`、`og:site_name` |
| Twitter Card | 无 | 已添加 `summary_large_image` |
| JSON-LD 结构化数据 | 无 | 已添加 `WebApplication` Schema |
| 语义化 HTML | 无 `<main>` | 已添加 `<main>` 包裹主内容 |
| robots | `index, follow` | 保持不变 |

### 1.2 后台页面 — 阻止收录

| 页面 | 优化措施 |
|------|---------|
| login.html | 添加 `noindex, nofollow`；修复 favicon 路径 `/favicon.svg` |
| admin.html | 添加 `noindex, nofollow` |
| mailbox.html | 添加 `noindex, nofollow` |
| mailboxes.html | 添加 `noindex, nofollow` |
| index.html (app壳) | 添加 `noindex, nofollow` |

### 1.3 站点级文件

| 文件 | 状态 |
|------|------|
| robots.txt | 已创建 — 允许 `/` 和 `/landing`，禁止后台/API 路径 |
| sitemap.xml | 已创建 — 包含首页 URL，`changefreq: daily` |

## 二、SEO 策略分析

### 2.1 收录策略

FreeMail 作为工具型 SaaS，SEO 重心集中在**首页**：

- **应收录页面**: 仅首页 `/`（landing.html）
- **不应收录页面**: 所有后台页面（login、admin、mailbox、mailboxes、app）
- **API 路径**: 全部通过 robots.txt 禁止

### 2.2 关键词策略

#### 主要关键词（英文优先，面向全球用户）
- `temporary email` / `temp mail` / `disposable email`
- `free temporary email address`
- `anonymous email` / `burner email`
- `verification code extractor`

#### 长尾关键词
- `free disposable email no registration`
- `temporary email for verification`
- `temp email with auto code extraction`

### 2.3 内容优化建议

1. **首页 H1 标签**: 当前已包含核心关键词 "Free Temporary Email"
2. **FAQ 区域**: 已有结构化 FAQ，利于 Featured Snippet
3. **多语言支持**: 当前支持中英文 i18n，有利于多语言 SEO

## 三、后续优化计划

### 3.1 短期（1-2 周）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 制作 OG Image | 创建 1200x630px 的分享预览图，部署到 `/og-image.png` |
| P0 | 提交 Google Search Console | 验证站点所有权，提交 sitemap.xml |
| P1 | 提交 Bing Webmaster Tools | 扩大搜索引擎覆盖 |
| P1 | 添加 Google Analytics / Cloudflare Analytics | 监控流量和用户行为 |

### 3.2 中期（1-3 个月）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | 生成动态 sitemap | 如果增加更多公开页面，动态生成 sitemap |
| P2 | 添加 FAQ Schema | 将 FAQ 区域增加 JSON-LD 标记，争取 Google 富片段 |
| P2 | 创建 landing 博客/帮助页 | 增加内容页面，提升长尾关键词覆盖 |
| P2 | 外链建设 | 提交到 Product Hunt、AlternativeTo 等平台 |

### 3.3 长期（3-6 个月）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P2 | 性能优化 | Core Web Vitals (LCP < 2.5s, CLS < 0.1) |
| P3 | 多语言独立页面 | `/en/`、`/zh/` 独立 URL + hreflang 标签 |
| P3 | PWA 支持 | manifest.json + Service Worker，提升用户留存 |

## 四、技术 SEO 检查清单

```
[x] robots.txt — 已创建
[x] sitemap.xml — 已创建
[x] canonical URL — 已设为绝对路径
[x] Open Graph 标签 — 已补全
[x] Twitter Card — 已添加
[x] JSON-LD 结构化数据 — 已添加
[x] 后台页面 noindex — 已设置
[x] favicon 路径修复 — 已修复
[x] 语义化 HTML (<main>) — 已添加
[ ] OG Image 制作 — 待完成
[ ] Search Console 提交 — 待完成
[ ] Analytics 集成 — 待完成
```

## 五、竞品 SEO 参考

| 竞品 | Domain Rating | 月流量 | 核心优势 |
|------|--------------|--------|---------|
| tempmail.ing | 高 | 大 | 域名精准匹配关键词 |
| temp-mail.org | 高 | 大 | 历史悠久，外链丰富 |
| guerrillamail.com | 中 | 中 | 品牌效应 |

**FreeMail 当前差距**: 域名 `freemail.best` 非独立域名，SEO 权重受限。详见域名分析文档。
