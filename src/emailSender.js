// 发送邮件服务（Resend + Microsoft Graph API）——基于 fetch 的 Edge 兼容实现

// ===================== Microsoft Graph API =====================

/**
 * 解析 MS_ACCOUNTS 配置，支持多个微软邮箱账号
 * 格式: JSON 数组，每项包含 email, tenantId, clientId, clientSecret
 * 示例: [{"email":"a@outlook.com","tenantId":"...","clientId":"...","clientSecret":"..."}]
 * 或简化格式: email1:tenantId:clientId:clientSecret,email2:tenantId:clientId:clientSecret
 */
export function parseMsAccountsConfig(configStr) {
  if (!configStr) return [];
  try {
    const parsed = JSON.parse(configStr);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object' && parsed.email) return [parsed];
  } catch (_) {}
  return String(configStr).split(';').map(entry => {
    const parts = entry.trim().split(':');
    if (parts.length >= 4) {
      return { email: parts[0].trim(), tenantId: parts[1].trim(), clientId: parts[2].trim(), clientSecret: parts.slice(3).join(':').trim() };
    }
    return null;
  }).filter(Boolean);
}

/**
 * 根据发件地址选择微软账号
 */
export function selectMsAccount(fromEmail, accounts) {
  if (!Array.isArray(accounts) || !accounts.length || !fromEmail) return null;
  const addr = String(fromEmail).toLowerCase().replace(/.*</, '').replace(/>.*/, '').trim();
  return accounts.find(a => a.email?.toLowerCase() === addr) || null;
}

const msTokenCache = new Map();

