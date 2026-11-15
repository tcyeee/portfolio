---
created: 2026-04-09 17:58
category: 技术笔记
tags:
  - article
  - tech
  - 运维
---

# Let's Encrypt SSL 证书申请与更新攻略

> 适用场景：个人网站 + 阿里云 OSS 自定义域名

---

## 前置准备

- 已安装 Certbot（或使用 acme.sh）
- 拥有域名的 DNS 控制权
- 服务器可 SSH 登录（个人网站场景）

---

## 一、安装 Certbot

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# CentOS / RHEL
sudo yum install certbot python3-certbot-nginx -y

# macOS（本地测试用）
brew install certbot
```

---

## 二、个人网站申请证书

> **大陆服务器注意**：未完成 ICP 备案前，HTTP 80 端口会被运营商拦截并跳转备案提示页，导致 Certbot 的 webroot / standalone HTTP 验证全部失败（报 `unauthorized` 错误）。**必须使用 DNS 验证**，与端口无关。

### 方式 A：Nginx 自动模式（非 Docker、已备案）

Certbot 自动修改 Nginx 配置并完成验证，如果是使用 Docker 部署的 Nginx，则跳过此方式。

```bash
# tcyeee
sudo certbot --nginx -d tcyeee.top -d www.tcyeee.top
sudo certbot --nginx -d file.tcyeee.top -d www.file.tcyeee.top
sudo certbot --nginx -d i.tcyeee.top -d www.i.tcyeee.top

# bookmarkify
sudo certbot --nginx -d bookmarkify.cc -d www.bookmarkify.cc
sudo certbot --nginx -d file.bookmarkify.cc -d www.file.bookmarkify.cc
```

完成后证书路径：
- 证书：`/etc/letsencrypt/live/example.com/fullchain.pem`
- 私钥：`/etc/letsencrypt/live/example.com/privkey.pem`

Nginx 配置会被自动更新，验证完成后重载：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 方式 B：DNS 验证（Docker Nginx / 未备案 / 推荐）

DNS 验证不依赖 HTTP 端口，是大陆未备案服务器和 Docker 部署场景的唯一可用方式。

```bash
# tcyeee
sudo certbot certonly --manual --preferred-challenges dns \
  -d tcyeee.top -d www.tcyeee.top

sudo certbot certonly --manual --preferred-challenges dns \
  -d file.tcyeee.top

sudo certbot certonly --manual --preferred-challenges dns \
  -d i.tcyeee.top

# bookmarkify
sudo certbot certonly --manual --preferred-challenges dns \
  -d bookmarkify.cc -d www.bookmarkify.cc

sudo certbot certonly --manual --preferred-challenges dns \
  -d file.bookmarkify.cc
  
sudo certbot certonly --manual --preferred-challenges dns \
-d viii.me -d www.viii.me
```

Certbot 会提示添加 TXT 记录，例如：

```
Please deploy a DNS TXT record under the name:
_acme-challenge.tcyeee.top
with the following value:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Press Enter to Continue
```

**操作步骤：**

1. 登录 [DNSPod 控制台]([https://dc.console.aliyun.com/next/index#/domain-list/all](https://dnsnext.console.aliyun.com/authoritative))，添加记录：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| TXT | `_acme-challenge` | Certbot 提供的字符串 |

2. 等待 DNS 生效，可用以下命令确认：

```bash
dig TXT _acme-challenge.tcyeee.top
```

3. 确认出现后回车，证书申请完成


**操作记录**
```
root@server:~# sudo certbot certonly --manual --preferred-challenges dns   -d tcyeee.top -d www.tcyeee.top
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for tcyeee.top and www.tcyeee.top

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name:

_acme-challenge.www.tcyeee.top.

with the following value:

[TXT_VALUE]

Before continuing, verify the TXT record has been deployed. Depending on the DNS
provider, this may take some time, from a few seconds to multiple minutes. You can
check if it has finished deploying with aid of online tools, such as the Google
Admin Toolbox: https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.www.tcyeee.top.
Look for one or more bolded line(s) below the line ';ANSWER'. It should show the
value(s) you've just added.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continuec

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/tcyeee.top/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/tcyeee.top/privkey.pem
This certificate expires on 2026-07-08.
These files will be updated when the certificate renews.

