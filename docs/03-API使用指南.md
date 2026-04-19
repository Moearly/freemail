# API 使用指南

## 快速接入（复制即用）

```
API:   https://freemail.best
Token: 7601b3c90d2cf61c1743aee13aa97849665cf026bac9058caf5f1ca30fb464f8
```

### 环境变量配置

```bash
# 方式一：分开配置
export FREEMAIL_API="https://freemail.best"
export FREEMAIL_TOKEN="7601b3c90d2cf61c1743aee13aa97849665cf026bac9058caf5f1ca30fb464f8"

# 方式二：合并为一行（管道分隔，兼容旧格式）
export RECOVERY_EMAIL_PWD="https://freemail.best|7601b3c90d2cf61c1743aee13aa97849665cf026bac9058caf5f1ca30fb464f8"
```

### 接入只需 3 步

```bash
TOKEN="7601b3c90d2cf61c1743aee13aa97849665cf026bac9058caf5f1ca30fb464f8"

# 1. 生成临时邮箱（24h 过期）
curl -H "Authorization: Bearer $TOKEN" "https://freemail.best/api/generate"
# → {"email":"abc123@freemail.best","expires":1776...}

# 2. 生成固定邮箱（不过期，持久化）
curl -H "Authorization: Bearer $TOKEN" "https://freemail.best/api/generate?persistent=true"
# → {"email":"xyz789@freemail.best","persistent":true}

# 3. 获取邮件和验证码
curl -H "Authorization: Bearer $TOKEN" "https://freemail.best/api/emails?mailbox=abc123@freemail.best"
# → [{"id":1,"subject":"验证码","verification_code":"123456",...}]
```

### 自定义邮箱名

```bash
# 创建固定邮箱 my-account@freemail.best
curl -X POST "https://freemail.best/api/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"local":"my-account","persistent":true}'
# → {"email":"my-account@freemail.best","persistent":true}
```

### 查邮件详情（含验证码）

```bash
# 获取邮件列表后，用 id 查详情
curl -H "Authorization: Bearer $TOKEN" "https://freemail.best/api/email/1"
# → {"id":1,"subject":"...","verification_code":"123456","html":"..."}
```

> 以上就是全部接入流程。下面是完整的接口文档。

---

## 🔐 认证方式

### 使用 Root Admin Token

项目支持使用环境变量 `JWT_TOKEN` 作为超级管理员令牌，可以跳过登录直接访问所有 API。

**两种携带方式**（任选其一）：

#### 方式 1：Authorization Header（推荐）
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://freemail.best/api/generate
```

#### 方式 2：自定义 Header
```bash
curl -H "X-Admin-Token: YOUR_JWT_TOKEN" \
  https://freemail.best/api/generate
```

### 获取你的 JWT_TOKEN

你的 JWT_TOKEN 存储在 Cloudflare Worker 的 Secrets 中。查看方式：

```bash
# 方法 1：通过命令行查看（无法直接读取，只能重新设置）
# JWT_TOKEN 是加密存储的，无法读取原值

# 方法 2：重新生成一个新的 Token
openssl rand -hex 32

# 然后设置新的 Token
echo "your_new_token" | wrangler secret put JWT_TOKEN
```

**注意**：如果你不记得当前的 JWT_TOKEN，需要重新生成并设置一个新的。

---

## 📧 创建临时邮箱 API

### 接口 1：随机生成邮箱

**接口**: `GET /api/generate`

**权限**:
- 生成临时邮箱：Landing 公开（无需认证）或已认证用户
- 生成持久化邮箱：**仅管理员**（需 JWT_TOKEN 认证）

**参数**:
- `length` (可选): 邮箱前缀长度，默认 8
- `domainIndex` (可选): 域名索引，默认 0（使用第一个域名）
- `persistent` (可选): 设为 `true` 或 `1` 创建持久化邮箱（不过期、不被定时清理），**需管理员权限**

**示例**:

```bash
# 随机生成临时邮箱（默认 24 小时过期，可匿名调用）
curl "https://freemail.best/api/generate"

# 生成持久化邮箱（不过期，必须携带管理员 Token）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/generate?persistent=true"

# 指定前缀长度
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/generate?length=12"

