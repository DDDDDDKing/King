# 心晴：焦虑与抑郁本地自评

面向成年人自我了解的静态网站。不是医疗器械，不提供诊断、治疗建议或实时监护。量表原有验证不等于本网站经过临床验证。医院正式使用前需精神心理专业人员审核版本、授权、流程及风险管理。

## 使用

入口：`mental-health/index.html`。该目录独立部署于现有 GitHub Pages，不修改原站首页。单文件，无构建、依赖、接口或数据库。浏览器可直接打开。页面内提供规则、来源、参考资料及离线版下载。

## 收录与计分

| 量表 | 回顾时间 | 本版规则 |
|---|---|---|
| PHQ-9 | 2 周 | 每项 0–3，总分 0–27；分档 0–4 / 5–9 / 10–14 / 15–19 / 20–27；≥10 提示进一步评估 |
| GAD-7 | 2 周 | 每项 0–3，总分 0–21；分档 0–4 / 5–9 / 10–14 / 15–21；本版 ≥10 提示进一步评估 |
| PHQ-2 / GAD-2 | 2 周 | 对应完整版前 2 项；0–6，各 ≥3 初筛阳性 |
| PHQ-4 | 2 周 | 按中文原表，GAD-2 在前，PHQ-2 在后；总分 0–12；0–2 / 3–5 / 6–8 / 9–12 表示心理困扰程度；分别评估两分量表 ≥3 |
| SAS | 1 周 | 正向 1–4，反向题 5/9/13/17/19；粗分 20–80；×1.25 取整数部分；<50 / 50–59 / 60–69 / ≥70 |
| SDS | 1 周 | 正向 1–4，反向题 2/5/6/11/12/14/16/17/18/20；粗分 20–80；×1.25 四舍五入；<53 / 53–62 / 63–72 / ≥73 |

PHQ/GAD 功能影响附题不计入总分。未答完整不得计算。PHQ-9 第 9 项 >0、SDS 第 19 项非最低频率会独立触发安全提示，不依赖总分；单项不能确定风险。其他工具没有安全题不表示没有风险。

SDS 公开资料存在截断/四舍五入两种规则。本版明确采用四舍五入，并展示粗分、未取整结果和标准分。例如粗分 42，本版为 53，截断版为 52。GBZ/T 164—2022 是核动力厂操纵人员职业健康标准，引用其附录仅作换算依据，不将其作为普通精神科诊断指南。其 SDS 72 分处分级重叠，本版用互斥区间；整数粗分乘 1.25 四舍五入后实际不能出现 72 分，因此 ≥73 与该附录 ≥72 对可达分数结果一致。SAS 的本版取整按青岛大学参考，不能与其他版本混用。

## 来源

核对于 2026-11-05，页面也包含各量表专属链接。

- 原版 PHQ/GAD 手册：https://www.hss.gov.nt.ca/professionals/sites/professionals/files/resources/instruction-manual-phq-scoring.pdf
- DC/TMD 中文工具 2016 版（印刷页 48、50、52）：https://ubwp.buffalo.edu/rdc-tmdinternational/wp-content/uploads/sites/58/2017/01/DC-TMD-Chinese-Assessment-Instruments_2016_8_11.pdf
- PHQ-4：https://www.mcgill.ca/schoolofmedicine-learneraffairs/pgme/wellness-support/self-screening-tools/anxiety-and-depression-phq-4
- SAS：https://xgzx.qdu.edu.cn/info/1113/4250.htm
- SDS 四舍五入：https://www.nhc.gov.cn/fzs/c100048/202211/639c68e47cac4815813037f99a3f24aa/files/1734000601083_86919.pdf
- SDS 题文、反向项目和互斥分档（该来源换算为截断法，本站单独注明差异）：https://phy.ujs.edu.cn/info/1163/2844.htm
- SDS 四舍五入中文资料：https://xgb.lzufe.edu.cn/info/1213/5015.htm
- DASS FAQ：https://dass.psy.unsw.edu.au/DASSFAQ.htm
- HADS：https://www.gl-assessment.co.uk/products/hospital-anxiety-depression-scale/
- APA 其他抑郁评定工具：https://www.apa.org/depression-guideline/assessment

PHQ/GAD 原表注明无需许可即可复制、翻译、展示或分发，作者及资助归属保留于页面。SAS/SDS 来源公开不等于已核实所有商业数字化用途的授权。未将受版权保护的 HADS、BDI-II、BAI 题库公开复制。DASS 开发者不建议向受测者自动提供分数及解释，因此本站仅给出获取方向。HAMD、HAMA、MADRS 属专业他评，未作为自评上线。所列机构不为本站背书。

## 隐私

- 所有答案与分数仅在浏览器运算；不在 URL、网络请求或 GitHub 仓库中保存答题信息。
- 不收集姓名、联系方式；没有登录、远程字体、第三方脚本、统计追踪。
- CSP 限制 `connect-src 'none'`、`form-action 'none'`；没有 fetch/XHR/WebSocket/beacon 或后台服务。
- 默认仅内存，刷新即丢失。主动点击保存才将摘要写入专用 localStorage 键 `xinqing-local-results-v1`，不保存逐题答案；最多 100 条。
- 本机摘要未加密；同域页面、设备备份和扩展等不由本应用控制。导出报告含逐题回答，主动分享文件属于用户行为。
- GitHub Pages 仍可能产生 IP、访问时间等托管日志。外部参考链接只有点击时才访问。
- 离线下载使用应用初始化前的原始页面快照，不将当前答案、结果或本机历史嵌入下载文件。无 Service Worker，不影响同域其他网站。

## 验证

在此目录执行 `node test.cjs`。测试独立写明参考边界，遍历所有 262,144 种 PHQ-9 答题组合，覆盖 SAS/SDS 所有整数粗分 20–80、每个反向条目、缺失/越界输入、PHQ-4 分量表顺序、独立安全提示、脚本语法和静态网络审计。

浏览器操作已检查漏答拦截、PHQ-4 6 分/两分量表各 3 分、功能附题不计分、主动本机保存及刷新持久化、PHQ-9 总分 1 仍显示安全提示。布局提供手机断点和触摸选项，但尚未经实体安卓/微信设备全面测试。程序测试不能证明临床准确率 100%，也不能确定某人的诊断。
