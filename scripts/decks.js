function loadDecks() {
  const decksContainer = document.getElementById("decks-container");
  decksContainer.innerHTML = "";

  const decks = JSON.parse(localStorage.getItem("decks"));
  const cardsData = JSON.parse(localStorage.getItem("cardsData"));

  if (decks.length === 0) {
    decksContainer.innerHTML = "<p>No hay decks guardados</p>";
    return;
  }

  decks.forEach((deck) => {
    const deckElement = document.createElement("div");
    deckElement.className = "deck";

    const deckInfo = document.createElement("div");
    deckInfo.className = "deck-info";
    deckInfo.innerHTML = `
        <h2>${deck.playerName}</h2>
        <p>Cartas: ${deck.cards.length}</p>
        <p>Electrones usados: ${deck.usedElectrons}</p>
        <p>Electrones restantes: ${2000 - deck.usedElectrons}</p>
      `;

    const cardsPreview = document.createElement("div");
    cardsPreview.className = "cards-preview";

    deck.cards.slice(0, 5).forEach((cardId) => {
      const card = cardsData.find((c) => c.id === cardId);
      if (card) {
        const cardThumb = document.createElement("div");
        cardThumb.className = "card-thumb";
        cardThumb.style.backgroundImage = `url(.${card.img})`;
        cardsPreview.appendChild(cardThumb);
      }
    });

    const deckActions = document.createElement("div");
    deckActions.className = "deck-actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-deck";
    editButton.textContent = "Editar";
    editButton.onclick = () => {
      localStorage.setItem("editingDeck", JSON.stringify(deck));
      window.location.href = "../index.html";
    };

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-deck";
    deleteButton.textContent = "Eliminar";
    deleteButton.onclick = () => confirmDeleteDeck(deck);

    deckActions.appendChild(editButton);
    deckActions.appendChild(deleteButton);

    deckElement.appendChild(deckInfo);
    deckElement.appendChild(cardsPreview);
    deckElement.appendChild(deckActions);

    decksContainer.appendChild(deckElement);
  });
}

fetch("../db/db.json")
  .then((response) => response.json())
  .then((data) => {
    localStorage.setItem("cardsData", JSON.stringify(data));
    loadDecks();
  });

function createDeckElement(deck) {
  const deckElement = document.createElement("div");
  deckElement.className = "deck";

  deckElement.appendChild(createDeckInfo(deck));
  deckElement.appendChild(createDeckActions(deck));

  return deckElement;
}

function createDeckInfo(deck) {
  const deckInfo = document.createElement("div");
  deckInfo.className = "deck-info";
  deckInfo.innerHTML = `
      <h2>${deck.playerName}</h2>
      <p>Cartas: ${deck.cards.length}</p>
      <p>Electrones usados: ${deck.usedElectrons}</p>
      <p>Electrones restantes: ${2000 - deck.usedElectrons}</p>
    `;
  return deckInfo;
}

function createDeckActions(deck) {
  const deckActions = document.createElement("div");
  deckActions.className = "deck-actions";

  deckActions.appendChild(createEditButton(deck));
  deckActions.appendChild(createDeleteButton(deck));

  return deckActions;
}

function createEditButton(deck) {
  const button = document.createElement("button");
  button.className = "edit-deck";
  button.textContent = "Editar";
  button.onclick = () => {
    localStorage.setItem("editingDeck", JSON.stringify(deck));
    window.location.href = "../index.html";
  };
  return button;
}

function createDeleteButton(deck) {
  const button = document.createElement("button");
  button.className = "delete-deck";
  button.textContent = "Eliminar";
  button.onclick = () => confirmDeleteDeck(deck);
  return button;
}

function confirmDeleteDeck(deckToDelete) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#00ff88",
    cancelButtonColor: "#ff00c8",
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
    background: "#1a1a1a",
    color: "#00ffe7",
    iconColor: "#ff00c8",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteDeck(deckToDelete);
    }
  });
}

function deleteDeck(deckToDelete) {
  const decks = JSON.parse(localStorage.getItem("decks"));
  const updatedDecks = decks.filter(
    (deck) => JSON.stringify(deck) !== JSON.stringify(deckToDelete)
  );

  localStorage.setItem("decks", JSON.stringify(updatedDecks));
  loadDecks();

  Swal.fire({
    title: "Borrado!",
    text: "El deck ha sido eliminado.",
    icon: "success",
    background: "#1a1a1a",
    color: "#00ffe7",
    iconColor: "#00ff88",
  });
}

document.getElementById("create-deck").onclick = () => {
  window.location.href = "../index.html";
};

loadDecks();
