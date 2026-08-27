/**
 * 宗像市暮らし体感バスツアー 申込受付
 * スプレッドシート「移住ツアーお申し込み管理」バウンドスクリプト
 *
 * 2026-08-27 第2回（11/3・むなかた子ども大学連動）対応
 *  - コース希望（第1〜第3）／講座に参加するお子様／同行者3〜4人目を専用列に記録
 *  - 第2回は昼食持参のため、食事・アレルギー項目は送信されない（旧列は空欄で維持）
 *  - 受付確認メール（申込者への自動返信）と管理者通知の文面を第2回の内容に更新
 *
 * 列構成（A〜U）:
 *  A:送信日時 B:希望ツアー C:代表者お名前 D:年齢 E:メールアドレス F:携帯電話番号
 *  G:現在のご住所 H:参加総人数 I:同行者お名前 J:同行者年齢 K:代表者との関係
 *  L:代表者食事 M:同行者食事 N:アレルギー有無 O:アレルギー詳細 P:ご質問・ご要望
 *  Q:コース第1希望 R:コース第2希望 S:コース第3希望 T:講座参加のお子様 U:同行者(3〜4人目)
 */

// 新しく追加した列（Q〜U）の見出しを1回だけ書き込む。
// エディタから手動実行する。既に見出しがある場合は上書きするだけで副作用はない。
function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(1, 17, 1, 5).setValues([[
    'コース第1希望', 'コース第2希望', 'コース第3希望', '講座参加のお子様', '同行者(3〜4人目)'
  ]]);
  sheet.getRange(1, 17, 1, 5).setFontWeight('bold');
  Logger.log('Q〜U列の見出しを設定しました');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 衝突を防ぐためのロック処理

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var parameter = e.parameter;

    // フォームデータの受け取り
    var name = parameter.name || "";
    var age = parameter.age || "";
    var email = parameter.email || "";
    var phone = parameter.phone || "";
    var address = parameter.address || "";
    var participants = parameter.participants || "1";
    var course = parameter.course || "";

    // 食事・アレルギー（第1回のみ使用。第2回は送信されないため空欄になる）
    var meal_type_1 = mealLabel(parameter.meal_type_1);
    var meal_type_2 = mealLabel(parameter.meal_type_2);
    var allergy_check = parameter.allergy_check ? (parameter.allergy_check === "yes" ? "あり" : "なし") : "";
    var allergy_detail = parameter.allergy_check === "yes" ? (parameter.allergy_detail || "") : "";

    var companionName = parameter.companionName || "";
    var companionAge = parameter.companionAge || "";
    var companionRelationship = parameter.companionRelationship || "";
    var inquiry = parameter.inquiry || "";

    // 第2回で追加した項目
    var courseWish1 = parameter.course_wish_1 || "";
    var courseWish2 = parameter.course_wish_2 || "";
    var courseWish3 = parameter.course_wish_3 || "";
    var children = parameter.children || "";           // 例: 1人目：山田一郎（小学2年生）／2人目：…
    var companionsExtra = parameter.companions_extra || ""; // 3〜4人目の同行者

    var timestamp = new Date();

    sheet.appendRow([
      timestamp,
      course,
      name,
      age,
      email,
      phone,
      address,
      participants,
      companionName,
      companionAge,
      companionRelationship,
      meal_type_1,
      meal_type_2,
      allergy_check,
      allergy_detail,
      inquiry,
      courseWish1,
      courseWish2,
      courseWish3,
      children,
      companionsExtra
    ]);

    // ===== 管理者への通知メール =====
    var recipient = "nakamura@munakata.keizai.biz,eshi0911@city.munakata.lg.jp";
    var subject = "【宗像市暮らし体感バスツアー】新しいお申し込みがありました";

    var body = "以下の内容でお申し込みがありました。\n\n" +
      "【お申し込み日時】: " + timestamp.toLocaleString("ja-JP") + "\n" +
      "【参加希望ツアー】: " + course + "\n\n" +
      "--- 代表者情報 ---\n" +
      "【代表者お名前】: " + name + "\n" +
      "【年齢】: " + age + "歳\n" +
      "【メールアドレス】: " + email + "\n" +
      "【当日の連絡先】: " + phone + "\n" +
      "【現在のご住所】: " + address + "\n" +
      "【バスツアー参加人数】: " + participants + "名\n\n";

    if (companionName) {
      body += "--- 同行者情報（2人目） ---\n" +
        "【お名前】: " + companionName + "\n" +
        "【年齢】: " + companionAge + "歳\n" +
        "【代表者との関係】: " + companionRelationship + "\n";
      if (meal_type_2) body += "【同行者の食事】: " + meal_type_2 + "\n";
      body += "\n";
    }

    if (companionsExtra) {
      body += "--- 同行者情報（3人目以降） ---\n" + companionsExtra + "\n\n";
    }

    if (children) {
      body += "--- 講座に参加するお子様 ---\n" + children + "\n\n";
    }

    if (courseWish1 || courseWish2 || courseWish3) {
      body += "--- コース希望 ---\n" +
        "【第1希望】: " + (courseWish1 || "（未選択）") + "\n" +
        "【第2希望】: " + (courseWish2 || "（未選択）") + "\n" +
        "【第3希望】: " + (courseWish3 || "（未選択）") + "\n\n";
    }

    if (meal_type_1) {
      body += "--- 食事 ---\n【代表者の食事】: " + meal_type_1 + "\n\n";
    }
    if (allergy_check) {
      body += "--- アレルギー情報 ---\n【アレルギーの有無】: " + allergy_check + "\n";
      if (allergy_check === "あり") body += "【アレルギー詳細】: " + allergy_detail + "\n";
      body += "\n";
    }

    if (inquiry) {
      body += "--- ご質問・ご要望 ---\n" + inquiry + "\n\n";
    }

    body += "------------------\n" +
      "※このメールは宗像市暮らし体感バスツアー特設サイトから自動送信されました。";

    MailApp.sendEmail(recipient, subject, body);

    // ===== 申込者への自動返信（info@munakata.keizai.biz から送信） =====
    try {
      if (email) {
        var arSubject = "【宗像市暮らし体感バスツアー】お申し込みを受け付けました";
        var arBody = name + " 様\n\n" +
          "このたびは「宗像市暮らし体感バスツアー」にお申し込みいただき、誠にありがとうございます。\n" +
          "以下の内容でお申し込みを受け付けました。\n\n" +
          "■ お申し込み内容\n" +
          "・お申し込み日時：" + timestamp.toLocaleString("ja-JP") + "\n" +
          "・参加希望ツアー：" + course + "\n" +
          "・代表者：" + name + " 様（" + age + "歳）\n" +
          "・バスツアー参加人数：" + participants + "名\n";

        if (companionName) {
          arBody += "・同行者：" + companionName + " 様（" + companionAge + "歳・" + companionRelationship + "）\n";
        }
        if (companionsExtra) {
          arBody += "・同行者（3人目以降）：" + companionsExtra + "\n";
        }
        if (children) {
          arBody += "・講座に参加するお子様：" + children + "\n";
        }
        if (courseWish1 || courseWish2 || courseWish3) {
          arBody += "・ご希望のコース：第1希望 " + (courseWish1 || "（未選択）");
          if (courseWish2) arBody += "／第2希望 " + courseWish2;
          if (courseWish3) arBody += "／第3希望 " + courseWish3;
          arBody += "\n";
        }
        if (meal_type_1) {
          arBody += "・代表者のお食事：" + meal_type_1 + "\n";
        }
        if (allergy_check) {
          arBody += "・アレルギー：" + allergy_check;
          if (allergy_check === "あり" && allergy_detail) arBody += "（" + allergy_detail + "）";
          arBody += "\n";
        }
        if (inquiry) {
          arBody += "・ご質問・ご要望：" + inquiry + "\n";
        }

        arBody += "\n■ 今後の流れ\n" +
          "本メールは受付確認のご連絡であり、参加確定のご連絡ではありません。\n" +
          "お申し込みの受付は2026年9月25日(金)17:00までで、応募多数の場合は抽選とさせていただきます。\n" +
          "参加の可否と、むなかた子ども大学でご参加いただくコースにつきましては、\n" +
          "受付締切後に担当者より改めてご連絡いたします。今しばらくお待ちください。\n" +
          "なお、対象学年や各コースの定員の関係で、ご希望のコースに添えない場合がございます。\n\n" +
          "■ 当日について（詳細は参加確定後に改めてご案内します）\n" +
          "・開催日：2026年11月3日(火・祝)\n" +
          "・集合場所：グローバルアリーナ（宗像市吉留46-1）9:15 受付開始 ※現地集合・現地解散\n" +
          "・昼食：各自ご持参ください\n" +
          "・お子様はむなかた子ども大学の講座に、保護者の方は先輩移住者との交流会や\n" +
          "　モデルハウス見学などにご参加いただきます。\n\n" +
          "ご不明な点がございましたら、本メールへの返信にてお問い合わせください。\n\n" +
          "――――――――――――――\n" +
          "宗像市暮らし体感バスツアー事務局（宗像経済新聞）\n" +
          "info@munakata.keizai.biz\n" +
          "――――――――――――――";

        GmailApp.sendEmail(email, arSubject, arBody, {
          from: "info@munakata.keizai.biz",
          name: "宗像市暮らし体感バスツアー事務局",
          replyTo: "info@munakata.keizai.biz"
        });
      }
    } catch (arError) {
      // 自動返信の失敗は受付処理を妨げない
      Logger.log("自動返信の送信に失敗しました: " + arError.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 食事コード値を日本語ラベルに変換する。未送信（第2回）の場合は空文字を返す。
function mealLabel(code) {
  if (!code) return "";
  if (code === "adult") return "大人用（海鮮）";
  if (code === "child") return "お子様ランチ";
  if (code === "none") return "不要";
  return "";
}
