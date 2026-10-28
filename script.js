/* Small interactions for the portfolio. No framework required. */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = [...document.querySelectorAll(".nav-link")];
  const backToTop = document.getElementById("back-to-top");
  const year = document.getElementById("current-year");

  // Keep the footer year current.
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu: toggle it and close after a navigation link is chosen.
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    });
  }

  // Reveal content as it enters the viewport. Respect reduced-motion preferences.
  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Highlight the navigation item for the section currently in view.
  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(link => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Back-to-top control appears after the visitor scrolls down.
  const updateBackToTop = () => {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Contact form: validate locally, then open the visitor's email app.
  // For automatic website-to-email delivery, connect a backend or form service.
  const form = document.getElementById("contact-form");
  const notice = document.getElementById("form-notice");
  const fields = {
    name: { input: document.getElementById("name"), error: document.getElementById("name-error") },
    email: { input: document.getElementById("email"), error: document.getElementById("email-error") },
    subject: { input: document.getElementById("subject"), error: document.getElementById("subject-error") },
    message: { input: document.getElementById("message"), error: document.getElementById("message-error") }
  };

  function validateField(key) {
    const field = fields[key];
    const value = field.input.value.trim();
    let message = "";
    if (!value) message = "This field is required.";
    else if (key === "name" && value.length < 2) message = "Please enter at least 2 characters.";
    else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
    else if (key === "subject" && value.length < 3) message = "Please enter a subject of at least 3 characters.";
    else if (key === "message" && value.length < 10) message = "Please enter at least 10 characters.";
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  Object.keys(fields).forEach(key => {
    fields[key].input.addEventListener("blur", () => validateField(key));
    fields[key].input.addEventListener("input", () => {
      if (fields[key].input.getAttribute("aria-invalid") === "true") validateField(key);
    });
  });

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const valid = Object.keys(fields).map(validateField).every(Boolean);
      if (!valid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        if (notice) notice.textContent = "Please correct the highlighted fields before preparing your email.";
        return;
      }

      const name = fields.name.input.value.trim();
      const email = fields.email.input.value.trim();
      const subject = fields.subject.input.value.trim();
      const message = fields.message.input.value.trim();
      const body = `From: ${name}\nReply email: ${email}\n\n${message}`;
      const mailto = `mailto:mohamedwaseem2kk4@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (notice) notice.textContent = "Your email app should open with the message filled in. If it doesn't, email mohamedwaseem2kk4@gmail.com directly.";
      window.location.href = mailto;
    });
  }
});
