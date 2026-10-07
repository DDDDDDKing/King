# WordNest 词巢

6,000 个英汉词条，每日默认 5 个新词 + 5 个旧词。静态网页，没有构建依赖。

## 预设部署位置（此次尚未上传成功）

- 页面目录：`DDDDDDKing/King` 仓库的 `wordnest/`。
- 学习进度：`wordnest/progress/user-<用户名UTF-8十六进制>.json`。
- 页面地址：`https://ddddddking.github.io/King/wordnest/`。
- 不修改仓库原有首页。

## 家庭开始使用

1. 打开网页，输入用户名。例如“小王”。用户名无需密码。同一个用户名对应同一档案，大小写、全半角会归一化。
2. 家长第一次在各台可信设备的「学习设置 → GitHub 家庭同步」粘贴仓库令牌。
3. 勾选「在这台可信设备记住授权」，以后孩子只需输入用户名。
4. 每个单词完成后先保存本机。停止操作15秒、完成一组或点击「立即同步」时写入 GitHub。离线记录下次上线合并。
5. 换设备后输入完全相同的用户名。两设备会合并独立练习事件，不用最后一次整份覆盖。

### 获取免费仓库授权

GitHub 右上头像 → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token。

- Resource owner：DDDDDDKing
- Repository access：Only select repositories，只选 King
- Repository permissions → Contents：Read and write
- 设置到期日期并保存。到期后需要更新设备授权。
- 不需要 Actions、Workflows、Administration 等写权限。

令牌只放在网页设置中，**不要放到 config.js 或任何提交到 GitHub 的文件里**。它可以写入所选仓库，不能仅限定到某个文件夹。若希望与已有网站完全隔离，可建立专用数据仓库，把设置里的仓库名改为该仓库。

「记住授权」使用此设备的 localStorage，未勾选时只在本浏览会话的 sessionStorage 中保存。不要在公共电脑勾选。点击「移除此设备授权」可清除。备份和进度文件不包含令牌。

ChatGPT 的 GitHub 连接只授权 ChatGPT 操作仓库，不会把写权限转移给网页访问者，所以这一步仍由仓库所有者在设备上完成。

## 功能

- 单词卡、跟读发音、认义选择题、听音辨义、拼写练习。
- 根据回答安排下次复习：忘记10分钟后；困难更早；熟悉逐步延长间隔。
- 可调每日目标、英美口音、语速、自动朗读。
- 6000词检索、学习阶段过滤、错词本、收藏。
- 连续天数、学习热力图、每日记录、家长小结。
- 手机适配、键盘操作、进度JSON导入导出。
- Service Worker 缓存网页，成功打开一次后可离线学习。发音离线可用性取决于设备英语语音包。

这是家庭共享档案，不是真正的账号认证。知道用户名的人可进入该档案；拥有令牌的人可修改仓库内容。学习记录按仓库可见性公开。本项目不收集密码。

每日只有5个复习名额，不能让全部单词都覆盖所有间隔。首页展示待复习数量，可以增加复习目标或进行额外练习。今日任务生成后固定，目标设置从明天生效。

发音使用 Web Speech API 系统英语语音，非真人原声库。可点击词典链接查看 Cambridge Dictionary 例句和发音。内置少量启蒙例句为项目自写，不冒充版权原声素材。

## 数据与历史

词表来自此前生成的 Excel，来源 ECDICT（MIT）：https://github.com/skywind3000/ECDICT 。前485词优先安排儿童日常词，其后结合词库学习标签、词频和词长排序，阶段标签不是CEFR认证。释义为选段，不是每个词的完整释义；部分原始音标记法不统一。

进度采用不可变事件列表，包含练习、收藏、设置、当日计划。按事件ID去重，按时间重放。GitHub保存使用文件SHA进行并发检查，遇到冲突重新拉取、合并、重试。不同设备系统时间应设置正确；同一日计划同时创建时，合并后使用时间最早的一份。手机新开页面时先同步再开始新学习，避免两个设备同时离线分配新词。

长期使用文件可能超过1MB，读取自动切换到GitHub raw内容模式。每个设备仍保留本机副本；建议定期导出备份。每次提交都有GitHub版本历史，但进度不是数据库事务，不适合大规模多人同时使用。

## 本地预览

双击 index.html 可开始学习。推荐运行 `python -m http.server 8080`，再访问 `http://localhost:8080`，以使用离线缓存。

## 参考

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- https://www.baicizhan.com/
- https://www.bbdc.cn/
