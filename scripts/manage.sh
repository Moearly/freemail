#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# FreeMail 域名 & 部署管理脚本
# 用法:
#   ./scripts/manage.sh add-domain <domain>      添加新邮件域名（DNS + Email Routing + 部署）
#   ./scripts/manage.sh deploy                    部署 Worker
#   ./scripts/manage.sh status                    查看所有域名状态
#   ./scripts/manage.sh dns <domain>              查看域名 DNS 记录
#   ./scripts/manage.sh email-status <domain>     查看 Email Routing 状态
#   ./scripts/manage.sh test-email <address>      测试邮箱生成
#   ./scripts/manage.sh list-zones                列出所有 Cloudflare Zone
#   ./scripts/manage.sh set-secret <name> <value> 设置 Worker Secret
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WRANGLER_TOML="$PROJECT_DIR/wrangler.toml"
WORKER_NAME="mailfree"

CF_EMAIL="${CLOUDFLARE_EMAIL:-gmartnlei@gmail.com}"
CF_KEY="${CLOUDFLARE_API_KEY:-}"

if [[ -z "$CF_KEY" ]]; then
  echo "错误: 请设置 CLOUDFLARE_API_KEY 环境变量"
  echo "  export CLOUDFLARE_API_KEY=\"你的 Global API Key\""
  exit 1
fi

cf_api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -s -X "$method" "https://api.cloudflare.com/client/v4$endpoint" \
    -H "X-Auth-Email: $CF_EMAIL" \
    -H "X-Auth-Key: $CF_KEY" \
    -H "Content-Type: application/json" "$@"
}

get_zone_id() {
  local domain="$1"
  cf_api GET "/zones?name=$domain&per_page=5" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',[])
print(r[0]['id'] if r else '')
"
}

get_account_id() {
  cf_api GET "/accounts?per_page=1" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d['result'][0]['id'] if d.get('result') else '')
"
}

