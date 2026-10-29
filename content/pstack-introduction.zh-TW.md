# pstack 入門：核心概念、安裝與 playbooks

Grok Bot 的開發者 Lauren Tan 在 9 月 21 日的貼文中說，她上個月把 2,500 個 PR（程式修改提案）送上了 production。她是怎麼做到的？

## Lauren Tan 為什麼做 pstack？
Lauren Tan（poteto）曾在 Meta、Netflix、Cursor 工作，也參與 React Compiler 開發。

pstack 收錄她日常使用的 agent skills，也就是教 AI 如何完成工作的指引與工具：怎麼調查問題、何時找其他角色協助，以及拿什麼證明任務完成。

她在 〈The Complete Guide to pstack Pt. 1〉 用「gardener」（園丁）形容自己在 Grok Bot 的工作。

當團隊不斷送進新的 PR，總要有人留意重複程式、愈來愈多的 lint suppressions（手動略過程式檢查警告），以及開始難以維護的結構。

她希望一邊開發功能，一邊 refactor、補上 lint rules 與其他自動檢查，讓專案的基礎跟得上貢獻速度。

Lauren 把 verification skill 當成基礎建設：讓 agent 能啟動 app、操作介面、讀取錯誤，檢查自己的成果。

有了這些工具，agent 就有機會自己完成「修改 → verification → 修正」。人負責目標與驗收標準，不必每次接手操作。

這篇入門文會先帶你安裝，認識 poteto-mode 與 playbooks，再讓 AI 看懂專案，不急著改程式。

如何建立 verification skill、操作 app 並留下證據，會放到下一篇搭配實例介紹。

## 安裝與設定
最快的起手式：把連結交給能操作檔案的 AI。以下是我建議的起點，讓它先確認你使用的 coding agents，再處理安裝：

```
請查看官方 pstack：https://github.com/cursor/plugins/tree/main/pstack
先讀 README，確認我目前使用的 AI 工具與它支援的安裝方式，
再安裝 skills，必要時調整成這個工具能使用的形式。
保留完整的 docs、playbooks、scripts、agent 定義與引用檔案，
不要只複製 SKILL.md。
依目前可用的模型設定角色；不支援的功能請明說，不要自行假設。
完成後確認 AI 能找到並使用 skills。
先讓 AI 看懂專案，不急著改程式；這次不要修改任何檔案。
回報安裝路徑、版本、設定與實際執行證據。
```

我自己是把 pstack 放在 ~/.agents/skills，再透過 symlink（指向同一份資料夾的連結）接到 ~/.claude/skills；讓我的 Codex 與 Claude Code 可以一起使用。

## 如果你用的是 Cursor 或是 Grok Bot

可以直接：

Cursor:
```
/add-plugin pstack
/setup-pstack
```

Grok Bot:
點選 Connect Apps 搜尋 pstack，然後 add。

## 從 poteto-mode 開始
poteto-mode 是主要入口。你描述任務，它選擇 playbook（工作流程）、列出步驟，再使用需要的 skills。

- Playbook 決定流程，例如先調查還是先重現問題；
- skill 提供方法，例如用 architect 規劃結構；
- principle 則是判斷準則，例如 prove-it-works 要求拿出實際證據。Principles 在檔案上也以 skills 保存。

你不必先記住每個 skill。先交代想了解什麼、哪些地方不能改、怎樣才算完成，讓 /poteto-mode 替你安排流程。

看回覆時，也就能沿著步驟追問：這個結論來自哪裡？哪一步真的做過？如果略過驗證，原因是什麼？

![pstack 從任務、playbook、skills 到驗證結果的流程](../../assets/posts/pstack-excalidraw-zh.png)

## 第一個任務怎麼下？
先讓 AI 帶你看懂專案，再對照實際檔案，看看解釋是否可靠。可以輸入：

```
/poteto-mode 我剛接手這個專案，先不要改程式。
找出 entry point、主要 modules，以及啟動與執行 tests 的方式。
畫出它們的關係，引用實際檔案；沒有執行 verification 的部分請標明。
若是 plugin，請說明它如何載入，以及 configuration 如何生效。
```

## 六種常見 playbooks
- Investigation：解釋現有行為，不改程式
- Bug fix：讓問題再次發生，找原因、修正並確認結果
- Feature：新增或改變行為，確認符合目標
- Refactoring：改結構，維持原本行為
- Prototype：先做簡單的試用版本，確認設計是否合適
- Perf issue：先量 baseline（原本的速度與資源用量），再比較修改後的差異

當你熟悉了code base，你只要說清楚想做什麼、有哪些限制，以及怎樣才算完成，讓 agent 判斷該用哪個 playbook，不必自己先分類。

例如，你可以直接描述這些任務：

- 「幫我追一下按下『登入』後，從 UI 到 API 的流程，引用相關檔案。先不要改程式。」
- 「購物車按一次『加入』卻出現兩筆商品。先重現問題，再修正，確認一次點擊只新增一筆。」
- 「幫記帳 app 加上 CSV 匯出，包含日期、分類、金額。用測試資料確認匯出的內容正確。」
- 「首頁載入很慢。先量 baseline、找出時間花在哪裡，再修改，並用相同條件比較前後結果。」

完整 playbooks 可以等有需要再查。

## 不知道怎麼用，就問 poteto-help
安裝卡住、不確定該用哪個 skill，或想知道 /poteto-mode 怎麼運作，都可以問 poteto-help：

```
/poteto-help 我想用 pstack 修一個能重現的 bug，應該直接用 poteto-mode，
還是另外選 skill？請說明用法，給我一個可以套用的 prompt。
```

這是在問 pstack 的用法。它會給建議、prompt 與文件來源；要開始修 bug，再送出準備好的 prompt。

---

下一篇會介紹如何設定 verification skill，以及為什麼需要給 agents 能實際操作 app、檢查結果的工具。我們會搭配實例，讓 agent 改完程式後，能自己驗證是否真的有效。

想看更多內容，歡迎追蹤我：

- IG：@frede.richhh ／ Threads：@frede.richhh
- X：@0xfrederichhh
- YouTube：@frederichhh
- Substack：@frederichhh