async function getMsAccessToken(account) {
  const cacheKey = `${account.tenantId}:${account.clientId}`;
  const cached = msTokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) return cached.token;

  const resp = await fetch(`https://login.microsoftonline.com/${account.tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: account.clientId,
      client_secret: account.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error_description || data.error || 'MS token failed');
  msTokenCache.set(cacheKey, { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 });
  return data.access_token;
}

/**
 * 通过 Microsoft Graph API 发送邮件
 */
export async function sendEmailWithMs(account, payload) {
  const token = await getMsAccessToken(account);
  const toRecipients = (Array.isArray(payload.to) ? payload.to : [payload.to]).filter(Boolean).map(addr => ({
    emailAddress: { address: String(addr).replace(/.*</, '').replace(/>.*/, '').trim() }
  }));
  const body = {
    message: {
      subject: payload.subject || '',
      body: {
        contentType: payload.html ? 'HTML' : 'Text',
        content: payload.html || payload.text || ''
      },
      toRecipients
    },
    saveToSentItems: true
  };
  if (payload.cc) {
    body.message.ccRecipients = (Array.isArray(payload.cc) ? payload.cc : [payload.cc]).map(a => ({ emailAddress: { address: a } }));
  }
  if (payload.bcc) {
    body.message.bccRecipients = (Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc]).map(a => ({ emailAddress: { address: a } }));
  }
  if (payload.fromName) {
    body.message.from = { emailAddress: { name: payload.fromName, address: account.email } };
  }

  const resp = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(account.email)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `MS Graph send failed (${resp.status})`);
  }
  return { id: `ms-${Date.now()}`, provider: 'microsoft', from: account.email };
}

/**
 * 统一发件入口：优先匹配 Resend 域名，其次匹配微软账号，最终 fallback
 */
export async function sendEmailUnified(env, payload) {
  const resendConfig = env.RESEND_API_KEY || env.RESEND_TOKEN || env.RESEND || '';
  const msConfig = env.MS_ACCOUNTS || '';
  const fromAddr = String(payload.from || '').toLowerCase().replace(/.*</, '').replace(/>.*/, '').trim();

  // 1. 尝试 Resend
  if (resendConfig) {
    const apiKey = selectApiKeyForDomain(payload.from, resendConfig);
    if (apiKey) {
      return { ...(await sendEmailWithResend(apiKey, payload)), provider: 'resend' };
    }
  }

  // 2. 尝试 Microsoft Graph
  if (msConfig) {
    const accounts = parseMsAccountsConfig(msConfig);
    const account = selectMsAccount(fromAddr, accounts);
    if (account) {
      return await sendEmailWithMs(account, payload);
    }
  }

  // 3. Fallback: Resend single key
  if (resendConfig && typeof resendConfig === 'string' && !resendConfig.includes('=') && !resendConfig.startsWith('[') && !resendConfig.startsWith('{')) {
    return { ...(await sendEmailWithResend(resendConfig, payload)), provider: 'resend' };
  }

  throw new Error(`No email provider configured for: ${fromAddr}`);
}

/**
 * 解析 RESEND_TOKEN 配置，支持多域名API密钥映射
 * @param {string} resendToken - RESEND_TOKEN 配置字符串
 * @returns {object} 域名到API密钥的映射对象
 */
function parseResendConfig(resendToken) {
  const config = {};
  if (!resendToken) return config;

  // 尝试解析为JSON格式
  try {
    const jsonConfig = JSON.parse(resendToken);
    if (typeof jsonConfig === 'object' && jsonConfig !== null) {
      return jsonConfig;
    }
  } catch (_) {
    // 不是JSON格式，继续尝试键值对格式
  }

  // 解析键值对格式：domain1=key1,domain2=key2
  const pairs = String(resendToken).split(',');
  for (const pair of pairs) {
    const [domain, apiKey] = pair.split('=').map(s => s.trim());
    if (domain && apiKey) {
      config[domain.toLowerCase()] = apiKey;
    }
  }

  return config;
}

/**
 * 根据发件人邮箱地址选择合适的API密钥
 * @param {string} fromEmail - 发件人邮箱地址
 * @param {string|object} resendConfig - RESEND配置字符串或已解析的配置对象
 * @returns {string} 选择的API密钥，如果没有匹配则返回空字符串
 */
export function selectApiKeyForDomain(fromEmail, resendConfig) {
  if (!fromEmail) return '';

  // 如果resendConfig是字符串且不包含等号，说明是单一API密钥
  if (typeof resendConfig === 'string' && !resendConfig.includes('=')) {
    return resendConfig;
  }

  // 解析配置
  const config = typeof resendConfig === 'object' 
    ? resendConfig 
    : parseResendConfig(resendConfig);

  // 提取发件人域名
  const emailMatch = String(fromEmail).match(/@([^>]+)/);
  if (!emailMatch) return '';

  const domain = emailMatch[1].toLowerCase().trim();
  
  // 查找匹配的API密钥
  return config[domain] || '';
}

/**
 * 获取所有配置的发送域名
 * @param {string|object} resendConfig - RESEND配置字符串或已解析的配置对象
 * @returns {Array<string>} 配置的域名列表
 */
export function getConfiguredDomains(resendConfig) {
  if (!resendConfig) return [];

  // 如果resendConfig是字符串且不包含等号，说明是单一API密钥，无法确定域名
  if (typeof resendConfig === 'string' && !resendConfig.includes('=')) {
    return [];
  }

  const config = typeof resendConfig === 'object' 
    ? resendConfig 
    : parseResendConfig(resendConfig);

  return Object.keys(config);
}

function buildHeaders(apiKey){
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}

function normalizeSendPayload(payload){
  const {
    from,
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    replyTo,
    headers,
    attachments,
    scheduledAt
  } = payload || {};

  const body = {
    from,
    to: Array.isArray(to) ? to : (to ? [to] : []),
    subject,
    html,
    text,
  };
  // 支持自定义发件显示名：fromName + <from>
  // 仅当 fromName 非空白时才拼接，避免产生 ` <email>` 导致 Resend 校验失败
  if (payload && typeof payload.fromName === 'string' && from){
    const displayName = payload.fromName.trim();
    if (displayName) {
      body.from = `${displayName} <${from}>`;
    }
  }
  if (cc) body.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) body.bcc = Array.isArray(bcc) ? bcc : [bcc];
  if (replyTo) body.reply_to = replyTo;
  if (headers && typeof headers === 'object') body.headers = headers;
  if (attachments && Array.isArray(attachments)) body.attachments = attachments;
  if (scheduledAt) body.scheduled_at = scheduledAt; // 传入 ISO 字符串
  return body;
}

export async function sendEmailWithResend(apiKey, payload){
  const body = normalizeSendPayload(payload);
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(()=>({}));
  if (!resp.ok){
    const msg = data?.message || data?.error || resp.statusText || 'Resend send failed';
    throw new Error(msg);
  }
  return data; // { id: '...' }
}

/**
 * 智能发送邮件：根据发件人域名自动选择API密钥
 * @param {string|object} resendConfig - RESEND配置字符串或已解析的配置对象
 * @param {object} payload - 邮件发送参数对象
 * @returns {Promise<object>} 发送结果
 * @throws {Error} 当找不到匹配的API密钥或发送失败时抛出异常
 */
export async function sendEmailWithAutoResend(resendConfig, payload) {
  const apiKey = selectApiKeyForDomain(payload.from, resendConfig);
  if (!apiKey) {
    throw new Error(`未找到域名对应的API密钥: ${payload.from}`);
  }
  return await sendEmailWithResend(apiKey, payload);
}

export async function sendBatchWithResend(apiKey, payloads){
  const items = Array.isArray(payloads) ? payloads.map(normalizeSendPayload) : [];
  const resp = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(items)
  });
  const data = await resp.json().catch(()=>({}));
  if (!resp.ok){
    const msg = data?.message || data?.error || resp.statusText || 'Resend batch send failed';
    throw new Error(msg);
  }
  return data; // 通常返回 [{id: '...'}, ...] 或 成功/失败结果数组
}

/**
 * 智能批量发送邮件：自动按域名分组并使用对应的API密钥
 * @param {string|object} resendConfig - RESEND配置字符串或已解析的配置对象
 * @param {Array<object>} payloads - 邮件发送参数对象数组
 * @returns {Promise<Array<object>>} 发送结果数组
 * @throws {Error} 当找不到匹配的API密钥或发送失败时抛出异常
 */
export async function sendBatchWithAutoResend(resendConfig, payloads) {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return [];
  }

  // 按域名分组邮件
  const groupedByDomain = {};
  for (const payload of payloads) {
    const apiKey = selectApiKeyForDomain(payload.from, resendConfig);
    if (!apiKey) {
      throw new Error(`未找到域名对应的API密钥: ${payload.from}`);
    }
    
    if (!groupedByDomain[apiKey]) {
      groupedByDomain[apiKey] = [];
    }
    groupedByDomain[apiKey].push(payload);
  }

  // 并行发送各组邮件
  const results = [];
  const promises = Object.entries(groupedByDomain).map(async ([apiKey, groupPayloads]) => {
    try {
      const batchResult = await sendBatchWithResend(apiKey, groupPayloads);
      return { success: true, apiKey, results: batchResult };
    } catch (error) {
      return { success: false, apiKey, error: error.message };
    }
  });

  const batchResults = await Promise.all(promises);
  
  // 收集结果
  for (const batchResult of batchResults) {
    if (batchResult.success) {
      if (Array.isArray(batchResult.results)) {
        results.push(...batchResult.results);
      } else {
        results.push(batchResult.results);
      }
    } else {
      throw new Error(`批量发送失败 (API密钥: ${batchResult.apiKey}): ${batchResult.error}`);
    }
  }

  return results;
}

export async function getEmailFromResend(apiKey, id){
  const resp = await fetch(`https://api.resend.com/emails/${id}`, {
    method: 'GET',
    headers: buildHeaders(apiKey)
  });
  const data = await resp.json().catch(()=>({}));
  if (!resp.ok){
    const msg = data?.message || data?.error || resp.statusText || 'Resend get failed';
    throw new Error(msg);
  }
  return data;
}

export async function updateEmailInResend(apiKey, { id, scheduledAt }){
  const body = {};
  if (scheduledAt) body.scheduled_at = scheduledAt;
  const resp = await fetch(`https://api.resend.com/emails/${id}`, {
    method: 'PATCH',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(()=>({}));
  if (!resp.ok){
    const msg = data?.message || data?.error || resp.statusText || 'Resend update failed';
    throw new Error(msg);
  }
  return data;
}

export async function cancelEmailInResend(apiKey, id){
  const resp = await fetch(`https://api.resend.com/emails/${id}/cancel`, {
    method: 'POST',
    headers: buildHeaders(apiKey)
  });
  const data = await resp.json().catch(()=>({}));
  if (!resp.ok){
    const msg = data?.message || data?.error || resp.statusText || 'Resend cancel failed';
    throw new Error(msg);
  }
  return data;
}


