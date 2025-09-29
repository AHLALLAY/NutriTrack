function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Fermer les messages de notification
function fermerMessage(id) {
  const message = document.getElementById(id);
  if (message) {
    message.style.opacity = "0";
    setTimeout(() => {
      message.remove();
    }, 300);
  }
}

// Fermer automatiquement les messages après 5 secondes
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const messages = document.querySelectorAll('[id^="message-"]');
    messages.forEach((message) => {
      message.style.opacity = "0";
      setTimeout(() => {
        message.remove();
      }, 300);
    });
  }, 5000);
});

// Validation du formulaire
document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("#profilForm, #profilFormMobile");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const poids = parseFloat(form.querySelector('input[name="poids"]').value);
      const taille = parseFloat(
        form.querySelector('input[name="taille"]').value
      );
      const age = parseInt(form.querySelector('input[name="age"]').value);

      if (poids <= 0 || taille <= 0 || age <= 0) {
        e.preventDefault();
        alert("Veuillez remplir tous les champs avec des valeurs valides");
        return;
      }

      if (age < 10 || age > 120) {
        e.preventDefault();
        alert("L'âge doit être entre 10 et 120 ans");
        return;
      }
    });
  });

  // Appliquer les styles de progression
  const progressBars = document.querySelectorAll(".progress-bar");
  progressBars.forEach((bar) => {
    const progress = bar.getAttribute("data-progress");
    if (progress) {
      bar.style.width = progress + "%";
    }
  });
});
