/*!
 * PrintShubh Price Assistant — floating chatbot widget (bilingual mr/en)
 * Self-contained, no dependencies.
 *
 * Loaded globally via <Script src="/price-assistant.js" strategy="afterInteractive" />.
 *
 * Language: read from <html lang>, which the site's LanguageProvider keeps in
 * sync ("mr-IN" / "en-IN"). A MutationObserver re-renders the widget when the
 * user toggles language. In Marathi view only Marathi labels show; in English
 * view only English labels show. Brand/standard terms ("PrintShubh",
 * "Google Map", "Index II") may appear in both. Prices are identical.
 *
 * The launcher is offset upward so it stacks ABOVE the site's existing green
 * WhatsApp support FAB instead of overlapping it.
 */
(function () {
  "use strict";

  var WA_NUMBER = "918625801907";

  // UI strings per language
  var T = {
    mr: {
      launcher: "किंमत जाणून घ्या",
      title: "PrintShubh किंमत सहाय्यक",
      subtitle: "किंमत लगेच कळेल · WhatsApp सपोर्ट",
      welcome:
        "नमस्कार! तुम्हाला कोणती जमीन कागदपत्र सेवा हवी आहे? सेवा निवडा आणि सुरुवातीची किंमत लगेच जाणून घ्या.",
      priceNote:
        "ही सुरुवातीची किंमत आहे. अंतिम किंमत जिल्हा, तालुका, गाव, गट नंबर आणि report type नुसार WhatsApp वर आधी सांगितली जाईल. काम सुरू करण्याआधी किंमत confirm केली जाईल.",
      disclaimer:
        "PrintShubh ही सरकारी वेबसाइट नाही. आम्ही जमीन कागदपत्र शोध व PDF सहाय्य सेवा देतो. अंतिम कायदेशीर पडताळणी अधिकृत सरकारी पोर्टलवर करावी.",
      startingPrice: "सुरुवातीची किंमत: ",
      ask:
        "कृपया ही माहिती WhatsApp वर पाठवा:\n• जिल्हा\n• तालुका\n• गाव\n• गट नंबर / सर्वे नंबर\n• कोणती सेवा हवी आहे",
      send: "WhatsApp वर माहिती पाठवा",
      back: "← इतर सेवा पहा",
      close: "बंद करा"
    },
    en: {
      launcher: "Know the price",
      title: "PrintShubh Price Assistant",
      subtitle: "Instant price info · WhatsApp support",
      welcome:
        "Hello! Which land-document service do you need? Pick a service and see the starting price instantly.",
      priceNote:
        "These are starting prices. The final price depends on district, taluka, village, survey/gat number, and report type, and is confirmed on WhatsApp before the work starts.",
      disclaimer:
        "PrintShubh is not a government website. We provide land document search and PDF assistance services. Please verify final legal information on the official government portal.",
      startingPrice: "Starting price: ",
      ask:
        "Please send this information on WhatsApp:\n• District\n• Taluka\n• Village\n• Gat / Survey number\n• Which service you need",
      send: "Send details on WhatsApp",
      back: "← See other services",
      close: "Close"
    }
  };

  // Services — bilingual name + price. askOnWhatsApp rows show price as-is.
  var SERVICES = [
    { name: { mr: "7/12 उतारा", en: "7/12 Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
    { name: { mr: "8A उतारा", en: "8A Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
    { name: { mr: "मिळकत पत्रिका", en: "Property Card" }, price: { mr: "₹100 पासून", en: "From ₹100" } },
    { name: { mr: "गाव नकाशा", en: "Village Map" }, price: { mr: "₹300 पासून", en: "From ₹300" } },
    { name: { mr: "लोकेशन नकाशा", en: "Location Map" }, price: { mr: "WhatsApp वर किंमत विचारा", en: "Ask price on WhatsApp" }, askOnWhatsApp: true },
    { name: { mr: "नकाशा ओव्हरले", en: "Map Overlay" }, price: { mr: "WhatsApp वर किंमत विचारा", en: "Ask price on WhatsApp" }, askOnWhatsApp: true },
    { name: { mr: "संपूर्ण नकाशा विकास अहवाल", en: "Full Map Development Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
    { name: { mr: "नगर रचना नकाशा", en: "Town Planning Map" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
    { name: { mr: "Google Map नुसार झोन-निहाय जमीन अहवाल", en: "Google Map Zone-wise Land Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
    { name: { mr: "Index II", en: "Index II" }, price: { mr: "WhatsApp वर किंमत विचारा", en: "Ask price on WhatsApp" }, askOnWhatsApp: true }
  ];

  if (window.__psbPriceAssistantLoaded) return;
  window.__psbPriceAssistantLoaded = true;

  function getLang() {
    var l = (document.documentElement.lang || "mr").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "mr";
  }
  function t() {
    return T[getLang()];
  }

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (html != null) node.innerHTML = html;
    return node;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function whatsappLink(i) {
    var lang = getLang();
    var name = SERVICES[i].name[lang];
    var msg =
      lang === "mr"
        ? "नमस्कार PrintShubh, मला " +
          name +
          " हवी आहे.\nजिल्हा: \nतालुका: \nगाव: \nगट/सर्वे नंबर: \nकृपया किंमत आणि वेळ सांगा."
        : "Hello PrintShubh, I need " +
          name +
          ".\nDistrict: \nTaluka: \nVillage: \nGat/Survey no.: \nPlease share price and time.";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  var css =
    '.psb-launcher{position:fixed;right:20px;bottom:92px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;font-family:inherit;font-size:15px;font-weight:700;color:#fff;background:#1f6feb;padding:13px 18px;border-radius:999px;box-shadow:0 6px 22px rgba(0,0,0,.25);transition:transform .15s ease,box-shadow .15s ease}' +
    '.psb-launcher:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.3)}' +
    '.psb-launcher .psb-rupee{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.22);font-size:15px;font-weight:800}' +
    '.psb-launcher.psb-hidden{display:none}' +
    '.psb-pulse{position:absolute;right:0;bottom:0;width:100%;height:100%;border-radius:999px;box-shadow:0 0 0 0 rgba(31,111,235,.5);animation:psbpulse 2.2s infinite}' +
    '@keyframes psbpulse{70%{box-shadow:0 0 0 14px rgba(31,111,235,0)}100%{box-shadow:0 0 0 0 rgba(31,111,235,0)}}' +
    '.psb-panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:360px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 32px);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.32);display:none;flex-direction:column;overflow:hidden;font-family:inherit;color:#1b1b1b;animation:psbup .18s ease}' +
    '.psb-panel.psb-open{display:flex}' +
    '@keyframes psbup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
    '.psb-head{background:#1f6feb;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}' +
    '.psb-head .psb-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex:0 0 auto}' +
    '.psb-head .psb-htext{flex:1;min-width:0}' +
    '.psb-head .psb-title{font-size:15px;font-weight:700;line-height:1.2}' +
    '.psb-head .psb-sub{font-size:11.5px;opacity:.9;margin-top:2px}' +
    '.psb-close{background:transparent;border:0;color:#fff;cursor:pointer;font-size:22px;line-height:1;padding:4px;border-radius:6px}' +
    '.psb-close:hover{background:rgba(255,255,255,.18)}' +
    '.psb-body{flex:1;overflow-y:auto;padding:14px;background:#f5f7f6}' +
    '.psb-bot{background:#fff;border:1px solid #e6e9e8;border-radius:12px;padding:11px 13px;font-size:13.5px;line-height:1.55;margin-bottom:12px}' +
    '.psb-svc{display:flex;width:100%;justify-content:space-between;align-items:center;gap:8px;text-align:right;border:1px solid #cfe6d8;background:#fff;color:#16623a;border-radius:10px;padding:11px 13px;margin-bottom:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;transition:background .12s,border-color .12s}' +
    '.psb-svc:hover{background:#eefaf2;border-color:#1f8f4e}' +
    '.psb-svc .psb-price{font-size:13px;font-weight:800;color:#1f8f4e;white-space:nowrap}' +
    '.psb-detail-price{font-size:22px;font-weight:800;color:#1f8f4e;margin:2px 0 8px}' +
    '.psb-detail-name{font-size:15px;font-weight:700;margin-bottom:2px}' +
    '.psb-note{background:#fff7e6;border:1px solid #ffe2a8;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.5;color:#7a5b00;margin:10px 0}' +
    '.psb-ask{background:#fff;border:1px solid #e6e9e8;border-radius:12px;padding:11px 13px;font-size:13px;line-height:1.7;margin:10px 0;white-space:pre-line}' +
    '.psb-wa{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:#25D366;color:#fff;border:0;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;text-decoration:none;font-family:inherit;box-shadow:0 4px 14px rgba(37,211,102,.4)}' +
    '.psb-wa:hover{background:#1ebe5a}' +
    '.psb-wa svg{width:20px;height:20px;flex:0 0 auto}' +
    '.psb-back{background:transparent;border:0;color:#1f6feb;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;padding:6px 0;margin-bottom:6px;display:inline-flex;align-items:center;gap:5px}' +
    '.psb-foot{padding:10px 13px;background:#eef1f0;border-top:1px solid #e0e4e2;font-size:10.5px;line-height:1.5;color:#5a635e}' +
    '@media (max-width:480px){.psb-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}.psb-launcher{right:16px;bottom:84px}}';

  var style = el("style");
  style.textContent = css;
  document.head.appendChild(style);

  // Launcher (text in a referenced span so we can swap on language change)
  var launcher = el("button", {
    class: "psb-launcher",
    type: "button",
    "aria-haspopup": "dialog"
  });
  launcher.appendChild(el("span", { class: "psb-pulse" }));
  launcher.appendChild(el("span", { class: "psb-rupee" }, "₹"));
  var launcherText = el("span");
  launcher.appendChild(launcherText);

  // Panel
  var panel = el("div", { class: "psb-panel", role: "dialog", "aria-modal": "false" });
  var head = el("div", { class: "psb-head" });
  head.appendChild(el("div", { class: "psb-avatar" }, "PS"));
  var htext = el("div", { class: "psb-htext" });
  var headTitle = el("div", { class: "psb-title" });
  var headSub = el("div", { class: "psb-sub" });
  htext.appendChild(headTitle);
  htext.appendChild(headSub);
  head.appendChild(htext);
  var closeBtn = el("button", { class: "psb-close", type: "button" }, "&times;");
  head.appendChild(closeBtn);
  panel.appendChild(head);

  var body = el("div", { class: "psb-body" });
  panel.appendChild(body);
  var foot = el("div", { class: "psb-foot" });
  panel.appendChild(foot);

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var waSvg =
    '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.4 2 7.7L.5 31.5l8-2.1c2.2 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.5 16 .5zm0 28.3c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5a12.7 12.7 0 0 1-1.9-6.8C3.2 8.9 8.9 3.2 16 3.2S28.8 8.9 28.8 16 23.1 28.8 16 28.8zm7-9.5c-.4-.2-2.3-1.1-2.6-1.3-.3-.1-.6-.2-.8.2-.2.4-.9 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.5-.6c.2-.2.2-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg>';

  // Current view so we can re-render on language change
  var view = { name: "home" };

  function renderHome() {
    view = { name: "home" };
    var s = t();
    var lang = getLang();
    body.innerHTML = "";
    body.appendChild(el("div", { class: "psb-bot" }, esc(s.welcome)));
    SERVICES.forEach(function (svc, i) {
      var btn = el(
        "button",
        { class: "psb-svc", type: "button" },
        "<span>" + esc(svc.name[lang]) + '</span><span class="psb-price">' + esc(svc.price[lang]) + "</span>"
      );
      btn.addEventListener("click", function () {
        renderDetail(i);
      });
      body.appendChild(btn);
    });
    body.scrollTop = 0;
  }

  function renderDetail(i) {
    view = { name: "detail", i: i };
    var s = t();
    var lang = getLang();
    var svc = SERVICES[i];
    body.innerHTML = "";

    var back = el("button", { class: "psb-back", type: "button" }, esc(s.back));
    back.addEventListener("click", renderHome);
    body.appendChild(back);

    var card = el("div", { class: "psb-bot" });
    card.appendChild(el("div", { class: "psb-detail-name" }, esc(svc.name[lang])));
    card.appendChild(
      el(
        "div",
        { class: "psb-detail-price" },
        svc.askOnWhatsApp ? esc(svc.price[lang]) : esc(s.startingPrice) + esc(svc.price[lang])
      )
    );
    card.appendChild(el("div", { class: "psb-note" }, esc(s.priceNote)));
    body.appendChild(card);

    body.appendChild(el("div", { class: "psb-ask" }, esc(s.ask)));

    var wa = el(
      "a",
      { class: "psb-wa", href: whatsappLink(i), target: "_blank", rel: "noopener" },
      waSvg + "<span>" + esc(s.send) + "</span>"
    );
    body.appendChild(wa);
    body.scrollTop = 0;
  }

  function render() {
    if (view.name === "detail") renderDetail(view.i);
    else renderHome();
  }

  // Apply current language to all chrome (and body if open)
  function applyLang() {
    var s = t();
    launcherText.textContent = s.launcher;
    launcher.setAttribute("aria-label", s.launcher);
    panel.setAttribute("aria-label", s.title);
    headTitle.textContent = s.title;
    headSub.textContent = s.subtitle;
    foot.textContent = s.disclaimer;
    closeBtn.setAttribute("aria-label", s.close);
    if (panel.classList.contains("psb-open")) render();
  }

  function open() {
    renderHome();
    panel.classList.add("psb-open");
    launcher.classList.add("psb-hidden");
  }
  function close() {
    panel.classList.remove("psb-open");
    launcher.classList.remove("psb-hidden");
  }

  launcher.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("psb-open")) close();
  });

  // Re-render when the site toggles <html lang>
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(applyLang).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  applyLang();
})();
