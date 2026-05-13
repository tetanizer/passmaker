(function () {
  "use strict";

  const RAW_CHARSETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digits: "0123456789",
    special: "!@#$%^&*()-_=+[]{};:,.?<>~|\u0060\u0027",
  };

  /** Всегда: O, 0, I, l, 1 */
  const ALWAYS_EXCLUDE = new Set(["O", "0", "I", "l", "1"]);

  /** Дополнительно при опции «расширенные исключения» */
  const STRICT_EXCLUDE = new Set([
    "S",
    "s",
    "5",
    "B",
    "b",
    "8",
    "G",
    "g",
    "6",
    "Z",
    "z",
    "2",
    "|",
    "\u0060",
    "\u0027",
    "_",
    "-",
    "\u2013",
    "\u2014",
  ]);

  function buildCharset(raw, strict) {
    let chars = [...raw].filter(function (c) {
      return !ALWAYS_EXCLUDE.has(c);
    });
    if (strict) {
      chars = chars.filter(function (c) {
        return !STRICT_EXCLUDE.has(c);
      });
    }
    return chars.join("");
  }

  const els = {
    length: document.getElementById("length"),
    lengthInput: document.getElementById("length-input"),
    count: document.getElementById("count"),
    optUpper: document.getElementById("opt-upper"),
    optLower: document.getElementById("opt-lower"),
    optDigits: document.getElementById("opt-digits"),
    optSpecial: document.getElementById("opt-special"),
    optStrictAmbiguous: document.getElementById("opt-strict-ambiguous"),
    btnGenerate: document.getElementById("btn-generate"),
    btnSave: document.getElementById("btn-save"),
    btnDownload: document.getElementById("btn-download"),
    list: document.getElementById("password-list"),
    error: document.getElementById("error-msg"),
  };

  let lastPasswords = [];

  function randomUint32() {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0];
  }

  function randomInt(max) {
    if (max <= 0) return 0;
    const limit = Math.floor(0x100000000 / max) * max;
    let x;
    do {
      x = randomUint32();
    } while (x >= limit);
    return x % max;
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getSelectedPools() {
    const strict = els.optStrictAmbiguous.checked;
    const pools = [];

    if (els.optUpper.checked) {
      const s = buildCharset(RAW_CHARSETS.upper, strict);
      if (!s.length) {
        return {
          ok: false,
          error:
            "Прописные буквы: при таких исключениях алфавит пуст. Отключите расширенные исключения или снимите этот набор.",
        };
      }
      pools.push(s);
    }
    if (els.optLower.checked) {
      const s = buildCharset(RAW_CHARSETS.lower, strict);
      if (!s.length) {
        return {
          ok: false,
          error:
            "Строчные буквы: при таких исключениях алфавит пуст. Отключите расширенные исключения или снимите этот набор.",
        };
      }
      pools.push(s);
    }
    if (els.optDigits.checked) {
      const s = buildCharset(RAW_CHARSETS.digits, strict);
      if (!s.length) {
        return {
          ok: false,
          error:
            "Цифры: при таких исключениях алфавит пуст. Отключите расширенные исключения или снимите этот набор.",
        };
      }
      pools.push(s);
    }
    if (els.optSpecial.checked) {
      const s = buildCharset(RAW_CHARSETS.special, strict);
      if (!s.length) {
        return {
          ok: false,
          error:
            "Спецсимволы: при таких исключениях алфавит пуст. Отключите расширенные исключения или снимите этот набор.",
        };
      }
      pools.push(s);
    }

    if (pools.length === 0) {
      return { ok: false, error: "Выберите хотя бы один набор символов." };
    }

    return { ok: true, pools: pools };
  }

  function buildAlphabet(pools) {
    return pools.join("");
  }

  function generateOnePassword(length, pools) {
    if (pools.length === 0 || length < 1) return "";
    const alphabet = buildAlphabet(pools);
    const chars = [];

    if (pools.length > 1 && length >= pools.length) {
      for (let p = 0; p < pools.length; p++) {
        const pool = pools[p];
        chars.push(pool[randomInt(pool.length)]);
      }
      for (let i = chars.length; i < length; i++) {
        chars.push(alphabet[randomInt(alphabet.length)]);
      }
      shuffleInPlace(chars);
    } else {
      for (let i = 0; i < length; i++) {
        chars.push(alphabet[randomInt(alphabet.length)]);
      }
    }

    return chars.join("");
  }

  function generatePasswords(count, length, pools) {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(generateOnePassword(length, pools));
    }
    return out;
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = !msg;
  }

  function syncLengthFromSlider() {
    const v = Math.min(64, Math.max(8, Number(els.length.value)));
    els.length.value = v;
    els.lengthInput.value = v;
  }

  function syncLengthFromInput() {
    let v = parseInt(els.lengthInput.value, 10);
    if (Number.isNaN(v)) v = 32;
    v = Math.min(64, Math.max(8, v));
    els.length.value = v;
    els.lengthInput.value = v;
  }

  function renderList(passwords) {
    els.list.innerHTML = "";
    if (!passwords.length) {
      const p = document.createElement("p");
      p.className = "empty-hint";
      p.textContent = "Нажмите «Сгенерировать пароли», чтобы получить список.";
      els.list.appendChild(p);
      els.btnDownload.disabled = true;
      return;
    }

    passwords.forEach((pwd, index) => {
      const li = document.createElement("li");
      li.className = "password-row";

      const code = document.createElement("code");
      code.textContent = pwd;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "Копировать пароль " + (index + 1));
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

      btn.addEventListener("click", function () {
        copyText(pwd, btn, li);
      });

      li.appendChild(code);
      li.appendChild(btn);
      els.list.appendChild(li);
    });

    els.btnDownload.disabled = false;
  }

  function flashCopiedRow(rowEl) {
    if (!rowEl) return;
    if (rowEl._copyAnimEnd) {
      rowEl.removeEventListener("animationend", rowEl._copyAnimEnd);
      rowEl._copyAnimEnd = null;
    }
    rowEl.classList.remove("password-row--copied");
    void rowEl.offsetWidth;
    rowEl.classList.add("password-row--copied");
    function onAnimEnd(e) {
      if (e.animationName !== "password-row-copied") return;
      rowEl.classList.remove("password-row--copied");
      rowEl.removeEventListener("animationend", onAnimEnd);
      rowEl._copyAnimEnd = null;
    }
    rowEl._copyAnimEnd = onAnimEnd;
    rowEl.addEventListener("animationend", onAnimEnd);
  }

  function copyText(text, buttonEl, rowEl) {
    function done(ok) {
      if (ok) flashCopiedRow(rowEl);
      const prev = buttonEl.getAttribute("aria-label");
      buttonEl.setAttribute("aria-label", ok ? "Скопировано" : "Ошибка копирования");
      setTimeout(function () {
        buttonEl.setAttribute("aria-label", prev || "Копировать");
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done(true);
        },
        function () {
          try {
            fallbackCopy(text);
            done(true);
          } catch (_) {
            done(false);
          }
        }
      );
    } else {
      try {
        fallbackCopy(text);
        done(true);
      } catch (_) {
        done(false);
      }
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }

  function downloadTxt() {
    if (!lastPasswords.length) return;
    const blob = new Blob([lastPasswords.join("\r\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passmaker-passwords.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function readSettings() {
    return {
      length: parseInt(els.lengthInput.value, 10) || 32,
      count: parseInt(els.count.value, 10) || 5,
      upper: els.optUpper.checked,
      lower: els.optLower.checked,
      digits: els.optDigits.checked,
      special: els.optSpecial.checked,
      strictAmbiguous: els.optStrictAmbiguous.checked,
    };
  }

  function applySettings(s) {
    if (!s) return;
    const len = Math.min(64, Math.max(8, s.length || 32));
    els.length.value = len;
    els.lengthInput.value = len;
    const c = Math.min(500, Math.max(1, s.count || 5));
    els.count.value = c;
    els.optUpper.checked = !!s.upper;
    els.optLower.checked = !!s.lower;
    els.optDigits.checked = !!s.digits;
    els.optSpecial.checked = !!s.special;
    if (s.strictAmbiguous !== undefined) {
      els.optStrictAmbiguous.checked = !!s.strictAmbiguous;
    }
  }

  const STORAGE_KEY_V1 = "passmaker_settings_v1";
  const STORAGE_KEY_V2 = "passmaker_settings_v2";

  function loadSaved() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY_V2);
      if (!raw) raw = localStorage.getItem(STORAGE_KEY_V1);
      if (raw) applySettings(JSON.parse(raw));
    } catch (_) {
      /* ignore */
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(readSettings()));
      showError("");
    } catch (_) {
      showError("Не удалось сохранить настройки в браузере.");
    }
  }

  function attemptGenerate() {
    showError("");
    syncLengthFromInput();

    const length = parseInt(els.lengthInput.value, 10);
    const count = parseInt(els.count.value, 10);
    const res = getSelectedPools();

    if (!res.ok) {
      showError(res.error);
      lastPasswords = [];
      renderList([]);
      return false;
    }

    const pools = res.pools;

    if (count < 1 || count > 500) {
      showError("Количество паролей: от 1 до 500.");
      lastPasswords = [];
      renderList([]);
      return false;
    }
    if (length < 8 || length > 64) {
      showError("Длина пароля: от 8 до 64.");
      lastPasswords = [];
      renderList([]);
      return false;
    }
    if (pools.length > length) {
      showError(
        "Длина пароля меньше числа выбранных наборов. Увеличьте длину или снимите часть опций."
      );
      lastPasswords = [];
      renderList([]);
      return false;
    }

    lastPasswords = generatePasswords(count, length, pools);
    renderList(lastPasswords);
    return true;
  }

  els.length.addEventListener("input", syncLengthFromSlider);
  els.lengthInput.addEventListener("change", function () {
    syncLengthFromInput();
  });
  els.lengthInput.addEventListener("input", function () {
    syncLengthFromInput();
  });

  els.btnGenerate.addEventListener("click", function () {
    attemptGenerate();
  });

  els.btnSave.addEventListener("click", saveSettings);
  els.btnDownload.addEventListener("click", downloadTxt);

  loadSaved();
  syncLengthFromSlider();
  attemptGenerate();
})();
