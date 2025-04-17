const cards = [];
class deck {
  static id = 0;
  constructor(name, price, img) {
    this.id = ++deck.id;
    (this.name = name), (this.price = price), (this.img = img);
  }
}

const card1 = new deck("death", 500, "./images/death.png");
const card2 = new deck("emperor", 300, "./images/emperor.png");
const card3 = new deck("empress", 350, "./images/empress.png");
const card4 = new deck("fool", 100, "./images/fool.png");
const card5 = new deck("hanged", 250, "./images/hanged.png");
const card6 = new deck("hierophant", 100, "./images/hierophant.png");
const card7 = new deck("magician", 250, "./images/magician.png");
const card8 = new deck("moon", 300, "./images/moon.png");
const card9 = new deck("star", 300, "./images/star.png");
const card10 = new deck("sun", 500, "./images/sun.png");
const card11 = new deck("priestess", 350, "./images/priestess.png");

cards.push(
  card1,
  card2,
  card3,
  card4,
  card5,
  card6,
  card7,
  card8,
  card9,
  card10,
  card11
);

let cardsDisplay = document.getElementById("cards-display");

function renderCards(cardsArray) {
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
    cardsDisplay.appendChild(display);
    selectCard();
  });
}
renderCards(cards);

const selectedCards = [];
let electrons = 2000;
const counterElectrons = document.getElementById("counter-electrons");
counterElectrons.innerHTML = electrons;

function selectCard() {
  const selectButtons = document.querySelectorAll(".card");

  selectButtons.forEach((button) => {
    button.onclick = () => {
      const cardId = parseInt(button.id);
      const selectedCard = cards.find((card) => card.id === cardId);
      const alreadySelected = selectedCards.some((card) => card.id === cardId);

      // Si no está seleccionada y alcanza para comprar
      if (!alreadySelected && electrons - selectedCard.price >= 0) {
        selectedCards.push(selectedCard);
        button.classList.add("selected"); // ayudita de ChatGPT :p
        electrons = electrons - selectedCard.price;
        localStorage.setItem("characters", JSON.stringify(selectedCards));
      } else if (alreadySelected) {
        const index = selectedCards.findIndex((card) => card.id === cardId);
        selectedCards.splice(index, 1);
        button.classList.remove("selected"); // ayudita de ChatGPT :p
        electrons = electrons + selectedCard.price;
        localStorage.setItem("characters", JSON.stringify(selectedCards));
      }
      counterElectrons.innerHTML = electrons;
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
