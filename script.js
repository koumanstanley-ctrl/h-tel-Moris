"use strict";

// ANNÉE AUTOMATIQUE

const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


// MENU MOBILE

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fermer le menu" : "Ouvrir le menu"
    );
  });

  navigation.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    });
  });

  document.addEventListener("click", function (event) {
    const clickedInsideMenu = navigation.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    }
  });
}


// DATES DU FORMULAIRE

const arrivalInput = document.getElementById("arrival");
const departureInput = document.getElementById("departure");

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = new Date();
const todayString = getLocalDateString(today);

if (arrivalInput && departureInput) {
  arrivalInput.min = todayString;
  departureInput.min = todayString;

  arrivalInput.addEventListener("change", function () {
    if (!arrivalInput.value) {
      departureInput.min = todayString;
      return;
    }

    const arrivalDate = new Date(
      arrivalInput.value + "T12:00:00"
    );

    arrivalDate.setDate(arrivalDate.getDate() + 1);

    const minimumDeparture = getLocalDateString(arrivalDate);

    departureInput.min = minimumDeparture;

    if (
      departureInput.value &&
      departureInput.value <= arrivalInput.value
    ) {
      departureInput.value = "";
    }
  });
}


// FORMULAIRE DE DEMANDE

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");

if (bookingForm) {
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const guestName = document
      .getElementById("guestName")
      .value.trim();

    const arrival = arrivalInput.value;
    const departure = departureInput.value;

    const guests = document.getElementById("guests").value;

    const request = document
      .getElementById("request")
      .value.trim();

    if (!guestName || !arrival || !departure) {
      formMessage.textContent =
        "Veuillez remplir votre nom et les dates de séjour.";

      return;
    }

    if (arrival < todayString) {
      formMessage.textContent =
        "La date d'arrivée ne peut pas être dans le passé.";

      return;
    }

    if (departure <= arrival) {
      formMessage.textContent =
        "La date de départ doit être après la date d'arrivée.";

      return;
    }

    const formattedArrival = new Date(
      arrival + "T12:00:00"
    ).toLocaleDateString("fr-FR");

    const formattedDeparture = new Date(
      departure + "T12:00:00"
    ).toLocaleDateString("fr-FR");

    const message = [
      "Bonjour Hôtel Moris,",
      "",
      "Je souhaite obtenir des renseignements concernant un séjour.",
      "",
      "Nom : " + guestName,
      "Date d'arrivée : " + formattedArrival,
      "Date de départ : " + formattedDeparture,
      "Nombre de personnes : " + guests,
      "Demande : " + (request || "Renseignements sur les tarifs et disponibilités"),
      "",
      "Pouvez-vous me renseigner sur les disponibilités et les tarifs ?"
    ].join("\n");

    /*
      Le numéro officiel WhatsApp de l'hôtel n'étant pas confirmé,
      on ne redirige pas le visiteur vers un numéro inventé.

      Le formulaire prépare le message et permet au visiteur
      de le copier pour l'envoyer au contact officiel de l'hôtel.
    */

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(message)
        .then(function () {
          formMessage.textContent =
            "Votre demande a été copiée. Recherchez le contact officiel de l'hôtel pour lui envoyer le message. Aucune réservation n'a été effectuée.";
        })
        .catch(function () {
          showPreparedMessage(message);
        });
    } else {
      showPreparedMessage(message);
    }
  });
}

function showPreparedMessage(message) {
  const container = document.createElement("div");

  container.className = "prepared-message";

  const title = document.createElement("strong");
  title.textContent = "Votre message est prêt";

  const instructions = document.createElement("p");
  instructions.textContent =
    "Copiez ce texte et envoyez-le au contact officiel de l'hôtel.";

  const textarea = document.createElement("textarea");
  textarea.rows = 9;
  textarea.readOnly = true;
  textarea.value = message;
  textarea.style.width = "100%";
  textarea.style.padding = "12px";
  textarea.style.marginTop = "12px";
  textarea.style.fontSize = "12px";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "btn btn-primary";
  copyButton.textContent = "Copier le message";
  copyButton.style.marginTop = "12px";

  copyButton.addEventListener("click", async function () {
    try {
      textarea.select();

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
      } else {
        document.execCommand("copy");
      }

      copyButton.textContent = "Message copié";
    } catch (error) {
      textarea.focus();
      textarea.select();
      copyButton.textContent = "Sélectionnez le texte pour le copier";
    }
  });

  container.appendChild(title);
  container.appendChild(instructions);
  container.appendChild(textarea);
  container.appendChild(copyButton);

  formMessage.replaceWith(container);
}
