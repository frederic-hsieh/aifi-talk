# pstack 最重要的一環: verification skills, 讓 agent 自己驗證

AI agent 已經能寫出不少程式。但寫完之後，常常還是要有人打開 app、點過一遍流程、把錯誤訊息貼回去，再確認修正有沒有生效。

每一輪修改都要回到人身上，人就成了整個流程裡最慢的一段。如果每一輪都要經過你，開再多 agent，也只是讓更多工作排隊等你檢查。

Lauren（@poteto）在 pstack Part 1 用「Verification is all you need」當作章節標題。Verification 是讓 agent 真正派上用場的基礎能力，值得當成重要的 infrastructure 來投資。

人仍然要決定目標與 acceptance criteria：怎樣才算完成、哪些行為不能壞掉。之後反覆操作與檢查的工作，則可以交給 agent 自己跑。

## 先用 /create-verification-skill

安裝 pstack 後，在你的專案裡使用 `/create-verification-skill`，讓 agent 建立適合這個 app 的 verification skill。

這個 skill 會協助建立操作 app 的工具，以及一份 Feature Map。接下來要看的，就是這兩樣東西如何配合，讓 agent 從「能改程式」走到「能檢查結果」。

下面用一個假想的 todo app 串起整篇說明。目標很簡單：新增「買牛奶」，重新整理頁面後，這筆 todo 仍然存在。

可以先這樣交代：

```
/create-verification-skill
先從新增 todo 開始：輸入「買牛奶」並儲存，重新整理頁面後應保留一筆相同內容的 todo。
先確認你對需求的理解，再建立需要的工具與 Feature Map。
實際操作一次，回報預期、結果與證據；無法執行的部分請標明。
```

要讓這個流程跑得起來，agent 需要能啟動 app、取得測試帳號，並使用獨立的測試資料。這些若仍要靠人逐次處理，流程就會在那裡停下來。

## 建立之後，agent 要能做什麼

Verification skill 的重點在 runtime。Agent 不只讀程式碼推測結果，而是實際操作 app，再看 log、畫面與資料狀態。

以 todo 為例，程式碼裡有儲存邏輯，不代表按下「新增」後真的存好了。畫面可能先出現那筆 todo，重新整理後卻消失了。

Agent 要能走完這個循環：

修改程式 → 操作 app → 檢查結果 → 發現問題 → 修正後再測

通過就回報證據。無法操作的部分，就標成未驗證，不能用「應該可以」代替結果。

## 用 CLI 把操作留下來

要讓這個循環能重複執行，先看 `/create-verification-skill` 建立的控制工具。CLI 可以把打開 app、新增 todo、讀取結果等操作留下來，讓之後的 session 繼續使用。

沒有現成工具時，agent 每次驗證都可能臨時寫一段 script：怎麼打開頁面、在哪裡輸入、如何按下 button。這些 script 如果沒有留下來，下一次又得重寫。

把常用操作整理成可重複使用的 CLI，就能省掉這些重工。你可以讓 agent 把需要的操作包成幾個 subcommands，例如：

```
todo-tool open
todo-tool add "買牛奶"
todo-tool reload
todo-tool list
todo-tool screenshot
```

這些是為了說明而設計的假想命令，不是 pstack 內建指令。實際的工具與命令，會由 `/create-verification-skill` 依各個專案的情況建立。

這組操作串起來很直覺：

打開 app → 新增 todo → 重新整理 → 讀取清單 → 保存 screenshot

`list` 讓 agent 讀到目前有哪些 todo，`screenshot` 則留下畫面，方便人檢查。下一次修正後，它可以再跑同一組操作。

Lauren 在 Part 1 提到，CLI 要有清楚的 `--help`、可組合的 subcommands，以及方便 agent 讀取的 output。

失敗時也要說清楚原因。「無法連上 app，請確認 app 已啟動」比單純回傳「失敗」有用，agent 才知道下一步該檢查什麼。

## 用 Feature Map 理解 app 的結構

CLI 解決了「怎麼操作」，但光有一串命令，人和 agent 還是很難看出整個 app 如何組成：todo 屬於哪個清單？新增、編輯與完成之間有什麼關係？這次改動可能影響哪條流程？

Feature Map 把這些功能與路徑放在一起，讓人和 agent 先對軟體結構有共同的理解。它從使用者看得到的功能出發，整理入口、行為、限制與操作工具。

以這個假想的 todo app 為例，先看整體關係：

