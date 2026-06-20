# GoatCounter 每日访问量日报 — 设计

日期: 2026-06-20

## 目标
每天北京时间 09:00，把**昨天**三个项目的页面访问量(pageviews)汇总，通过 ServerChan(Server酱) 推送到微信。

三个项目：
- `tools.viii.me`（开发者工具，GoatCounter site 2）
- `bookmarkify.cc`（site 3）
- `tcyeee.top`（作品集 = 本 portfolio 仓库，**需新建 site 并接入埋点**）

`viii.me`(共享笔记) 与 `stats.viii.me`(博客/笔记) 不纳入。

## 关键约束 / 调研结论
- 自托管 GoatCounter（容器 `goatcounter`+`postgres`，nginx 反代）按 Host 头路由，多站点详见记忆 `goatcounter-multisite`。
- 本版本(2025-12 dev) 将原始 hit 聚合进 `hit_counts(site_id,path_id,hour,total)`，**只保留 pageviews**；原始 `hits` 被清空，**独立访客数不可得** → 指标定为 pageviews。
- `hit_counts.hour` 存 **UTC**，需转北京时区取“昨日”。
- 服务器时区已是 Asia/Shanghai；`ubuntu` 在 `docker` 组，cron 可直接 `docker exec`，无需 sudo。
- ServerChan：`POST https://sctapi.ftqq.com/<SENDKEY>.send`，参数 `title` + `desp`(markdown)。

## Part A — tcyeee.top 接入 GoatCounter
1. **新建 site**（SQL 克隆 site 2 结构）：parent=1，cname=`tcyeee.stats.viii.me`，新随机 code 与 secret，received_data=0。复用现有泛证书 `*.stats.viii.me` + 泛子域 nginx 块 → dashboard 与切换器自动可用。
2. **portfolio 埋点**（`src/layouts/Layout.astro`）：**移除 Umami**，加 GoatCounter 第一方脚本：
   ```html
   <script data-goatcounter="https://tcyeee.top/count" async src="/count.js"></script>
   ```
3. **nginx `tcyeee.top.conf`**：加 `location = /count` 与 `location = /count.js` → 反代 `goatcounter:8080`，`proxy_set_header Host tcyeee.stats.viii.me`（与 tools/bookmarkify 一致，埋点归到新 site）。先备份、`nginx -t`、reload。
4. 改完 `docker restart goatcounter` 加载新 site。
5. portfolio 代码改动需 build+推送（现有 GH Actions deploy）才生效；由用户决定何时推。

## Part B — 每日日报 cron
1. **SendKey** 写 `/home/ubuntu/.config/goatcounter-report.env`（`chmod 600`）：`SENDKEY=SCT365...`。
2. **脚本** `/home/ubuntu/scripts/goatcounter-daily-report.sh`：
   - source env 取 SENDKEY。
   - `docker exec postgres psql -tAF',' ...` 一条 SQL 查 site 2/3/tcyeee 昨日(北京)pageviews：
     `WHERE (h.hour AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai')::date = (now() AT TIME ZONE 'Asia/Shanghai')::date - 1`，按 site LEFT JOIN 保证 0 也出现。
   - 组装 markdown 表格（项目 / 昨日PV / 合计），`curl` ServerChan。
   - 查询失败/为空：发一条错误通知，非静默。
3. **crontab**(ubuntu)：`0 9 * * * /home/ubuntu/scripts/goatcounter-daily-report.sh >> /home/ubuntu/scripts/goatcounter-daily-report.log 2>&1`。

## 依赖顺序
B 对 tools/bookmarkify 立即可用；tcyeee.top 在 A 的埋点部署上线前显示 0。两部分共享同一目标，作为一个 spec 实现。

## 验证
- A：容器内 `Host: tcyeee.stats.viii.me` 返回面板；`curl tcyeee.top/count`(经 nginx) 后数据归到新 site。
- B：手动跑一次脚本，确认微信收到含三项+合计的日报。
