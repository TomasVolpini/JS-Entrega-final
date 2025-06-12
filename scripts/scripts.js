const cards = [];
const selectedCards = [];

const initialElectrons = 2000;
let electrons = initialElectrons;
let isEditing = false;

fetch("./db/db.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((card) => {
      cards.push(card);
    });

    renderCards(cards);
    loadEditingDeck();
    activateCards();
  });

let sort = document.getElementById("sort-cards");
sort.onchange = () => {
  const value = sort.value;
  switch (value) {
    case "price-asc":
      cards.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      cards.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      cards.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      cards.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderCards(cards);
};

function loadEditingDeck() {
  const editingDeck = JSON.parse(localStorage.getItem("editingDeck"));

  if (editingDeck) {
    isEditing = true;
    document.getElementById("player-name").value = editingDeck.playerName;
    document.getElementById("start").textContent = "Reactivar";
    localStorage.setItem("originalDeckName", editingDeck.playerName);

    selectedCards.length = 0;

    editingDeck.cards.forEach((cardId) => {
      const card = cards.find((c) => c.id === cardId);
      if (card) selectedCards.push(card);
    });

    updateElectrons();
    cardAvailability();
    renderCards(cards);
  } else {
    const tempCards = JSON.parse(localStorage.getItem("tempSelectedCards"));
    tempCards.forEach((id) => {
      const card = cards.find((c) => c.id === id);
      if (card) selectedCards.push(card);
    });
    renderCards(cards);
  }
}

function renderCards(cardsArray) {
  let cardsDisplay = document.getElementById("cards-display");
  cardsDisplay.innerHTML = "";
  cardsArray.forEach((card) => {
    const display = document.createElement("div");
    display.id = `${card.id}`;
    display.className = "div-img card";
    display.innerHTML = `<h2>${card.name}</h2>
                       <p>${card.price}</p>`;
    display.setAttribute(
      "style",
      `background-image: url(${card.img}) ; background-size: 100%;`
    );

    if (selectedCards.some((selected) => selected.id === card.id)) {
      display.classList.add("selected");
    }

    cardsDisplay.appendChild(display);
  });

  selectCard();
  updateElectrons();
  cardAvailability();
}

function renderActiveCards(cardsArray) {
  let cardsDisplay = document.getElementById("cards-display");
  cardsDisplay.innerHTML = "";
  cardsArray.forEach((card) => {
    const display = document.createElement("div");
    display.id = `${card.id}`;
    display.className = "div-img card";
    display.innerHTML = `<h2>${card.name}</h2>`;
    display.setAttribute(
      "style",
      `background-image: url(${card.img}) ; background-size: 100%;`
    );
    display.classList.remove("selected");

    cardsDisplay.appendChild(display);
  });
}

function updateElectrons() {
  const counterElectrons = document.getElementById("counter-electrons");
  electrons =
    initialElectrons -
    selectedCards.reduce((contador, card) => contador + card.price, 0);
  counterElectrons.innerHTML = electrons;
}

function selectCard() {
  const selectButtons = document.querySelectorAll(".card");

  selectButtons.forEach((button) => {
    button.onclick = () => {
      const cardId = parseInt(button.id);
      const selectedCard = cards.find((card) => card.id === cardId);
      const alreadySelected = selectedCards.some((card) => card.id === cardId);

      if (!alreadySelected && electrons - selectedCard.price >= 0) {
        selectedCards.push(selectedCard);
        button.classList.add("selected");
      } else if (alreadySelected) {
        const index = selectedCards.findIndex((card) => card.id === cardId);
        selectedCards.splice(index, 1);
        button.classList.remove("selected");
      }

      updateElectrons();
      cardAvailability();
      localStorage.setItem(
        "tempSelectedCards",
        JSON.stringify(selectedCards.map((c) => c.id))
      );
    };
  });
}

function cardAvailability() {
  const selectButtons = document.querySelectorAll(".card");

  selectButtons.forEach((button) => {
    const cardId = parseInt(button.id);
    const cardData = cards.find((card) => card.id === cardId);
    const isSelected = selectedCards.some((card) => card.id === cardId);

    if (!isSelected && electrons < cardData.price) {
      button.classList.add("disabled");
    } else {
      button.classList.remove("disabled");
    }
  });
}

function activateCards() {
  let activateButton = document.getElementById("start");
  let allSet = document.querySelector(".choose");

  activateButton.onclick = () => {
    const playerName = document.getElementById("player-name").value.trim();
    if (!playerName) {
      showAlert("¡Atención!", "Debes ingresar un nombre al deck.");
      return;
    }

    if (selectedCards.length === 0) {
      showAlert("¡Atención!", "Debes seleccionar al menos una carta.");
      return;
    }

    const decks = JSON.parse(localStorage.getItem("decks"));
    const originalName = localStorage.getItem("originalDeckName");

    const nameIsTaken = decks.some((d) => {
      if (isEditing && d.playerName === originalName) return false;
      return d.playerName === playerName;
    });

    if (nameIsTaken) {
      showAlert("¡Error!", "Ya existe un deck con ese nombre.");
      return;
    }

    const newDeck = {
      playerName: playerName,
      cards: selectedCards.map((card) => card.id),
      usedElectrons: selectedCards.reduce((sum, card) => sum + card.price, 0),
    };

    if (isEditing) {
      const updatedDecks = decks.map((d) =>
        d.playerName === originalName ? newDeck : d
      );
      localStorage.setItem("decks", JSON.stringify(updatedDecks));
      localStorage.removeItem("originalDeckName");
    } else {
      decks.push(newDeck);
      localStorage.setItem("decks", JSON.stringify(decks));
    }

    localStorage.removeItem("editingDeck");
    localStorage.removeItem("tempSelectedCards");

    startCountdown(allSet);
  };

  document.getElementById("view-decks").onclick = () => {
    window.location.href = "./pages/decks.html";
  };
}

function showAlert(title, text) {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
    background: "#ff00c8",
    color: "#000000",
    iconColor: "#000000",
    confirmButtonColor: "#000000",
    confirmButtonText: "Entendido",
    customClass: {
      popup: "swal2-fucsia",
    },
  });
}

function startCountdown(allSet) {
  let countdown = 5;
  document.getElementById("sort-cards").remove();
  document.getElementById("start").remove();
  document.getElementById("view-decks").remove();

  renderActiveCards(selectedCards);
  selectedCards.forEach((card) => {
    const cardElement = document.getElementById(card.id);
    cardElement.classList.add("locked");
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  allSet.innerHTML = `Has activado las siguientes cartas, redirigiendo al deck en ${countdown}`;

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      allSet.innerHTML = `Has activado las siguientes cartas, redirigiendo al deck en ${countdown}`;
    } else {
      clearInterval(interval);
      window.location.href = "./pages/decks.html";
    }
  }, 1000);
}
