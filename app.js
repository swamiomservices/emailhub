(() => {
  const templates = Array.isArray(window.EMAILHUB_TEMPLATES) ? window.EMAILHUB_TEMPLATES : [];
  const list = document.getElementById("template-list");
  const form = document.getElementById("email-form");
  const fields = ["to", "cc", "bcc", "subject", "body"];
  const status = document.getElementById("status");
  let selectedId = null;

  function field(name) { return document.getElementById(name); }
  function setStatus(message) { status.textContent = message; }

  function loadTemplate(template) {
    selectedId = template.id;
    fields.forEach(key => { field(key).value = template[key] || ""; });
    [...list.querySelectorAll("button")].forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.id === selectedId));
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
    description.textContent = template.description || "Predefined email";
    button.append(title, description);
    button.addEventListener("click", () => loadTemplate(template));
    list.appendChild(button);
  });

  if (templates.length) loadTemplate(templates[0]);
  else setStatus("No templates found. Please add templates in templates.js.");

  document.getElementById("reset-button").addEventListener("click", () => {
    const selected = templates.find(item => item.id === selectedId);
    if (selected) loadTemplate(selected);
    else form.reset();
  });

  function normalizeAddresses(value) {
    return value.split(/[;,]/).map(x => x.trim()).filter(Boolean).join(",");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const to = normalizeAddresses(field("to").value);
    if (!to) { field("to").focus(); setStatus("Please enter at least one recipient."); return; }
    const subject = field("subject").value.trim();
    const body = field("body").value;
    const params = new URLSearchParams();
    if (field("cc").value.trim()) params.set("cc", normalizeAddresses(field("cc").value));
    if (field("bcc").value.trim()) params.set("bcc", normalizeAddresses(field("bcc").value));
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const url = `mailto:${encodeURIComponent(to)}?${params.toString()}`;
    // The browser/operating system decides which email app handles mailto: links.
    window.location.href = url;
    setStatus("Your email app should open with a draft. Review it and press Send there.");
  });

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
      setStatus("Clipboard access is unavailable in this browser. You can select and copy the fields manually.");
    }
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
})();