# ─── 列出所有 Zone ───
cmd_list_zones() {
  echo "=== Cloudflare Zones ==="
  cf_api GET "/zones?per_page=50" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for z in d.get('result',[]):
    print(f\"  {z['name']:30} {z['id']}  status={z['status']}\")
"
}

# ─── 查看域名 DNS 记录 ───
cmd_dns() {
  local domain="$1"
  local zone_id
  zone_id=$(get_zone_id "$domain")
  if [[ -z "$zone_id" ]]; then echo "错误: 域名 $domain 未在 Cloudflare 中找到"; exit 1; fi
  echo "=== DNS Records: $domain (zone: $zone_id) ==="
  cf_api GET "/zones/$zone_id/dns_records?per_page=100" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('result',[]):
    px = 'proxied' if r.get('proxied') else 'dns-only'
    pri = f' pri={r[\"priority\"]}' if 'priority' in r else ''
    print(f\"  {r['type']:6} {r['name']:40} {r.get('content','')[:70]:70} {px}{pri}\")
"
}

# ─── 查看 Email Routing 状态 ───
cmd_email_status() {
  local domain="$1"
  local zone_id
  zone_id=$(get_zone_id "$domain")
  if [[ -z "$zone_id" ]]; then echo "错误: 域名 $domain 未在 Cloudflare 中找到"; exit 1; fi

  echo "=== Email Routing: $domain ==="
  cf_api GET "/zones/$zone_id/email/routing" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',{})
print(f\"  enabled={r.get('enabled')}  status={r.get('status')}\")
errs=r.get('errors',[])
if errs:
    print(f'  errors ({len(errs)}):')
    for e in errs: print(f\"    - {e.get('code')}: {e.get('missing',{}).get('type','')} {e.get('missing',{}).get('name','')}\")
else:
    print('  errors: none')
"
  echo ""
  echo "  Routing Rules:"
  cf_api GET "/zones/$zone_id/email/routing/rules/catch_all" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',{})
actions=r.get('actions',[{}])
act=actions[0] if actions else {}
print(f\"    catch-all: type={act.get('type','?')} value={act.get('value','')} enabled={r.get('enabled')}\")
"
}

# ─── 添加新域名 ───
cmd_add_domain() {
  local domain="$1"
  echo "=== 添加域名: $domain ==="

  local zone_id
  zone_id=$(get_zone_id "$domain")
  if [[ -z "$zone_id" ]]; then
    echo "错误: 域名 $domain 未托管在 Cloudflare。请先在 Dashboard 添加此域名。"
    exit 1
  fi
  echo "  Zone ID: $zone_id"

  # 1. 检查并添加 MX 记录
  echo ""
  echo "--- Step 1: MX 记录 ---"
  local existing_mx
  existing_mx=$(cf_api GET "/zones/$zone_id/dns_records?type=MX&name=$domain" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('result',[]):
    print(r.get('content',''))
")

  for mx_host in "route1.mx.cloudflare.net" "route2.mx.cloudflare.net" "route3.mx.cloudflare.net"; do
    if echo "$existing_mx" | grep -q "$mx_host"; then
      echo "  MX $mx_host — 已存在，跳过"
    else
      local pri=77
      [[ "$mx_host" == *route2* ]] && pri=78
      [[ "$mx_host" == *route3* ]] && pri=96
      local res
      res=$(cf_api POST "/zones/$zone_id/dns_records" \
        -d "{\"type\":\"MX\",\"name\":\"$domain\",\"content\":\"$mx_host\",\"priority\":$pri,\"ttl\":1}")
      local ok
      ok=$(echo "$res" | python3 -c "import json,sys;print(json.load(sys.stdin).get('success',False))")
      echo "  MX $mx_host pri=$pri — $([[ "$ok" == "True" ]] && echo '添加成功' || echo '添加失败')"
    fi
  done

  # 2. SPF 记录
  echo ""
  echo "--- Step 2: SPF 记录 ---"
  local spf_exists
  spf_exists=$(cf_api GET "/zones/$zone_id/dns_records?type=TXT&name=$domain" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('result',[]):
    if '_spf.mx.cloudflare.net' in r.get('content',''):
        print('yes')
        break
")
  if [[ "$spf_exists" == "yes" ]]; then
    echo "  SPF 记录已存在，跳过"
  else
    local res
    res=$(cf_api POST "/zones/$zone_id/dns_records" \
      -d "{\"type\":\"TXT\",\"name\":\"$domain\",\"content\":\"v=spf1 include:_spf.mx.cloudflare.net ~all\",\"ttl\":1}")
    local ok
    ok=$(echo "$res" | python3 -c "import json,sys;print(json.load(sys.stdin).get('success',False))")
    echo "  SPF — $([[ "$ok" == "True" ]] && echo '添加成功' || echo '添加失败')"
  fi

  # 3. 启用 Email Routing
  echo ""
  echo "--- Step 3: 启用 Email Routing ---"
  local er_res
  er_res=$(cf_api POST "/zones/$zone_id/email/routing/enable")
  local er_status
  er_status=$(echo "$er_res" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('result',{}).get('status','?'))")
  echo "  Email Routing status: $er_status"

  # 4. 获取 DKIM 并添加
  echo ""
  echo "--- Step 4: DKIM 记录 ---"
  local routing_info
  routing_info=$(cf_api GET "/zones/$zone_id/email/routing")
  local dkim_missing
  dkim_missing=$(echo "$routing_info" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for e in d.get('result',{}).get('errors',[]):
    m=e.get('missing',{})
    if 'dkim' in e.get('code',''):
        print(f\"{m.get('name','')}|||{m.get('content','')}\")
")
  if [[ -n "$dkim_missing" ]]; then
    while IFS='|||' read -r dkim_name dkim_content; do
      if [[ -n "$dkim_name" && -n "$dkim_content" ]]; then
        local res
        res=$(cf_api POST "/zones/$zone_id/dns_records" \
          -d "{\"type\":\"TXT\",\"name\":\"$dkim_name\",\"content\":\"$dkim_content\",\"ttl\":1}")
        local ok
        ok=$(echo "$res" | python3 -c "import json,sys;print(json.load(sys.stdin).get('success',False))")
        echo "  DKIM $dkim_name — $([[ "$ok" == "True" ]] && echo '添加成功' || echo '已存在或失败')"
      fi
    done <<< "$dkim_missing"
  else
    echo "  DKIM 已配置或无需配置"
  fi

  # 5. 配置 catch-all → Worker
  echo ""
  echo "--- Step 5: Catch-all → Worker ---"
  local catchall_res
  catchall_res=$(cf_api PUT "/zones/$zone_id/email/routing/rules/catch_all" \
    -d "{\"matchers\":[{\"type\":\"all\"}],\"actions\":[{\"type\":\"worker\",\"value\":[\"$WORKER_NAME\"]}],\"enabled\":true,\"name\":\"catch-all to $WORKER_NAME\"}")
  local catchall_ok
  catchall_ok=$(echo "$catchall_res" | python3 -c "import json,sys;print(json.load(sys.stdin).get('success',False))")
  echo "  Catch-all → $WORKER_NAME — $([[ "$catchall_ok" == "True" ]] && echo '配置成功' || echo '配置失败')"

  # 6. 更新 wrangler.toml
  echo ""
  echo "--- Step 6: 更新 wrangler.toml ---"
  local current_domains
  current_domains=$(grep 'MAIL_DOMAIN' "$WRANGLER_TOML" | sed 's/.*= *"//' | sed 's/".*//')
  if echo "$current_domains" | grep -q "$domain"; then
    echo "  MAIL_DOMAIN 已包含 $domain，跳过"
  else
    local new_domains="$domain,$current_domains"
    sed -i "s|MAIL_DOMAIN.*=.*\".*\"|MAIL_DOMAIN    = \"$new_domains\"|" "$WRANGLER_TOML"
    echo "  MAIL_DOMAIN 更新为: $new_domains"
  fi

  # 检查路由是否已存在
  if grep -q "pattern = \"$domain" "$WRANGLER_TOML"; then
    echo "  路由已存在，跳过"
  else
    sed -i "/^routes = \[/a\\  { pattern = \"$domain/*\", zone_name = \"$domain\" }," "$WRANGLER_TOML"
    echo "  路由已添加: $domain/* → $domain"
  fi

  echo ""
  echo "=== 域名 $domain 配置完成 ==="
  echo "运行 ./scripts/manage.sh deploy 部署生效"
}

# ─── 部署 ───
cmd_deploy() {
  echo "=== 部署 Worker ==="
  cd "$PROJECT_DIR"
  export CLOUDFLARE_API_KEY="$CF_KEY"
  export CLOUDFLARE_EMAIL="$CF_EMAIL"
  unset CLOUDFLARE_API_TOKEN 2>/dev/null || true
  npx wrangler deploy
}

# ─── 查看所有域名状态 ───
cmd_status() {
  echo "=== FreeMail 域名状态 ==="
  local current_domains
  current_domains=$(grep 'MAIL_DOMAIN' "$WRANGLER_TOML" | sed 's/.*= *"//' | sed 's/".*//')
  echo "配置的邮件域名: $current_domains"
  echo ""

  IFS=',' read -ra domains <<< "$current_domains"
  for domain in "${domains[@]}"; do
    domain=$(echo "$domain" | xargs)
    echo "--- $domain ---"
    local zone_id
    zone_id=$(get_zone_id "$domain")
    if [[ -z "$zone_id" ]]; then
      echo "  未在 Cloudflare 中找到"
      continue
    fi

    # Email Routing 状态
    local er
    er=$(cf_api GET "/zones/$zone_id/email/routing" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',{})
print(f\"enabled={r.get('enabled')} status={r.get('status')} errors={len(r.get('errors',[]))}\")
")
    echo "  Email Routing: $er"

    # Catch-all 规则
    local ca
    ca=$(cf_api GET "/zones/$zone_id/email/routing/rules/catch_all" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',{})
a=r.get('actions',[{}])[0] if r.get('actions') else {}
print(f\"type={a.get('type','?')} target={a.get('value','')} enabled={r.get('enabled')}\")
")
    echo "  Catch-all: $ca"
    echo ""
  done
}

# ─── 测试邮箱生成 ───
cmd_test_email() {
  local addr="${1:-}"
  local base_url="https://freemail.best"
  local token="${JWT_TOKEN:-}"
  local auth_header=""

  if [[ -n "$token" ]]; then
    auth_header="-H \"Authorization: Bearer $token\""
    echo "=== 测试邮箱功能 (已认证) ==="
  else
    echo "=== 测试邮箱功能 (匿名) ==="
    echo "提示: 持久化操作需要 JWT_TOKEN，设置方式: export JWT_TOKEN=xxx"
  fi

  echo "--- 生成临时邮箱 ---"
  curl -s "$base_url/api/generate" | python3 -m json.tool

  if [[ -n "$token" ]]; then
    echo ""
    echo "--- 生成持久化邮箱 (需管理员Token) ---"
    curl -s -H "Authorization: Bearer $token" "$base_url/api/generate?persistent=true" | python3 -m json.tool
  fi

  if [[ -n "$addr" && -n "$token" ]]; then
    echo ""
    echo "--- 查询邮箱状态: $addr (需管理员Token) ---"
    curl -s -H "Authorization: Bearer $token" "$base_url/api/mailbox/status?address=$addr" | python3 -m json.tool
  elif [[ -n "$addr" ]]; then
    echo ""
    echo "--- 查询邮箱状态: 需要 JWT_TOKEN ---"
  fi

  echo ""
  echo "--- 域名列表 ---"
  curl -s "$base_url/api/domains" | python3 -m json.tool
}

# ─── 设置 Secret ───
cmd_set_secret() {
  local name="$1" value="$2"
  echo "=== 设置 Secret: $name ==="
  cd "$PROJECT_DIR"
  export CLOUDFLARE_API_KEY="$CF_KEY"
  export CLOUDFLARE_EMAIL="$CF_EMAIL"
  unset CLOUDFLARE_API_TOKEN 2>/dev/null || true
  echo "$value" | npx wrangler secret put "$name"
}

# ─── 主入口 ───
case "${1:-help}" in
  add-domain)
    [[ -z "${2:-}" ]] && { echo "用法: $0 add-domain <domain>"; exit 1; }
    cmd_add_domain "$2"
    ;;
  deploy)
    cmd_deploy
    ;;
  status)
    cmd_status
    ;;
  dns)
    [[ -z "${2:-}" ]] && { echo "用法: $0 dns <domain>"; exit 1; }
    cmd_dns "$2"
    ;;
  email-status)
    [[ -z "${2:-}" ]] && { echo "用法: $0 email-status <domain>"; exit 1; }
    cmd_email_status "$2"
    ;;
  test-email)
    cmd_test_email "${2:-}"
    ;;
  list-zones)
    cmd_list_zones
    ;;
  set-secret)
    [[ -z "${2:-}" || -z "${3:-}" ]] && { echo "用法: $0 set-secret <name> <value>"; exit 1; }
    cmd_set_secret "$2" "$3"
    ;;
  help|*)
    echo "FreeMail 管理脚本"
    echo ""
    echo "用法: $0 <command> [args]"
    echo ""
    echo "命令:"
    echo "  add-domain <domain>       添加新邮件域名（一键配置 DNS + Email Routing）"
    echo "  deploy                    部署 Worker 到 Cloudflare"
    echo "  status                    查看所有域名的 Email Routing 状态"
    echo "  dns <domain>              查看域名 DNS 记录"
    echo "  email-status <domain>     查看 Email Routing 详情"
    echo "  test-email [address]      测试邮箱生成功能"
    echo "  list-zones                列出 Cloudflare 所有域名"
    echo "  set-secret <name> <value> 设置 Worker Secret"
    echo "  help                      显示帮助"
    echo ""
    echo "环境变量:"
    echo "  CLOUDFLARE_API_KEY        Cloudflare Global API Key (必需)"
    echo "  CLOUDFLARE_EMAIL          Cloudflare 账号邮箱 (默认: gmartnlei@gmail.com)"
    echo ""
    echo "示例:"
    echo "  export CLOUDFLARE_API_KEY=\"your-key\""
    echo "  $0 add-domain newdomain.xyz     # 一键添加新域名"
    echo "  $0 deploy                       # 部署更新"
    echo "  $0 status                       # 查看状态"
    ;;
esac
