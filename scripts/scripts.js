const cards = [];
const selectedCards = [];

const initialElectrons = 2000;
let electrons = initialElectrons;

fetch("./db/db.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((card) => {
      cards.push(card);
    });

    renderCards(cards);
    loadLocalCards();
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

function loadLocalCards() {
  const localSelectedCards = JSON.parse(localStorage.getItem("characters"));
  if (localSelectedCards.length > 0) {
    localSelectedCards.forEach((localCard) => {
      const originalCard = cards.find((card) => card.id === localCard.id);
      if (cards.some((card) => card.id === localCard.id)) {
        selectedCards.push(originalCard);
      }
    });
    selectedCards.forEach((selectedCard) => {
      const cardElement = document.getElementById(selectedCard.id);
      if (cards.some((card) => card.id === selectedCard.id)) {
        cardElement.classList.add("selected");
      }
    });

    updateElectrons();
    cardAvailability();
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

    // Si la carta está seleccionada, agrego la clase "selected"
    if (selectedCards.some((selected) => selected.id === card.id)) {
      display.classList.add("selected");
    }

    cardsDisplay.appendChild(display);
  });

  selectCard();
  cardAvailability();
  updateElectrons();
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
        localStorage.setItem("characters", JSON.stringify(selectedCards));
      } else if (alreadySelected) {
        const index = selectedCards.findIndex((card) => card.id === cardId);
        selectedCards.splice(index, 1);
        button.classList.remove("selected");
        localStorage.setItem("characters", JSON.stringify(selectedCards));
      }

      updateElectrons();
      cardAvailability();
    };
  });
}

function cardAvailability() {
  const selectButtons = document.querySelectorAll(".card");

  selectButtons.forEach((button) => {
    const cardId = parseInt(button.id);
    const cardData = cards.find((card) => card.id === cardId);
    const isSelected = selectedCards.some((card) => card.id === cardId);

    // Si no está seleccionada y no alcanza para comprarla
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
    let countdown = 5;
    sort.remove();
    activateButton.remove();
    renderActiveCards(selectedCards);
    selectedCards.forEach((card) => {
      const cardElement = document.getElementById(card.id);
      cardElement.classList.add("locked");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    allSet.innerHTML = `Has activado las siguientes cartas, el juego comienza en ${countdown}`;
    localStorage.clear();

    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        allSet.innerHTML = `Has activado las siguientes cartas, el juego comienza en ${countdown}`;
      } else {
        clearInterval(interval);
        window.location.href = "./pages/juego.html";
      }
    }, 1000);
  };
}