NEXT STEPS:
- This certificate will not be renewed automatically. Autorenewal of --manual certificates requires the use of an authentication hook script (--manual-auth-hook) but one was not provided. To renew this certificate, repeat this same certbot command before the certificate's expiry date.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```


#### 将证书部署到 Docker Nginx

Certbot 在宿主机申请证书后，需手动同步到容器挂载目录。

**目录结构：**

```
docker/nginx/
├── cert/               ← 证书挂载目录
├── conf.d/
└── docker-compose.yml
```

**同步证书：**

```bash
DOMAIN="tcyeee.top"
CERT_SRC="/etc/letsencrypt/live/$DOMAIN"
CERT_DST="/home/ubuntu/docker/nginx/cert"

sudo cp "$CERT_SRC/fullchain.pem" "$CERT_DST/$DOMAIN.pem"
sudo cp "$CERT_SRC/privkey.pem"   "$CERT_DST/$DOMAIN.pem"
sudo chmod 644 "$CERT_DST/"*.pem
```

**确认 docker-compose.yml 挂载配置：**

```yaml
volumes:
  - ./nginx/cert:/etc/nginx/cert:ro
```

**确认 nginx.conf 中的证书路径：**

```nginx
ssl_certificate     /etc/nginx/cert/fullchain.pem;
ssl_certificate_key /etc/nginx/cert/privkey.pem;
```

**重载 Nginx 容器：**

```bash
docker exec <容器名> nginx -s reload
# 或
docker compose exec nginx nginx -s reload
```

---

## 三、阿里云 OSS 自定义域名申请证书

OSS 不能使用 Certbot 的 HTTP 验证，**必须使用 DNS 验证**。

### 步骤 1：申请证书（DNS 验证）

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d your-oss-domain.com
```

按提示在阿里云 DNS 控制台添加 TXT 记录：

| 记录类型 | 主机记录              | 记录值            |
| ---- | ----------------- | -------------- |
| TXT  | `_acme-challenge` | Certbot 提供的字符串 |

等待 DNS 生效后按回车，证书申请成功。

### 步骤 2：导出证书内容

如果使用 **acme.sh** 申请的证书（推荐）：

```bash
# i.tcyeee.top_ecc 需要被替换
cat ~/.acme.sh/i.tcyeee.top_ecc/fullchain.cer
cat ~/.acme.sh/i.tcyeee.top_ecc/your-oss-domain.key
```

如果使用 **Certbot** 申请的证书：

```bash
sudo cat /etc/letsencrypt/live/your-oss-domain.com/fullchain.pem
sudo cat /etc/letsencrypt/live/your-oss-domain.com/privkey.pem
```

### 步骤 3：上传到阿里云 OSS

1. 登录阿里云控制台 → **[对象存储 OSS](https://oss.console.aliyun.com/bucket/oss-cn-hangzhou/tcyeee/configuration/domain)**
2. 进入对应 Bucket → **传输管理** → **自定义域名**
3. 点击域名旁的 **证书托管**
4. 选择 **上传证书**，粘贴：
   - **证书内容**：`fullchain.cer`（或 `fullchain.pem`）的内容
   - **证书私钥**：`*.key`（或 `privkey.pem`）的内容
5. 保存

---

## 四、自动续期（acme.sh + 阿里云 DNS API）

Certbot `--manual` 模式无法自动续期。改用 **acme.sh**，通过阿里云 DNS API 自动完成 TXT 记录的添加与删除，实现全自动续期。

### 步骤 1：获取阿里云 AccessKey
> 建议使用子用户而非主账号的 AccessKey，降低泄露风险。

1. 登录阿里云控制台 → **[RAM 访问控制](https://ram.console.aliyun.com/overview?activeTab=workflow)** → **用户** → 创建子用户
2. 勾选「OpenAPI 调用访问」，保存 `AccessKey ID` 和 `AccessKey Secret`
3. 为该用户授权 **AliyunDNSFullAccess** 策略
4. 创建成功

### 步骤 2：安装 acme.sh

```bash
curl https://get.acme.sh | sh -s email=tcyeee@outlook.com
source ~/.bashrc
```

中国大陆地区备用地址
```shell
git clone https://gitee.com/neilpang/acme.sh.git
cd acme.sh
./acme.sh --install -m tcyeee@outlook.com
```


acme.sh 安装后会自动注册 cron 任务（每天检查一次），无需手动配置。

### 步骤 3：配置阿里云 API 凭证

- 阿里云相关账户

```bash
## 添加环境变量
export Ali_Key="替换"
export Ali_Secret="替换"
```

acme.sh 会在首次申请时将凭证保存到 `~/.acme.sh/account.conf`，后续续期无需重新配置。

### 步骤 4：申请证书


```bash
# tcyeee.top
~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d tcyeee.top -d www.tcyeee.top

