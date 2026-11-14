/* Interactions for the static export; no Next.js or React runtime is needed. */
(() => {
  const data = window.PORTFOLIO_STATIC;
  const email = "ajeshcreatives@gmail.com";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  async function copy(text, button, label) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      const target = button.querySelector("span:last-child") || button;
      const previous = target.textContent;
      target.textContent = label;
      setTimeout(() => { target.textContent = previous; }, 2200);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied && text === email) window.location.href = `mailto:${email}`;
    }
  }

  const navToggle = $('[aria-label="Toggle Navigation Menu"]');
  const menu = document.createElement("nav");
  menu.className = "static-menu";
  menu.hidden = true;
  menu.setAttribute("aria-label", "Mobile navigation");
  menu.innerHTML = [
    ["Works", "#works"], ["Design Systems", "#design-system"],
    ["About", "#about"], ["Branding & Spatial", "#branding"],
    ["Contact", "#contact"]
  ].map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
  document.body.append(menu);
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    navToggle.setAttribute("aria-expanded", String(!menu.hidden));
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menu.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  const dialog = document.createElement("dialog");
  dialog.className = "static-dialog";
  dialog.setAttribute("aria-label", "Recruiter summary");
  dialog.innerHTML = `
    <div class="flex justify-between items-center gap-4 border-b border-white/10 pb-5">
      <span class="text-cyan-400 text-xs font-bold uppercase tracking-widest">Recruiter Executive Summary</span>
      <button type="button" data-close aria-label="Close recruiter summary" class="text-2xl text-white">&times;</button>
    </div>
    <div class="flex flex-col sm:flex-row items-center gap-6 py-7">
      <img src="images/ajesh-portrait.png" alt="Ajesh Mohanan" width="100" height="120">
      <div><h2 class="font-heading text-2xl font-bold text-white">Ajesh Mohanan</h2>
      <p class="text-cyan-300">Senior UI/UX Designer &amp; Design Team Lead</p>
      <p class="text-sm text-slate-300 mt-3">15+ years in enterprise healthcare SaaS, mobile applications, and design systems. Bangalore and remote ready.</p></div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7 text-center">
      <div class="glass-card rounded-xl p-4"><strong class="text-cyan-400 text-xl">15+</strong><p class="text-xs">Years</p></div>
      <div class="glass-card rounded-xl p-4"><strong class="text-cyan-400 text-xl">+50%</strong><p class="text-xs">Workflow Speed</p></div>
      <div class="glass-card rounded-xl p-4"><strong class="text-cyan-400 text-xl">180+</strong><p class="text-xs">Design Tokens</p></div>
      <div class="glass-card rounded-xl p-4"><strong class="text-cyan-400 text-xl">45+</strong><p class="text-xs">Products Shipped</p></div>
    </div>
    <div class="flex flex-wrap gap-4">
      <a href="mailto:${email}" class="rounded-xl bg-cyan-400 text-black font-bold px-5 py-3 text-sm">Email Ajesh</a>
      <a href="https://www.linkedin.com/in/ajesh-mohan-a57a7155" target="_blank" rel="noopener noreferrer" class="rounded-xl glass-card px-5 py-3 text-sm">LinkedIn</a>
      <a href="tel:+918105189169" class="rounded-xl glass-card px-5 py-3 text-sm">+91 8105 189 169</a>
    </div>`;
  document.body.append(dialog);
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  $$('[data-cursor="RECRUITER"]').forEach((button) =>
    button.addEventListener("click", () => dialog.showModal())
  );

  const articles = $$("#works article");
  const filters = $$('[data-cursor="FILTER"]');
  filters.forEach((button) => button.addEventListener("click", () => {
    filters[0].classList.remove("bg-white", "text-black", "border-white", "font-bold");
    filters.forEach((item) => item.classList.toggle("static-active", item === button));
    articles.forEach((article, index) => {
      article.hidden = button.textContent.trim() !== "All" &&
        data.projects[index].category !== button.textContent.trim();
    });
  }));

  articles.forEach((article, index) => {
    const project = data.projects[index];
    const screenBar = $$("span", article).find((span) => span.textContent.trim() === "Screens:");
    const buttons = screenBar ? $$("button", screenBar.parentElement) : [];
    const image = $("img", article);
    const caption = image?.parentElement.querySelector("p");
    const heading = $(".truncate", article);
    const device = $$("span", article).find((span) => span.textContent.trim().endsWith(" View"));
    buttons.forEach((button, screenIndex) => button.addEventListener("click", () => {
      const screen = project.screens[screenIndex];
      if (!screen || !image) return;
      buttons[0].classList.remove("bg-cyan-500/20", "text-cyan-300", "border-cyan-400/50", "shadow-md", "font-bold");
      image.src = screen.imageUrl;
      image.alt = screen.title;
      if (caption) caption.textContent = screen.caption;
      if (heading) heading.textContent = `${screen.title} - ${project.title}`;
      if (device) device.textContent = `${screen.device} View`;
      buttons.forEach((item) => item.classList.toggle("static-active", item === button));
    }));
  });

  const themes = [
    { color: "#00f0ff", contrast: "8.2:1 (AAA)" },
    { color: "#ffffff", contrast: "15.4:1 (AAA)" },
    { color: "#10b981", contrast: "7.9:1 (AAA)" },
    { color: "#f59e0b", contrast: "9.1:1 (AAA)" }
  ];
  const design = $("#design-system");
  const themeButtons = $$("button", design).slice(0, 4);
  const token = $("code", design);
  const contrast = $$("span", design).find((span) => span.textContent.trim() === "8.2:1 (AAA)");
  const action = $$("button", design).find((button) => button.textContent.includes("Dispatch Clinician"));
  themeButtons.forEach((button, index) => button.addEventListener("click", () => {
    themeButtons[0].classList.remove("bg-white/10", "text-white", "border-white/40", "shadow-lg", "font-bold");
    themeButtons.forEach((item) => item.classList.toggle("static-active", item === button));
    if (token) token.textContent = `--color-primary: ${themes[index].color};`;
    if (contrast) contrast.textContent = themes[index].contrast;
    if (action) action.style.backgroundColor = themes[index].color;
  }));
  const tokenButton = $$("button", design).find((button) => button.textContent.includes("Copy Token"));
  tokenButton?.addEventListener("click", () => copy(token.textContent.trim(), tokenButton, "Copied Token!"));

  const branding = $("#branding");
  const thumbnails = $$(".cursor-pointer", branding);
  const featuredImage = $("img", branding);
  const featuredHeading = $("h3", branding);
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.setAttribute("role", "button");
    thumbnail.setAttribute("tabindex", "0");
    const select = () => {
      const mockup = data.brandingMockups[index];
      thumbnails[0].classList.remove("border-cyan-400", "shadow-[0_0_20px_rgba(0,240,255,0.3)]", "scale-[1.02]");
      featuredImage.src = mockup.imageUrl;
      featuredImage.alt = mockup.title;
      if (featuredHeading) featuredHeading.textContent = mockup.title;
      thumbnails.forEach((item) => item.classList.toggle("static-active", item === thumbnail));
    };
    thumbnail.addEventListener("click", select);
    thumbnail.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }
    });
  });

  const contact = $("#contact");
  const form = $("form", contact);
  const groups = $$(":scope > div", form);
  const choices = groups.slice(0, 2).map((group) => $$('button[type="button"]', group));
  choices.forEach((buttons) => buttons.forEach((button) =>
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.toggle("static-active", item === button));
    })
  ));
  const currentChoice = (buttons) => buttons.find((button) => button.classList.contains("static-active"))?.textContent.trim()
    || buttons[0]?.textContent.trim() || "";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const subject = `Design Inquiry: ${currentChoice(choices[0])} [${currentChoice(choices[1])}]`;
    const body = `Hello Ajesh,\n\nI reviewed your portfolio and would like to connect regarding:\nObjective: ${currentChoice(choices[0])}\nTimeline: ${currentChoice(choices[1])}\n\nNotes:\n${$("textarea", form).value}\n\nBest regards.`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  const copyButton = $$("button", contact).find((button) => button.textContent.includes(email));
  copyButton?.addEventListener("click", () => copy(email, copyButton, "Copied!"));

  const clock = $$("span", contact).find((span) => span.textContent.trim() === "15:45:00");
  if (clock) {
    const updateClock = () => {
      clock.textContent = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit"
      }).format(new Date());
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
})();