# 指定域名（如果配置了多个域名）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/generate?domainIndex=1"
```

**返回示例（临时邮箱）**:
```json
{
  "email": "abc12345@codewith.site",
  "expires": 1698765432000
}
```

**返回示例（持久化邮箱）**:
```json
{
  "email": "abc12345@codewith.site",
  "persistent": true
}
```

---

### 接口 2：自定义前缀创建邮箱

**接口**: `POST /api/create`

**权限**:
- 创建临时邮箱：Landing 公开（无需认证）或已认证用户
- 创建/设置持久化邮箱：**仅管理员**（需 JWT_TOKEN 认证）

**请求体**:
```json
{
  "local": "myemail",
  "domainIndex": 0,
  "persistent": true
}
```

- `local` (必填): 邮箱前缀（`a-z0-9._-`，1-64字符）
- `domainIndex` (可选): 域名索引，默认 0
- `persistent` (可选): 设为 `true` 创建持久化邮箱，**需管理员权限**

**示例**:

```bash
# 创建临时自定义邮箱
curl -X POST "https://freemail.best/api/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"local": "test123", "domainIndex": 0}'

# 创建持久化自定义邮箱（用于长期接收邮件）
curl -X POST "https://freemail.best/api/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"local": "giffgaff-account1", "domainIndex": 0, "persistent": true}'
```

**返回示例**:
```json
{
  "email": "giffgaff-account1@codewith.site",
  "persistent": true
}
```

**错误响应**:
- `409`: 邮箱已存在（如果加 `persistent: true`，会自动将已有邮箱设为持久化）
- `429`: 已达到邮箱创建上限
- `400`: 参数错误

---

### 接口 3：查询邮箱状态

**接口**: `GET /api/mailbox/status?address=xxx@codewith.site`

**权限**: **仅管理员**（需 JWT_TOKEN 认证）

**示例**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/mailbox/status?address=test@codewith.site"
```

**返回示例**:
```json
{
  "exists": true,
  "address": "test@codewith.site",
  "persistent": true,
  "created_at": "2026-04-06 12:00:00",
  "last_accessed_at": "2026-04-19 08:30:00"
}
```

---

### 接口 4：设置/取消邮箱持久化

**接口**: `POST /api/mailbox/persistent`

**权限**: **仅管理员**（需 JWT_TOKEN 认证）

**请求体**:
```json
{
  "address": "test@codewith.site",
  "persistent": true
}
```

**示例**:
```bash
# 将邮箱设为持久化
curl -X POST "https://freemail.best/api/mailbox/persistent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "test@codewith.site", "persistent": true}'

# 取消持久化（邮箱将在下次清理时被删除）
curl -X POST "https://freemail.best/api/mailbox/persistent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "test@codewith.site", "persistent": false}'
```

---

## 📬 获取邮件 API

### 接口 1：获取邮件列表

**接口**: `GET /api/emails`

**参数**:
- `mailbox` (必需): 邮箱地址

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/emails?mailbox=test123@codewith.site"
```

**返回示例**:
```json
[
  {
    "id": 1,
    "sender": "sender@example.com",
    "subject": "测试邮件",
    "verification_code": "123456",
    "preview": "这是邮件预览内容...",
    "received_at": "2025-10-28T10:00:00Z",
    "is_read": 0
  }
]
```

---

### 接口 2：获取邮件详情

**接口**: `GET /api/email/{id}`

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/email/1"
```

**返回示例**:
```json
{
  "id": 1,
  "sender": "sender@example.com",
  "subject": "测试邮件",
  "html": "<html><body>邮件HTML内容</body></html>",
  "text": "邮件纯文本内容",
  "verification_code": "123456",
  "received_at": "2025-10-28T10:00:00Z"
}
```

---

## 🗑️ 删除邮件 API

### 接口 1：删除单个邮件

**接口**: `DELETE /api/email/{id}`

**示例**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/email/1"
```

**返回示例**:
```json
{
  "success": true,
  "deleted": true,
  "message": "邮件已删除"
}
```

---

### 接口 2：清空邮箱所有邮件

**接口**: `DELETE /api/emails`

**参数**:
- `mailbox` (必需): 邮箱地址

**示例**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/emails?mailbox=test123@codewith.site"
```

**返回示例**:
```json
{
  "success": true,
  "deletedCount": 5,
  "previousCount": 5
}
```

---

## 📋 邮箱管理 API

### 接口 1：获取历史邮箱列表

**接口**: `GET /api/mailboxes`

**参数**:
- `limit` (可选): 每页数量，默认 50
- `offset` (可选): 偏移量，默认 0

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/mailboxes?limit=20&offset=0"
```

**返回示例**:
```json
[
  {
    "id": 1,
    "address": "test123@codewith.site",
    "created_at": "2025-10-28T10:00:00Z",
    "is_pinned": 0
  }
]
```

---

### 接口 2：删除邮箱

**接口**: `DELETE /api/mailbox/{address}`

**示例**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/mailbox/test123@codewith.site"
```

**返回示例**:
```json
{
  "success": true
}
```

---

## 🔧 系统 API

### 获取可用域名列表

