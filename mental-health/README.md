# 心晴：浏览器本地自评工具

在线地址：https://ddddddking.github.io/King/mental-health/

版本2.2 / 2026-11-05。依据用户上传的“心晴科研原型.zip”整合问卷数据与计分规则，保留线上2.1版本的完整CSS、配色、首页三条困扰路径、卡片、连续填写、结果和隐私交互。没有采用压缩包的研究工作台、导入面板或新导航。

## 本次新增

在原22份可填写问卷基础上新增14份，共36份（包含长短版本，不能解释为36个独立心理构念）：

| 新增完整问卷 | 计分与版本说明 |
| --- | --- |
| PDSS-SR | 7项各0–4，总0–28，另报七项平均0–4；不套用访谈他评PDSS分档 |
| LSAS-SR | 24情境各有恐惧和回避评分，48个评分项；两维各0–72、总0–144 |
| PHQ-8 | 8项各0–3，总0–24，不包含自杀条目，不能承担安全询问 |
| PCL-5 | 20项0–4，总0–80，另报B/C/D/E四簇原始分；不自动输出DSM诊断 |
| PC-PTSD-5 | 创伤暴露入口不计分，否则跳过后5项并计0；是则5项各是1分 |
| B-IPF | 7领域按适用项求和÷(6×适用项数)×100；不适用不进入分母，全不适用不计算 |
| GSE-10 | 10项1–4，无反向，总10–40 |
| RSES | 本页题序2/5/6/8/9反向，0–30；不混用不同中文题序 |
| SWLS | 5项1–7，总5–35 |
| FS-8 | 8项1–7，总8–56 |
| SPANE | P/N各6–30，另算P−N，范围−24至24；不把12项合并为总分 |
| CBI-19 | 个人/工作/服务对象分别平均0–100，第13项反向；领域不适用不记0 |
| IPIP-BFFM-50 | 五维各10–50，按官方方向计分；第四维是情绪稳定性 |
| TIPI-10 | 2/4/6/8/10反向，每维两项平均1–7，无人格总分 |

新增内容采用上传资料中的中文参考译文，不声称是已验证的正式中文临床修订版。来源、版本、时间范围及规则均可在各表“填写须知与版本”和“量表与依据”查看。原作者署名、版权及使用条件保留；用户提供的完整PDSS-SR和LSAS-SR参考题文已按请求接入，不据此声称获得原权利人的独立授权或临床背书。

原有22份包括PHQ-9、GAD-7、SAS、SDS、CES-D20、SIDAS、SCI-8、PHQ-15、K6/K10、WHO-5、ASRS-v1.1 6Q、BIS/BAS、原版EPQ-R短版48项、GDS-15、AUDIT、CAGE、FTND、AUDIT-C、PHQ-2、GAD-2、PHQ-4。

## 正式表计分辅助

共13个，不计入36份完整问卷：BDI-II、BAI、PDSS-SR、LSAS-SR、HCL-32、Y-BOCS原版10项、OCI-R、ISI、ESS、HADS、EPDS、QIDS-SR16、PSS-10。

除PSS-10输入未反向的原始回答值外，其余输入正式表已经赋好的最终项目分值，不能重复反向。HADS焦虑/抑郁各0–21并列显示；Y-BOCS观念/行为各0–20；QIDS按睡眠1–4、食欲体重6–9和精神运动15–16各取最大值，再与其余六域相加0–27；EPDS第10项和QIDS第12项非零单独提示安全评估。辅助没有对应题文，不能代替正式问卷。

压缩包未提供BDI-II、BAI、HCL-32、Y-BOCS、SCL-90、MMPI-2、16PF的完整题本，本次没有虚构这些题库或常模。专业工具目录和计分辅助分别标明当前实现方式。

## 关键计分约定

- SAS粗分×1.25取整数部分；SDS采用所列中国职业卫生来源的四舍五入规则，勿与其他取整方案混比。
- WHO-5高分较好，原始0–25乘4；SCI-8高分睡眠较好，所列原研究≤16为参考。
- ASRS-v1.1六项采用原阴影阈值[2,2,2,3,3,3]计数，不是ASRS-5。
- SIDAS首题0按原规则跳题，其余情况第2项反向；任何分数均不能用于确认安全或预测行为。
- K10使用所列ABS 10–50编码；不得与另一种0–40编码混用。
- EPQ-R原短版不等于中国EPQ-RSC，P/E/N/L各0–12，不用中国常模或一个人格总分；原1985 Table9的E正向题不包含第2项。
- PSS-10反向4/5/7/8，总0–40，原作者没有低/中/高诊断切点。
- CBI原表允许达到各域最低答题数后计算，本系统要求适用域完整回答；不适用时该域全部标记，避免把部分缺答当作0。

## 隐私和边界

单文件HTML，无服务器、账号、患者身份字段、分析追踪、外部脚本、远程字体、答案API或自动云同步。CSP包含connect-src 'none'和form-action 'none'；未使用fetch、XHR、WebSocket、Beacon或Service Worker。

答案默认在当前页面内存，主动保存才将摘要写入localStorage（未加密，不含逐题答案，最多100条）。旧版记录保留其原版本标记；关闭页面未保存答案会丢失。文字报告包含逐题回答，主动导出或分享应自行保管。离线HTML使用初始空白页面快照，不把当前答案、结果或历史嵌入下载文件。

GitHub Pages仍可记录普通网页访问/IP信息；点击外部来源链接将离开本站。“本机计算”指本站不自动上传作答或分数，不代表托管平台完全无访问日志。

本工具不是诊断、处方、急救或实时监护系统。参考译文及本网页未经过独立临床验证，程序测试不能证明临床准确率100%。当前安全问题需单独评估，不能等量表总分达到某条线。

## 验证

运行 `node mental-health/test.cjs`（仓库内）或在当前项目运行 `node test.cjs`。

回归检查622534项、扩展检查524项通过，包括PHQ9穷举、Zung取整、反向键、跳题、不适用分母、多维均分、SPANE差分、QIDS取最大域及隐私/CSP。扩展检查固定原CSS的SHA256，防止整合时替换原风格。

浏览器检查：PDSS-SR七项均4得到28/28、均分4；TIPI十项中立得到五维各4/7，概览正确显示分维结果；390px手机宽度下PC-PTSD-5入口选否则只需回答1项、后5项隐藏、总0/5。标准连字符缩写搜索已修正。所有测试输入均为虚构数据；未在实体微信或所有实体手机上测试。

## 主要新增原始依据

- VA PCL-5：https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp
- VA PC-PTSD-5：https://www.ptsd.va.gov/professional/assessment/screens/pc-ptsd.asp
- B-IPF：https://www.ptsd.va.gov/professional/assessment/functioning-other/ipf_psychosocial_function.asp
- CBI原表：https://nfa.dk/media/a4wheblj/cbi-scales.pdf
- IPIP五维key：https://www.ipip.ori.org/newBigFive5broadKey.htm
- TIPI：https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/
- GSE：https://userpage.fu-berlin.de/health/faq_gse.pdf
- RSES所用题序：https://www.sralab.org/sites/default/files/2017-06/Rosenberg%20Scale.pdf
- SWLS/FS/SPANE：https://eddiener.com/
- PDSS-SR原表：https://www.mcgill.ca/psy/files/psy/pdss.pdf
- LSAS资料：https://www.carlbring.se/fbanken/lsas-sr/
- QIDS：https://ids-qids.org/administration.html

完整原有与新增来源列表均在网页“量表与依据”内。
