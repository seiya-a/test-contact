const formEl = document.getElementById("contact-form");
const buttonEl = document.getElementById("submit");
const checkboxEl = document.getElementById("agree");
const errorEl = document.getElementById("error");

async function sendContact(contact) {
  try {
    const resp = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    if (resp.ok) {
      window.location.assign(resp.url);
    } else {
      const error = await resp.json();
      console.error("Failed to send contact:", error.message);

      errorEl.textContent = error.message;
      errorEl.classList.add("block");
      errorEl.classList.remove("hidden");

      buttonEl.removeAttribute("disabled");
      buttonEl.textContent = "送信する";
    }
  } catch (err) {
    console.error("Error sending contact:", err);
  }
}

checkboxEl.addEventListener("change", (evt) => {
  checkboxEl.checked
    ? buttonEl.removeAttribute("disabled")
    : buttonEl.setAttribute("disabled", true);
});

formEl.addEventListener("submit", (evt) => {
  evt.preventDefault();

  buttonEl.setAttribute("disabled", true);
  buttonEl.textContent = "送信中...";

  const formData = new FormData(formEl);
  const { subject, name, company, email, content } = Object.fromEntries(
    formData.entries(),
  );

  sendContact({
    subject: [subject],
    name,
    company,
    email,
    content,
  });
});
