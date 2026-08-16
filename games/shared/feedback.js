(() => {
  "use strict";
  if (window.__TZT_FEEDBACK_BOX) return;
  window.__TZT_FEEDBACK_BOX = true;

  const supported = ["en","ja","fr","es","ru","it","ar","ko","zh-CN","zh-TW","pt"];
  const text = {
    en:{button:"Feedback",title:"Feedback box",intro:"Tell us what could make the games better.",type:"Type",suggestion:"Suggestion",bug:"Problem",other:"Other",message:"Your feedback",placeholder:"Describe your idea or the problem you found…",contact:"Contact (optional)",contactPlaceholder:"Email or another way to reach you",privacy:"Only the author can read your message.",cancel:"Cancel",send:"Send",sending:"Sending…",success:"Thank you! Your feedback has been delivered.",error:"Could not send. Please try again later.",short:"Please enter at least 5 characters.",close:"Close feedback box"},
    ja:{button:"ご意見箱",title:"ご意見箱",intro:"ゲームをより良くするためのご意見をお寄せください。",type:"種類",suggestion:"提案",bug:"不具合",other:"その他",message:"ご意見",placeholder:"アイデアや見つけた問題を詳しく教えてください…",contact:"連絡先（任意）",contactPlaceholder:"メールなどの連絡方法",privacy:"内容は作者だけが確認します。",cancel:"キャンセル",send:"送信",sending:"送信中…",success:"ありがとうございます。ご意見を受け付けました。",error:"送信できませんでした。後でもう一度お試しください。",short:"5文字以上入力してください。",close:"ご意見箱を閉じる"},
    fr:{button:"Avis",title:"Boîte à idées",intro:"Dites-nous comment améliorer les jeux.",type:"Type",suggestion:"Suggestion",bug:"Problème",other:"Autre",message:"Votre avis",placeholder:"Décrivez votre idée ou le problème rencontré…",contact:"Contact (facultatif)",contactPlaceholder:"E-mail ou autre moyen de contact",privacy:"Seul l’auteur peut lire votre message.",cancel:"Annuler",send:"Envoyer",sending:"Envoi…",success:"Merci ! Votre avis a bien été envoyé.",error:"Envoi impossible. Réessayez plus tard.",short:"Saisissez au moins 5 caractères.",close:"Fermer la boîte à idées"},
    es:{button:"Opiniones",title:"Buzón de opiniones",intro:"Cuéntanos cómo podemos mejorar los juegos.",type:"Tipo",suggestion:"Sugerencia",bug:"Problema",other:"Otro",message:"Tu opinión",placeholder:"Describe tu idea o el problema que encontraste…",contact:"Contacto (opcional)",contactPlaceholder:"Correo u otra forma de contacto",privacy:"Solo el autor puede leer tu mensaje.",cancel:"Cancelar",send:"Enviar",sending:"Enviando…",success:"¡Gracias! Hemos recibido tu opinión.",error:"No se pudo enviar. Inténtalo más tarde.",short:"Escribe al menos 5 caracteres.",close:"Cerrar el buzón"},
    ru:{button:"Отзыв",title:"Отзывы",intro:"Расскажите, как сделать игры лучше.",type:"Тип",suggestion:"Предложение",bug:"Проблема",other:"Другое",message:"Ваш отзыв",placeholder:"Опишите идею или найденную проблему…",contact:"Контакт (необязательно)",contactPlaceholder:"Почта или другой способ связи",privacy:"Сообщение увидит только автор.",cancel:"Отмена",send:"Отправить",sending:"Отправка…",success:"Спасибо! Отзыв отправлен.",error:"Не удалось отправить. Попробуйте позже.",short:"Введите не менее 5 символов.",close:"Закрыть форму"},
    it:{button:"Feedback",title:"Casella dei suggerimenti",intro:"Dicci come possiamo migliorare i giochi.",type:"Tipo",suggestion:"Suggerimento",bug:"Problema",other:"Altro",message:"Il tuo feedback",placeholder:"Descrivi la tua idea o il problema riscontrato…",contact:"Contatto (facoltativo)",contactPlaceholder:"Email o altro recapito",privacy:"Solo l’autore può leggere il messaggio.",cancel:"Annulla",send:"Invia",sending:"Invio…",success:"Grazie! Il feedback è stato inviato.",error:"Invio non riuscito. Riprova più tardi.",short:"Inserisci almeno 5 caratteri.",close:"Chiudi"},
    ar:{button:"ملاحظات",title:"صندوق الملاحظات",intro:"أخبرنا كيف نجعل الألعاب أفضل.",type:"النوع",suggestion:"اقتراح",bug:"مشكلة",other:"أخرى",message:"ملاحظتك",placeholder:"اشرح فكرتك أو المشكلة التي وجدتها…",contact:"التواصل (اختياري)",contactPlaceholder:"البريد أو وسيلة تواصل أخرى",privacy:"لن يقرأ رسالتك سوى صاحب الموقع.",cancel:"إلغاء",send:"إرسال",sending:"جارٍ الإرسال…",success:"شكرًا! تم إرسال ملاحظتك.",error:"تعذر الإرسال. حاول لاحقًا.",short:"أدخل 5 أحرف على الأقل.",close:"إغلاق صندوق الملاحظات"},
    ko:{button:"의견함",title:"의견함",intro:"게임을 더 좋게 만들 수 있도록 의견을 남겨 주세요.",type:"종류",suggestion:"제안",bug:"문제",other:"기타",message:"의견",placeholder:"아이디어나 발견한 문제를 설명해 주세요…",contact:"연락처 (선택)",contactPlaceholder:"이메일 또는 다른 연락 방법",privacy:"작성한 내용은 제작자만 확인합니다.",cancel:"취소",send:"보내기",sending:"보내는 중…",success:"감사합니다! 의견이 전달되었습니다.",error:"전송하지 못했습니다. 나중에 다시 시도하세요.",short:"5자 이상 입력해 주세요.",close:"의견함 닫기"},
    "zh-CN":{button:"意见箱",title:"意见箱",intro:"欢迎告诉我哪里可以做得更好。",type:"意见类型",suggestion:"功能建议",bug:"问题反馈",other:"其他",message:"意见内容",placeholder:"请描述你的想法或遇到的问题…",contact:"联系方式（选填）",contactPlaceholder:"邮箱或其他联系方式",privacy:"意见内容仅站点作者可以查看。",cancel:"取消",send:"提交意见",sending:"提交中…",success:"感谢反馈！你的意见已经送达。",error:"提交失败，请稍后再试。",short:"请至少输入 5 个字符。",close:"关闭意见箱"},
    "zh-TW":{button:"意見箱",title:"意見箱",intro:"歡迎告訴我哪裡可以做得更好。",type:"意見類型",suggestion:"功能建議",bug:"問題回報",other:"其他",message:"意見內容",placeholder:"請描述你的想法或遇到的問題…",contact:"聯絡方式（選填）",contactPlaceholder:"信箱或其他聯絡方式",privacy:"意見內容僅網站作者可以查看。",cancel:"取消",send:"送出意見",sending:"送出中…",success:"感謝回饋！你的意見已經送達。",error:"送出失敗，請稍後再試。",short:"請至少輸入 5 個字元。",close:"關閉意見箱"},
    pt:{button:"Opinião",title:"Caixa de sugestões",intro:"Conte como podemos melhorar os jogos.",type:"Tipo",suggestion:"Sugestão",bug:"Problema",other:"Outro",message:"Sua opinião",placeholder:"Descreva sua ideia ou o problema encontrado…",contact:"Contato (opcional)",contactPlaceholder:"E-mail ou outra forma de contato",privacy:"Somente o autor poderá ler a mensagem.",cancel:"Cancelar",send:"Enviar",sending:"Enviando…",success:"Obrigado! Sua opinião foi enviada.",error:"Não foi possível enviar. Tente mais tarde.",short:"Digite pelo menos 5 caracteres.",close:"Fechar"},
  };

  const normalize = value => {
    const raw = String(value || "en").replace("_", "-").toLowerCase();
    if (["zh-tw","zh-hk","zh-mo"].includes(raw) || raw.includes("hant")) return "zh-TW";
    if (raw.startsWith("zh")) return "zh-CN";
    return supported.find(code => raw === code.toLowerCase() || raw.startsWith(`${code.toLowerCase()}-`)) || "en";
  };
  const getLocale = () => normalize(window.TZT_I18N?.getLocale?.() || window.GAME_I18N?.getLocale?.() || window.__TZT_GAME_LOCALE || document.documentElement.lang || navigator.language);

  const ownScript = document.currentScript;
  if (!document.querySelector("link[data-tzt-feedback-style]")) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.dataset.tztFeedbackStyle = "";
    style.href = new URL("./feedback.css", ownScript?.src || location.href).href;
    document.head.append(style);
  }

  const root = document.createElement("div");
  root.className = "tzt-feedback";
  root.innerHTML = `<button class="tzt-feedback-trigger" type="button"><span aria-hidden="true">💬</span><b></b></button><div class="tzt-feedback-overlay" hidden><section class="tzt-feedback-card" role="dialog" aria-modal="true" aria-labelledby="tztFeedbackTitle"><button class="tzt-feedback-close" type="button">×</button><small>TZT FEEDBACK</small><h2 id="tztFeedbackTitle"></h2><p class="tzt-feedback-intro"></p><form><label><span data-label="type"></span><select name="category"><option value="suggestion"></option><option value="bug"></option><option value="other"></option></select></label><label><span data-label="message"></span><textarea name="message" minlength="5" maxlength="1000" required></textarea></label><label><span data-label="contact"></span><input name="contact" maxlength="100" autocomplete="email"></label><label class="tzt-feedback-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><p class="tzt-feedback-privacy"></p><p class="tzt-feedback-status" role="status"></p><div class="tzt-feedback-actions"><button type="button" data-cancel></button><button type="submit" data-send></button></div></form></section></div>`;

  const trigger = root.querySelector(".tzt-feedback-trigger");
  const overlay = root.querySelector(".tzt-feedback-overlay");
  const card = root.querySelector(".tzt-feedback-card");
  const form = root.querySelector("form");
  const message = form.elements.message;
  const status = root.querySelector(".tzt-feedback-status");
  const send = root.querySelector("[data-send]");
  let locale = getLocale();

  function applyLanguage() {
    locale = getLocale();
    const copy = text[locale] || text.en;
    trigger.querySelector("b").textContent = copy.button;
    trigger.setAttribute("aria-label", copy.button);
    root.querySelector("h2").textContent = copy.title;
    root.querySelector(".tzt-feedback-intro").textContent = copy.intro;
    root.querySelector('[data-label="type"]').textContent = copy.type;
    root.querySelector('[data-label="message"]').textContent = copy.message;
    root.querySelector('[data-label="contact"]').textContent = copy.contact;
    form.elements.category.options[0].textContent = copy.suggestion;
    form.elements.category.options[1].textContent = copy.bug;
    form.elements.category.options[2].textContent = copy.other;
    message.placeholder = copy.placeholder;
    form.elements.contact.placeholder = copy.contactPlaceholder;
    root.querySelector(".tzt-feedback-privacy").textContent = copy.privacy;
    root.querySelector("[data-cancel]").textContent = copy.cancel;
    if (!send.disabled) send.textContent = copy.send;
    root.querySelector(".tzt-feedback-close").setAttribute("aria-label", copy.close);
  }

  function open() {
    overlay.hidden = false;
    document.body.classList.add("tzt-feedback-open");
    status.textContent = "";
    requestAnimationFrame(() => message.focus());
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove("tzt-feedback-open");
    trigger.focus();
  }

  trigger.addEventListener("click", open);
  root.querySelector(".tzt-feedback-close").addEventListener("click", close);
  root.querySelector("[data-cancel]").addEventListener("click", close);
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  card.addEventListener("click", event => event.stopPropagation());
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !overlay.hidden) close(); });
  window.addEventListener("tzt-language-change", applyLanguage);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const copy = text[locale] || text.en;
    if (message.value.trim().length < 5) { status.textContent = copy.short; status.dataset.tone = "error"; message.focus(); return; }
    send.disabled = true;
    send.textContent = copy.sending;
    status.textContent = "";
    try {
      const response = await fetch("/api/feedback", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({
        category:form.elements.category.value, message:message.value, contact:form.elements.contact.value,
        website:form.elements.website.value, locale, page:`${location.pathname}${location.search}`.slice(0,300),
      }) });
      if (!response.ok) throw new Error(copy.error);
      form.reset();
      status.textContent = copy.success;
      status.dataset.tone = "success";
    } catch (error) {
      status.textContent = error.message || copy.error;
      status.dataset.tone = "error";
    } finally {
      send.disabled = false;
      send.textContent = copy.send;
    }
  });

  applyLanguage();
  document.body.append(root);
})();