~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d file.tcyeee.top

~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d i.tcyeee.top

# bookmarkify.cc
~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d bookmarkify.cc -d www.bookmarkify.cc

~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d file.bookmarkify.cc
  
~/.acme.sh/acme.sh --issue --dns dns_ali \
  -d viii.me  
```

acme.sh 会自动调用阿里云 API 添加 TXT 记录、等待验证、再自动删除，全程无需人工干预。

证书默认保存在 `~/.acme.sh/域名/` 目录下。

### 步骤 5：将证书部署到 Docker Nginx

acme.sh 提供 `--install-cert` 命令，可在每次续期后自动执行部署脚本。五个域名一次性跑完：

```bash
CERT_DST="/home/ubuntu/docker/nginx/cert"
CONTAINER="nginx"

for DOMAIN in tcyeee.top file.tcyeee.top i.tcyeee.top bookmarkify.cc file.bookmarkify.cc; do
  ~/.acme.sh/acme.sh --install-cert -d $DOMAIN \
    --cert-file      "$CERT_DST/$DOMAIN.cer" \
    --key-file       "$CERT_DST/$DOMAIN.key" \
    --fullchain-file "$CERT_DST/$DOMAIN.fullchain.cer" \
    --reloadcmd      "docker exec $CONTAINER nginx -s reload"
done
```

每个域名证书以域名为前缀单独存放，不会互相覆盖。对应 nginx.conf 中各域名写各自路径：
注意后缀是**fullchain.cer**

```nginx
ssl_certificate     /etc/nginx/cert/tcyeee.top.fullchain.cer;
ssl_certificate_key /etc/nginx/cert/tcyeee.top.key;
```

`--reloadcmd` 会在每次续期部署后自动执行，Nginx 容器无需手动重载。

### 自动续期原理

步骤 2-5 只需执行一次，之后续期完全自动。原理如下：

- **步骤 4 `--issue`** 执行时，acme.sh 将域名、DNS 驱动、API 凭证保存到 `~/.acme.sh/tcyeee.top/tcyeee.top.conf`
- **步骤 5 `--install-cert`** 执行时，部署路径和 `--reloadcmd` 也一并写入该配置文件
- **安装 acme.sh 时**自动注册了一条 cron：

```
0 0 * * * ~/.acme.sh/acme.sh --cron --home ~/.acme.sh
```

每天凌晨 cron 触发，acme.sh 读取已保存的配置，检查证书是否在 30 天内到期。到期时自动执行完整流程：

```
调阿里云 API 加 TXT 记录 → 验证通过 → 删 TXT 记录 → 部署证书到指定路径 → 执行 reloadcmd 重载 Nginx
```

可用以下命令确认 cron 已注册：

```bash
crontab -l | grep acme
```

### OSS 证书续期

OSS 不支持自动推送，每次续期后仍需**手动**重新上传证书到控制台（见第三章步骤 3）。

---

## 五、验证证书是否生效

```bash
# 检查网站证书
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -dates

# 或使用在线工具
# https://www.ssllabs.com/ssltest/
```

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `unauthorized` 跳转备案页 | 大陆服务器未备案，80 端口被拦截 | 改用 DNS 验证（`--preferred-challenges dns`） |
| `Too many certificates` | 同域名 7 天内申请超 5 次 | 等待约 1 周后重试 |
| DNS TXT 记录不生效 | TTL 缓存未刷新 | 等待 2-5 分钟，用 `dig TXT _acme-challenge.域名` 确认后再回车 |
| Nginx reload 失败 | 证书路径配置错误 | 检查容器内路径与 volume 映射是否一致 |
| OSS 证书上传报错 | fullchain 与 privkey 不匹配 | 确认两个文件来自同一次申请 |
