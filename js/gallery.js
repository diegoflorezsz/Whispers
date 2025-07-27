fetch("data/gifts.json")
  .then(res => res.json())
  .then(gifts => {
    const galleryContainer = document.getElementById("gallery");

    gifts.forEach(gift => {
      const isUnlocked = checkUnlockStatus(gift);

      // Crear tarjeta
      const card = document.createElement("div");
      card.classList.add("gift-card");
      card.dataset.id = gift.id;

      // Tamaño según importancia
      switch (gift.importance) {
        case 3:
          card.classList.add("large");
          break;
        case 2:
          card.classList.add("medium");
          break;
        default:
          card.classList.add("small");
      }

      // Imagen de portada
      const cover = document.createElement("img");
      cover.src = gift.cover;
      cover.alt = gift.title;
      cover.classList.add("gift-cover");
      if (!isUnlocked) {
        cover.classList.add("blurred");
      }

      // Información debajo de la portada
      const infoBar = document.createElement("div");
      infoBar.classList.add("gift-info");

      const title = document.createElement("span");
      title.classList.add("gift-title");
      title.textContent = gift.title;

      const status = document.createElement("span");
      status.classList.add("gift-status");
      status.textContent = isUnlocked ? "Desbloqueado" : "Bloqueado";

      infoBar.appendChild(title);
      infoBar.appendChild(status);

      // Redirección
      card.addEventListener("click", () => {
        window.location.href = `gift.html?id=${gift.id}`;
      });

      card.appendChild(cover);
      card.appendChild(infoBar);
      galleryContainer.appendChild(card);
    });
  });

// Función para verificar si el regalo está desbloqueado
function checkUnlockStatus(gift) {
  const saved = localStorage.getItem(`gift-${gift.id}-unlocked`);
  if (saved === "true") return true;

  if (gift.unlock.type === "none") return true;

  if (gift.unlock.type === "date") {
    const now = new Date();
    const unlockDate = new Date(gift.unlock.date);
    if (now >= unlockDate) {
      // Guardar desbloqueo automático
      localStorage.setItem(`gift-${gift.id}-unlocked`, "true");
      return true;
    }
  }

  return false;
}