首頁 → 選擇清單 → 查看 todos → 新增／編輯／完成 todo

再往下看「新增 todo」的細節：

• 入口：進入清單，選擇「新增 todo」。
• 操作：輸入內容，按下「新增」。
• 預期：目前清單出現一筆 todo，重新整理後仍保留。
• 工具：對應的新增、重新整理與讀取清單命令。
• 限制：這條流程尚未檢查其他帳號或裝置上的結果。

對人來說，這份地圖能幫助理解功能如何連在一起，也能用來檢查 agent 是否漏掉某條重要路徑。對 agent 來說，它提供下一個 session 可以沿用的 context，不必每次從頭摸索 app。

工具與地圖都有了，接下來就能選定一條路徑，確認它是否真的符合需求。

## 沿著 Feature Map，檢查是否真的完成

前面的 prompt 已經提出「重新整理後仍保留」這個目標。現在把它寫成具體的 acceptance criteria，讓 agent 知道要沿著地圖檢查哪些結果。

Lauren 在 pstack Part 2 提到，即使模型能力很強，intent 與 context 仍可能缺漏。請 agent 先用自己的話重述問題與解法，可以及早抓出誤解。

例如，「新增 todo 成功」到底只要求當下出現在畫面，還是重新整理後也要保留？這兩種理解，會導向不同的檢查。

這個例子的 acceptance criteria 可以寫成：

1) 按一次「新增」，清單只增加一筆「買牛奶」。
2) 重新整理後，這筆 todo 仍然存在。
3) 原本的其他 todo 保持不變。

Agent 會先從 Feature Map 找到「新增 todo」的路徑，再用 CLI 操作，依這些條件檢查並留下結果。以下是假設失敗時的紀錄：

```
操作：新增「買牛奶」
新增後：清單出現一筆「買牛奶」
重新整理後：該筆 todo 消失
預期：重新整理後仍保留
結果：未通過
```

有了這份紀錄，agent 就能繼續追查：問題出在資料沒有送出、沒有存好，還是重新載入時出錯。修正後，再跑同一條流程確認。

只有新增當下的 screenshot，還不能證明資料有保存。證據要回答的，是 acceptance criteria 裡的問題。

## 用 /maintain-verification-skill 跟上 app 的變化

App 的功能或畫面改了，verification skill 裡的工具與 Feature Map 也要跟著更新。用 `/maintain-verification-skill`，讓 agent 檢查原本的操作方式是否還能用。

例如，「新增 todo」的 button 搬到另一個頁面，agent 照舊方法就可能找不到。這時要更新 Feature Map，並實際跑一次新增流程，確認工具仍能完成操作。

新增功能時也是一樣。假設 app 現在可以編輯 todo，就要讓 agent 知道去哪裡編輯，以及怎麼確認修改有存下來。

## Recap: 讓 agent 自己完成 inner loop

Verification 重要的地方，是讓 agent 改完程式後，能自己看到結果、發現問題，再繼續修正。人不必在每一輪都接手操作，agent 也有證據判斷下一步。

可以用 inner loop 和 outer loop 來理解這個分工。這裡用它們描述兩個層次的工作：

Inner loop：修改 → 執行 → 檢查 → 修正

Verification skill 提供這個循環需要的工具與 context。Agent 能自己操作 app、讀取結果，才有機會把一個問題處理到符合 acceptance criteria，而不是每改一次就停下來等人。

Outer loop：決定問題 → 設定目標 → 評估成果 → 調整方向

人則把注意力放在做什麼、為什麼做，以及結果是否值得接受。Agent 可以協助 research、比較方案，但方向與重要取捨仍需要人的判斷。

Inner loop 的證據，也會回到 outer loop：功能雖然通過檢查，操作起來是否符合期待？Prototype 跑過之後，原本的方案還值得繼續嗎？Verification 讓這些決定有實際結果可以參考。

## 下一篇：看 poteto 怎麼用 pstack 做 research 與開發

下一篇會回到 Lauren（poteto）分享的具體用法，看她如何運用 pstack 釐清問題、研究與比較方案，再讓 agents 實作並驗證結果。

有了這篇的 verification 基礎，就更容易看懂這些 skills 如何搭配，以及哪些工作可以交給 agent 持續完成。

想看更多內容，歡迎追蹤我：

IG：@frede.richhh ／ Threads：@frede.richhh

X：@0xfrederichhh

YouTube：@frederichhh

Substack：@frederichhh