**接口**: `GET /api/domains`

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/domains"
```

**返回示例**:
```json
["codewith.site"]
```

---

## 👤 用户管理 API（可选）

### 接口 1：获取用户列表

**接口**: `GET /api/users`

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/users"
```

---

### 接口 2：创建用户

**接口**: `POST /api/users`

**请求体**:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

**示例**:

```bash
curl -X POST "https://freemail.best/api/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "user"
  }'
```

---

### 接口 3：为用户分配邮箱

**接口**: `POST /api/users/assign`

**请求体**:
```json
{
  "username": "newuser",
  "address": "test123@codewith.site"
}
```

**示例**:

```bash
curl -X POST "https://freemail.best/api/users/assign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "address": "test123@codewith.site"
  }'
```

---

## 📝 完整使用示例

### Python 示例

```python
import requests

# 配置
API_BASE = "https://freemail.best"
JWT_TOKEN = "your_jwt_token_here"

# 设置请求头
headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

# 1. 生成随机邮箱
response = requests.get(f"{API_BASE}/api/generate", headers=headers)
email_data = response.json()
email = email_data["email"]
print(f"生成的邮箱: {email}")

# 2. 获取邮件列表
response = requests.get(
    f"{API_BASE}/api/emails",
    params={"mailbox": email},
    headers=headers
)
emails = response.json()
print(f"收到 {len(emails)} 封邮件")

# 3. 查看第一封邮件详情（如果有）
if emails:
    email_id = emails[0]["id"]
    response = requests.get(
        f"{API_BASE}/api/email/{email_id}",
        headers=headers
    )
    email_detail = response.json()
    print(f"邮件主题: {email_detail['subject']}")
    print(f"验证码: {email_detail.get('verification_code', '无')}")
```

---

### Node.js/JavaScript 示例

```javascript
const API_BASE = "https://freemail.best";
const JWT_TOKEN = "your_jwt_token_here";

// 设置请求头
const headers = {
  "Authorization": `Bearer ${JWT_TOKEN}`,
  "Content-Type": "application/json"
};

// 1. 生成随机邮箱
async function generateEmail() {
  const response = await fetch(`${API_BASE}/api/generate`, { headers });
  const data = await response.json();
  console.log("生成的邮箱:", data.email);
  return data.email;
}

// 2. 获取邮件列表
async function getEmails(mailbox) {
  const response = await fetch(
    `${API_BASE}/api/emails?mailbox=${encodeURIComponent(mailbox)}`,
    { headers }
  );
  const emails = await response.json();
  console.log(`收到 ${emails.length} 封邮件`);
  return emails;
}

// 3. 获取邮件详情
async function getEmailDetail(emailId) {
  const response = await fetch(
    `${API_BASE}/api/email/${emailId}`,
    { headers }
  );
  const email = await response.json();
  console.log("邮件主题:", email.subject);
  console.log("验证码:", email.verification_code || "无");
  return email;
}

// 使用示例
(async () => {
  const email = await generateEmail();
  const emails = await getEmails(email);
  if (emails.length > 0) {
    await getEmailDetail(emails[0].id);
  }
})();
```

---

### cURL 完整流程示例

```bash
# 设置变量
API_BASE="https://freemail.best"
JWT_TOKEN="your_jwt_token_here"

# 1. 生成邮箱
EMAIL=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_BASE/api/generate" | jq -r '.email')
echo "生成的邮箱: $EMAIL"

# 2. 等待接收邮件（实际使用中，这里应该是发送邮件到这个地址）
sleep 10

# 3. 获取邮件列表
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_BASE/api/emails?mailbox=$EMAIL" | jq '.'

# 4. 获取第一封邮件的详情
EMAIL_ID=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_BASE/api/emails?mailbox=$EMAIL" | jq -r '.[0].id')

if [ "$EMAIL_ID" != "null" ]; then
  curl -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE/api/email/$EMAIL_ID" | jq '.'
fi
```

---

## 🔑 权限模型

| 操作 | 匿名/Landing | 普通用户(登录) | 管理员(JWT_TOKEN) |
|------|:---:|:---:|:---:|
| 生成临时邮箱 (`/api/generate`) | O | O | O |
| 自定义临时邮箱 (`/api/create`) | O | O | O |
| 创建持久化邮箱 (`persistent=true`) | X | X | O |
| 查询邮箱状态 (`/api/mailbox/status`) | X | X | O |
| 设置/取消持久化 (`/api/mailbox/persistent`) | X | X | O |
| 获取邮件列表 (`/api/emails`) | O | O | O |
| 获取邮件详情 (`/api/email/:id`) | O | O | O |
| 删除邮件 (`/api/email/:id`) | X | O | O |
| 用户管理 (`/api/users/*`) | X | X | O |
| 获取域名列表 (`/api/domains`) | O | O | O |

