(() => {
  const templates = Array.isArray(window.EMAILHUB_TEMPLATES)
    ? window.EMAILHUB_TEMPLATES
    : [];

  const list = document.getElementById("template-list");
  const form = document.getElementById("email-form");
  const fields = ["to", "cc", "bcc", "subject", "body"];
  const status = document.getElementById("status");
  let selectedId = null;

  function field(name) {
    return document.getElementById(name);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function loadTemplate(template) {
    selectedId = template.id;

    fields.forEach(key => {
      field(key).value = template[key] || "";
    });

    [...list.querySelectorAll("button")].forEach(button => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.id === selectedId)
      );
    });

    setStatus("");
  }

  templates.forEach((template, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template-option";
    button.dataset.id = template.id;
    button.setAttribute("aria-pressed", "false");

    const title = document.createElement("strong");
    title.textContent = template.name || `Template ${index + 1}`;

    const description = document.createElement("span");
    description.textContent =
      template.description || "Predefined email";

    button.append(title, description);
    button.addEventListener("click", () => loadTemplate(template));
    list.appendChild(button);
  });

  if (templates.length) {
    loadTemplate(templates[0]);
  } else {
    setStatus(
      "No templates found. Please add templates in templates.js."
    );
  }

  document.getElementById("reset-button").addEventListener("click", () => {
    const selected = templates.find(item => item.id === selectedId);

    if (selected) {
      loadTemplate(selected);
    } else {
      form.reset();
    }
  });

  function normalizeAddresses(value) {
    return value
      .split(/[;,]/)
      .map(x => x.trim())
      .filter(Boolean)
      .join(",");
  }

  // Rename existing button
  const mobileButton =
    form.querySelector('button[type="submit"], input[type="submit"]');

  if (mobileButton) {
    if (mobileButton.tagName === "INPUT") {
      mobileButton.value = "Mobile:  Open in email app";
    } else {
      mobileButton.textContent = "Mobile:  Open in email app";
    }
  }

  // Add PC button
  const pcButton = document.createElement("button");
  pcButton.type = "button";
  pcButton.textContent = "PC:  Open in email app";
  pcButton.className = mobileButton ? mobileButton.className : "button";
  pcButton.id = "pc-email-button";

  if (mobileButton) {
    mobileButton.insertAdjacentElement("afterend", pcButton);
  } else {
    form.appendChild(pcButton);
  }

  // Encode spaces as %20 instead of +
  function buildEncodedQuery(entries) {
    return entries
      .filter(([, value]) => value !== "")
      .map(([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  }

  // PC button – only Subject is replaced
  pcButton.addEventListener("click", () => {
    const to = normalizeAddresses(field("to").value);

    if (!to) {
      field("to").focus();
      setStatus("Please enter at least one recipient.");
      return;
    }

    const pcSubject =
      "१६ वर्षांचा अन्याय संपवा! २२/११/२०२६ पर्यंत मानाजीनगरचा १२ मीटर रस्ता खुला करा; अन्यथा २३/११ रोजी हजारोंचे निर्णायक आंदोलन!";

    const entries = [
      ["view", "cm"],
      ["fs", "1"],
      ["to", to],
      ["cc", normalizeAddresses(field("cc").value)],
      ["bcc", normalizeAddresses(field("bcc").value)],
      ["su", pcSubject],
      ["body", field("body").value]
    ];

    const gmailUrl =
      "https://mail.google.com/mail/?" + buildEncodedQuery(entries);

    window.open(gmailUrl, "_blank");

    setStatus(
      "PC email draft opened. To, CC, BCC and Body are unchanged; only the Subject is replaced."
    );
  });

  // Existing Mobile button functionality retained
  form.addEventListener("submit", event => {
    event.preventDefault();

    const to = normalizeAddresses(field("to").value);

    if (!to) {
      field("to").focus();
      setStatus("Please enter at least one recipient.");
      return;
    }

    const subject = field("subject").value.trim();
    const body = field("body").value;

    const entries = [
      ["cc", normalizeAddresses(field("cc").value)],
      ["bcc", normalizeAddresses(field("bcc").value)],
      ["subject", subject],
      ["body", body]
    ];

    const queryString = buildEncodedQuery(entries);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const url = `mailto:${to}?${queryString}`;
      window.location.href = url;
    } else {
      const gmailEntries = [
        ["view", "cm"],
        ["fs", "1"],
        ["to", to],
        ["cc", normalizeAddresses(field("cc").value)],
        ["bcc", normalizeAddresses(field("bcc").value)],
        ["su", subject],
        ["body", body]
      ];

      const gmailUrl =
        "https://mail.google.com/mail/?" + buildEncodedQuery(gmailEntries);

      window.open(gmailUrl, "_blank");
    }

    setStatus(
      "Your email app should open with a draft. Review it and press Send there."
    );
  });

  // Copy button
  document.getElementById("copy-button").addEventListener("click", async () => {
    const text = [
      `To: ${field("to").value}`,
      field("cc").value ? `CC: ${field("cc").value}` : "",
      field("bcc").value ? `BCC: ${field("bcc").value}` : "",
      `Subject: ${field("subject").value}`,
      "",
      field("body").value
    ].filter((line, index) => line !== "" || index === 4).join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Email text copied to clipboard.");
    } catch {
      setStatus(
        "Clipboard access is unavailable in this browser. You can select and copy the fields manually."
      );
    }
  });

  // Service Worker
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch(() => {});
    });
  }
})();
