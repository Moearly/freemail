# API 使用指南

## 📋 基础信息

- **API 基础地址**: `https://mail.codewith.site`
- **认证方式**: JWT Token（环境变量中配置的 `JWT_TOKEN`）

---

## 🔐 认证方式

### 使用 Root Admin Token

项目支持使用环境变量 `JWT_TOKEN` 作为超级管理员令牌，可以跳过登录直接访问所有 API。

**三种携带方式**（任选其一）：

#### 方式 1：Authorization Header（推荐）
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://mail.codewith.site/api/generate
```

#### 方式 2：自定义 Header
```bash
curl -H "X-Admin-Token: YOUR_JWT_TOKEN" \
  https://mail.codewith.site/api/generate
```

#### 方式 3：URL 参数
```bash
curl "https://mail.codewith.site/api/generate?admin_token=YOUR_JWT_TOKEN"
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

**参数**:
- `length` (可选): 邮箱前缀长度，默认 8
- `domainIndex` (可选): 域名索引，默认 0（使用第一个域名）

**示例**:

```bash
# 随机生成邮箱（默认长度）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://mail.codewith.site/api/generate"

# 指定前缀长度
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://mail.codewith.site/api/generate?length=12"

# 指定域名（如果配置了多个域名）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://mail.codewith.site/api/generate?domainIndex=0"
```

**返回示例**:
```json
{
  "email": "abc12345@codewith.site",
  "expires": 1698765432000
}
```

---

### 接口 2：自定义前缀创建邮箱

**接口**: `POST /api/create`

**请求体**:
```json
{
  "local": "myemail",
  "domainIndex": 0
}
```

**示例**:

```bash
# 创建自定义前缀邮箱
curl -X POST "https://mail.codewith.site/api/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "local": "test123",
    "domainIndex": 0
  }'
```

**返回示例**:
```json
{
  "email": "test123@codewith.site",
  "expires": 1698765432000
}
```

**错误响应**:
- `409`: 邮箱已存在
- `429`: 已达到邮箱创建上限
- `400`: 参数错误

---

## 📬 获取邮件 API

### 接口 1：获取邮件列表

**接口**: `GET /api/emails`

**参数**:
- `mailbox` (必需): 邮箱地址

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://mail.codewith.site/api/emails?mailbox=test123@codewith.site"
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
  "https://mail.codewith.site/api/email/1"
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
  "https://mail.codewith.site/api/email/1"
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
  "https://mail.codewith.site/api/emails?mailbox=test123@codewith.site"
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
  "https://mail.codewith.site/api/mailboxes?limit=20&offset=0"
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
  "https://mail.codewith.site/api/mailbox/test123@codewith.site"
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
  "https://mail.codewith.site/api/domains"
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
  "https://mail.codewith.site/api/users"
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
curl -X POST "https://mail.codewith.site/api/users" \
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
curl -X POST "https://mail.codewith.site/api/users/assign" \
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
API_BASE = "https://mail.codewith.site"
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
const API_BASE = "https://mail.codewith.site";
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
API_BASE="https://mail.codewith.site"
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