说明：
- **匿名/Landing**: 首页自动生成邮箱场景，仅限临时邮箱
- **管理员(JWT_TOKEN)**: 通过 `Authorization: Bearer <JWT_TOKEN>` 携带，可执行所有操作
- 持久化邮箱不受定时清理影响，适合业务长期使用

---

## 🏢 业务对接：获取固定可用邮箱

适用于你自己的业务（如多账号管理、接收验证码等），需要长期可用的固定邮箱地址。

### 步骤 1：创建持久化邮箱

```bash
# 为 Giffgaff 账号 1 创建固定邮箱
curl -X POST "https://freemail.best/api/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"local": "giffgaff-account1", "persistent": true}'

# 返回: {"email":"giffgaff-account1@freemail.best","persistent":true}
```

### 步骤 2：轮询接收邮件

```bash
# 查询邮件列表
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/emails?mailbox=giffgaff-account1@freemail.best"

# 获取最新邮件详情及验证码
EMAIL_ID=$(curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/emails?mailbox=giffgaff-account1@freemail.best" | jq -r '.[0].id')

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/email/$EMAIL_ID" | jq '{subject, verification_code, received_at}'
```

### 步骤 3：管理邮箱

```bash
# 查询邮箱是否存在及持久化状态
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://freemail.best/api/mailbox/status?address=giffgaff-account1@freemail.best"

# 取消持久化（之后会被定时清理）
curl -X POST "https://freemail.best/api/mailbox/persistent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "giffgaff-account1@freemail.best", "persistent": false}'
```

### Python 业务对接示例

```python
import requests
import time

API_BASE = "https://freemail.best"
JWT_TOKEN = "your_jwt_token_here"
HEADERS = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

def create_persistent_mailbox(name: str, domain_index: int = 0) -> str:
    """创建持久化邮箱，返回邮箱地址"""
    resp = requests.post(f"{API_BASE}/api/create", headers=HEADERS,
                         json={"local": name, "domainIndex": domain_index, "persistent": True})
    resp.raise_for_status()
    return resp.json()["email"]

def wait_for_verification_code(mailbox: str, timeout: int = 120, interval: int = 5) -> str | None:
    """轮询等待验证码邮件，返回验证码"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        resp = requests.get(f"{API_BASE}/api/emails", headers=HEADERS,
                            params={"mailbox": mailbox})
        emails = resp.json()
        if emails:
            latest = emails[0]
            if latest.get("verification_code"):
                return latest["verification_code"]
            detail = requests.get(f"{API_BASE}/api/email/{latest['id']}", headers=HEADERS).json()
            if detail.get("verification_code"):
                return detail["verification_code"]
        time.sleep(interval)
    return None

# 使用示例
email = create_persistent_mailbox("my-service-account1")
print(f"邮箱已创建: {email}")
# ... 在第三方服务注册时使用该邮箱 ...
code = wait_for_verification_code(email)
print(f"收到验证码: {code}")
```

---

## ⚠️ 注意事项

### 1. JWT_TOKEN 安全

- **严格保密** JWT_TOKEN，不要提交到代码仓库
- 定期更换 Token
- 使用环境变量存储

### 2. 请求频率

- 合理控制请求频率，避免过于频繁
- 建议轮询邮件间隔 >= 5 秒

### 3. 邮箱生命周期

- 生成的邮箱默认有过期时间
- 定期清理不需要的邮箱和邮件

### 4. 跨域请求

- API 支持 CORS
- 如果在浏览器中调用，确保配置正确的跨域头

---

## 🔍 错误码说明

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或缺失） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 409 | 冲突（如邮箱已存在） |
| 429 | 请求过于频繁或达到限额 |
| 500 | 服务器内部错误 |

---

## 📞 获取 JWT_TOKEN 的方法

由于 JWT_TOKEN 是加密存储的，你无法直接读取。有以下几种方法：

### 方法 1：查看部署日志（不可行）

Secrets 不会在日志中显示。

### 方法 2：重新生成新的 Token（推荐）

```bash
# 生成新的 JWT Token
NEW_TOKEN=$(openssl rand -hex 32)
echo "新的 JWT Token: $NEW_TOKEN"

# 更新到 Worker（确保已配置 CLOUDFLARE_API_TOKEN 环境变量）
cd /home/martnlei/codeSpace/freemail
echo "$NEW_TOKEN" | npx wrangler secret put JWT_TOKEN

# 请自行将 Token 保存到安全的地方
```

### 方法 3：在项目中临时添加代码输出（仅用于获取）

这个方法需要修改代码，**仅用于一次性获取，获取后立即删除代码**。

---

**现在你可以使用这些 API 接口与你的其他项目集成了！** 🚀

