/*!
 * PrintShubh Price Assistant — floating chatbot widget
 * Self-contained, no dependencies. Marathi-first.
 *
 * Loaded globally via <Script src="/price-assistant.js" strategy="afterInteractive" />.
 * The launcher is offset upward so it stacks ABOVE the site's existing
 * green WhatsApp support FAB (fixed bottom-right) instead of overlapping it.
 *
 * Edit CONFIG below to change the WhatsApp number or prices.
 */
(function () {
  "use strict";

  var CONFIG = {
    whatsappNumber: "918625801907",
    launcherText: "किंमत जाणून घ्या",
    title: "PrintShubh Price Assistant",
    welcome:
      "नमस्कार! तुम्हाला कोणती जमीन कागदपत्र सेवा हवी आहे? सेवा निवडा आणि सुरुवातीची किंमत लगेच जाणून घ्या.",
    priceNote:
      "ही सुरुवातीची किंमत आहे. अंतिम किंमत जिल्हा, तालुका, गाव, गट नंबर आणि report type नुसार WhatsApp वर आधी सांगितली जाईल. काम सुरू करण्याआधी किंमत confirm केली जाईल.",
    disclaimer:
      "PrintShubh ही सरकारी वेबसाइट नाही. आम्ही जमीन कागदपत्र शोध व PDF सहाय्य सेवा देतो. अंतिम कायदेशीर पडताळणी अधिकृत सरकारी पोर्टलवर करावी.",
    services: [
      { name: "7/12 उतारा", price: "₹30 पासून" },
      { name: "8A उतारा", price: "₹30 पासून" },
      { name: "मिळकत पत्रिका / Property Card", price: "₹100 पासून" },
      { name: "गाव नकाशा / Village Map", price: "₹300 पासून" },
      { name: "Full Map Development Report", price: "₹200 पासून" },
      { name: "Town Planning Map", price: "₹200 पासून" },
      { name: "Google Map Zone-wise Land Report", price: "₹200 पासून" },
      { name: "Index II", price: "WhatsApp वर किंमत विचारा", askOnWhatsApp: true }
    ]
  };

  if (window.__psbPriceAssistantLoaded) return;
  window.__psbPriceAssistantLoaded = true;

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

  function whatsappLink(serviceName) {
    var msg =
      "नमस्कार PrintShubh, मला " +
      serviceName +
      " हवी आहे.\n" +
      "जिल्हा: \n" +
      "तालुका: \n" +
      "गाव: \n" +
      "गट/सर्वे नंबर: \n" +
      "कृपया किंमत आणि वेळ सांगा.";
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
  }

  // Launcher sits ABOVE the existing WhatsApp FAB (which is ~56px tall at
  // bottom-5/7 right-5/7). bottom:92px desktop / 84px mobile keeps clear.
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

  var launcher = el(
    "button",
    { class: "psb-launcher", type: "button", "aria-label": CONFIG.launcherText, "aria-haspopup": "dialog" },
    '<span class="psb-pulse"></span><span class="psb-rupee">₹</span><span>' + esc(CONFIG.launcherText) + "</span>"
  );

  var panel = el("div", { class: "psb-panel", role: "dialog", "aria-modal": "false", "aria-label": CONFIG.title });

  panel.appendChild(
    el(
      "div",
      { class: "psb-head" },
      '<div class="psb-avatar">PS</div>' +
        '<div class="psb-htext"><div class="psb-title">' +
        esc(CONFIG.title) +
        '</div><div class="psb-sub">किंमत लगेच कळेल • WhatsApp सपोर्ट</div></div>' +
        '<button class="psb-close" type="button" aria-label="बंद करा">&times;</button>'
    )
  );

  var body = el("div", { class: "psb-body" });
  panel.appendChild(body);
  panel.appendChild(el("div", { class: "psb-foot" }, esc(CONFIG.disclaimer)));

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var waSvg =
    '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.4 2 7.7L.5 31.5l8-2.1c2.2 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.5 16 .5zm0 28.3c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5a12.7 12.7 0 0 1-1.9-6.8C3.2 8.9 8.9 3.2 16 3.2S28.8 8.9 28.8 16 23.1 28.8 16 28.8zm7-9.5c-.4-.2-2.3-1.1-2.6-1.3-.3-.1-.6-.2-.8.2-.2.4-.9 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.5-.6c.2-.2.2-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg>';

  function renderHome() {
    body.innerHTML = "";
    body.appendChild(el("div", { class: "psb-bot" }, esc(CONFIG.welcome)));
    CONFIG.services.forEach(function (svc, i) {
      var btn = el(
        "button",
        { class: "psb-svc", type: "button" },
        "<span>" + esc(svc.name) + '</span><span class="psb-price">' + esc(svc.price) + "</span>"
      );
      btn.addEventListener("click", function () {
        renderDetail(i);
      });
      body.appendChild(btn);
    });
    body.scrollTop = 0;
  }

  function renderDetail(i) {
    var svc = CONFIG.services[i];
    body.innerHTML = "";

    var back = el("button", { class: "psb-back", type: "button" }, "&larr; इतर सेवा पहा");
    back.addEventListener("click", renderHome);
    body.appendChild(back);

    var card = el("div", { class: "psb-bot" });
    card.appendChild(el("div", { class: "psb-detail-name" }, esc(svc.name)));
    card.appendChild(
      el(
        "div",
        { class: "psb-detail-price" },
        svc.askOnWhatsApp ? esc(svc.price) : "सुरुवातीची किंमत: " + esc(svc.price)
      )
    );
    card.appendChild(el("div", { class: "psb-note" }, esc(CONFIG.priceNote)));
    body.appendChild(card);

    body.appendChild(
      el(
        "div",
        { class: "psb-ask" },
        "कृपया ही माहिती WhatsApp वर पाठवा:\n• जिल्हा\n• तालुका\n• गाव\n• गट नंबर / सर्वे नंबर\n• कोणती सेवा हवी आहे"
      )
    );

    var wa = el(
      "a",
      { class: "psb-wa", href: whatsappLink(svc.name), target: "_blank", rel: "noopener" },
      waSvg + "<span>WhatsApp वर माहिती पाठवा</span>"
    );
    body.appendChild(wa);
    body.scrollTop = 0;
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
  panel.querySelector(".psb-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("psb-open")) close();
  });
})();
