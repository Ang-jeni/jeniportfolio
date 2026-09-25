(() => {
  "use strict";

  const root = document.documentElement;
  const THEME_KEY = "angelin-theme";
  const validThemes = ["light","system","dark"];

  // Apply the saved preference and keep the OS preference live when System is selected.
  const savedTheme = localStorage.getItem(THEME_KEY);
  root.dataset.theme = validThemes.includes(savedTheme) ? savedTheme : "system";

  const themeButtons = document.querySelectorAll("[data-theme-choice]");
  const applyTheme = (theme, persist = true) => {
    const value = validThemes.includes(theme) ? theme : "system";
    root.dataset.theme = value;
    if (persist) localStorage.setItem(THEME_KEY, value);
    themeButtons.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === value)));
  };
  themeButtons.forEach(btn => btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice)));
  applyTheme(root.dataset.theme, false);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", () => {
    if (root.dataset.theme === "system") root.dataset.theme = "system";
  });

  // Mobile navigation.
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  const setMenu = open => {
    if (!nav || !menu) return;
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };
  menu?.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", e => {
    if (nav?.classList.contains("open") && !nav.contains(e.target) && !menu.contains(e.target)) setMenu(false);
  });

  // Current page / section.
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach(a => {
    const href = a.getAttribute("href") || "";
    const page = href.split("#")[0].split("/").pop() || "index.html";
    if (page === current && !href.includes("#")) a.classList.add("active");
  });

  const progress = document.querySelector(".progress");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();

  // Scroll reveal.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add("visible"));

  // Home-page section navigation.
  const sections = document.querySelectorAll("main section[id]");
  if (sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('[data-section-link]').forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, {rootMargin:"-25% 0px -60% 0px"});
    sections.forEach(s => observer.observe(s));
  }

  // Project filters.
  const filterButtons = document.querySelectorAll("[data-project-filter]");
  const projectCards = document.querySelectorAll("[data-project]");
  const empty = document.querySelector("[data-project-empty]");
  filterButtons.forEach(btn => btn.addEventListener("click", () => {
    const filter = btn.dataset.projectFilter;
    filterButtons.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    let count = 0;
    projectCards.forEach(card => {
      const show = filter === "all" || card.dataset.project.split(" ").includes(filter);
      card.classList.toggle("hidden", !show);
      if (show) count++;
    });
    empty?.classList.toggle("hidden", count !== 0);
  }));

  // Skills filters.
  const skillButtons = document.querySelectorAll("[data-skill-filter]");
  const skillCards = document.querySelectorAll("[data-skill]");
  skillButtons.forEach(btn => btn.addEventListener("click", () => {
    const filter = btn.dataset.skillFilter;
    skillButtons.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    skillCards.forEach(card => card.classList.toggle("hidden", filter !== "all" && card.dataset.skill !== filter));
  }));

  // Accessible project dialogs.
  const dialog = document.querySelector("[data-dialog]");
  const dialogContent = document.querySelector("[data-dialog-content]");
  const projectData = {
    neuropredict: {
      title:"NeuroPredict — AI-Based Stroke Risk Prediction System", meta:"AI / Machine Learning · Mar 2026",
      problem:"Early stroke-risk assessment can involve multiple clinical variables and requires interpretable model outputs.",
      solution:"Built a machine-learning workflow comparing classification models, with SHAP-based explanations and a Flask web application for real-time use.",
      tech:"Python, Logistic Regression, Random Forest, Gradient Boosting, SVM, KNN, GaussianNB, MLP, XGBoost, SHAP, Flask, SQLite",
      role:"Team Lead",
      contribution:"Model development, preprocessing, imbalance handling, evaluation, explainability, backend integration and deployment workflow.",
      result:"Research/project publication; evaluation included accuracy, precision, recall and AUC-ROC, with automated reports and email alerts."
    },
    drug: {
      title:"Smart Automatic Drug Dispenser", meta:"IoT / Healthcare · Smart India Hackathon Hardware Edition 2023",
      problem:"Medication routines can be difficult for elderly and disabled users to manage consistently.",
      solution:"Developed an automatic drug-dispensing solution using embedded/IoT-oriented hardware and sensor-based automation to support medication adherence.",
      tech:"IoT, Embedded Systems, Automation",
      role:"Team Player / Co-author",
      contribution:"Contributed to the team project and its technical development.",
      result:"First place at the national-level Smart India Hackathon 2023; IEEE Conference Proceedings publication."
    },
    water: {
      title:"Smart Water Meter", meta:"IoT · 2024",
      problem:"Rural communities can benefit from real-time visibility into water consumption and distribution.",
      solution:"Developed an IoT-based smart metering concept for real-time consumption tracking and efficient water distribution.",
      tech:"IoT, Embedded Systems, Real-time Monitoring",
      role:"Team project",
      contribution:"Contributed to development of the smart water metering solution.",
      result:"IIT MIC Build to Innovate 2024 — Semi-Finalist."
    }
  };
  const openProject = key => {
    if (!dialog || !dialogContent || !projectData[key]) return;
    const p = projectData[key];
    dialogContent.innerHTML = `<button class="dialog-close" type="button" data-dialog-close aria-label="Close project details">×</button>
      <div class="meta">${p.meta}</div><h2 id="dialog-title">${p.title}</h2>
      <div class="detail-grid">
        <section><h3>Problem</h3><p>${p.problem}</p></section>
        <section><h3>Solution</h3><p>${p.solution}</p></section>
        <section><h3>Technologies</h3><p>${p.tech}</p></section>
        <section><h3>Role</h3><p>${p.role}</p></section>
        <section><h3>Key contribution</h3><p>${p.contribution}</p></section>
        <section><h3>Result / achievement</h3><p>${p.result}</p></section>
      </div>`;
    dialog.showModal();
    dialog.querySelector("[data-dialog-close]")?.focus();
  };
  document.querySelectorAll("[data-project-open]").forEach(btn => btn.addEventListener("click", () => openProject(btn.dataset.projectOpen)));
  dialog?.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener("close", () => { document.querySelector("[data-project-open]")?.focus(); });

  // Back to top.
  const topBtn = document.querySelector("[data-top]");
  const toggleTop = () => topBtn?.classList.toggle("hidden", scrollY < 500);
  addEventListener("scroll", toggleTop, {passive:true}); toggleTop();
  topBtn?.addEventListener("click", () => scrollTo({top:0,behavior:"smooth"}));

  // Add a small year automatically where requested.
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();