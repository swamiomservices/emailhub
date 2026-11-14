
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
    setStatus("No templates found. Please add templates in templates.js.");
  }

  document.getElementById("reset-button").addEventListener("click", () => {
    const selected = templates.find(item => item.id === selectedId);
    if (selected) loadTemplate(selected);
    else form.reset();
  });

  function normalizeAddresses(value) {
    return value.split(/[;,]/)
      .map(x => x.trim())
      .filter(Boolean)
      .join(",");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const to = normalizeAddresses(field("to").value);
    if (!to) {
      field("to").focus();
      setStatus("Please enter at least one recipient.");
      return;
    }

    const cc = normalizeAddresses(field("cc").value);
    const bcc = normalizeAddresses(field("bcc").value);
    const subject = field("subject").value.trim();
    const body = field("body").value;

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const params = new URLSearchParams();
      if (cc) params.set("cc", cc);
      if (bcc) params.set("bcc", bcc);
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);

      window.location.href = `mailto:${to}?${params.toString()}`;
      setStatus("Your email app should open with a draft. Review and press Send.");
      return;
    }

    const gmailParams = new URLSearchParams();
    gmailParams.set("view", "cm");
    gmailParams.set("fs", "1");
    gmailParams.set("to", to);
    if (cc) gmailParams.set("cc", cc);
    if (bcc) gmailParams.set("bcc", bcc);

    const gmailUrl =
      "https://mail.google.com/mail/?" + gmailParams.toString();

    const gmailWindow = window.open(gmailUrl, "_blank");

    if (!gmailWindow) {
      setStatus("Gmail popup blocked. Please allow pop-ups and try again.");
      return;
    }

    setStatus(
      "Gmail opened. Copy Subject and Message from EmailHub into Gmail."
    );
  });

  document.getElementById("copy-button").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(field("body").value);
      setStatus(
        "Message copied. Paste it into Gmail body. Copy Subject separately."
      );
    } catch {
      setStatus("Please select and copy the Message field manually.");
    }
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch(() => {});
    });
  }
})();
