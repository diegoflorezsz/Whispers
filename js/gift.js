const params = new URLSearchParams(window.location.search);
const giftId = parseInt(params.get("id"));
const localKey = `gift-${giftId}-unlocked`;

fetch("data/gifts.json")
  .then(res => res.json())
  .then(gifts => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;

    const textContainer = document.getElementById("gift-text");
    const mediaContainer = document.getElementById("gift-media");
    const unlockType = gift.unlock.type;

    const renderGift = () => {
      localStorage.setItem(localKey, "true");

      let textHTML = `<h2>${gift.title}</h2>`;
      textHTML += `<p class="story">${gift.content.story}</p>`;

      if (gift.content.poem) {
        textHTML += `<div class="poem">${gift.content.poem}</div>`;
      }

      if (gift.content.audios) {
        gift.content.audios.forEach(audio => {
          textHTML += `
            <div class="audio-block">
              ${audio.description ? `<p>${audio.description}</p>` : ""}
              <audio src="${audio.src}" controls></audio>
            </div>`;
        });
      }

      textContainer.innerHTML = textHTML;

      let mediaHTML = "";
      if (gift.content.images) {
        gift.content.images.forEach(img => {
          mediaHTML += `<img src="${img.src}" class="${img.size}" alt="image">`;
        });
      }

      if (gift.content.videos) {
        gift.content.videos.forEach(video => {
          mediaHTML += `<video src="${video.src}" controls class="${video.size}"></video>`;
        });
      }

      mediaContainer.innerHTML = mediaHTML;
    };

    const showCountdown = () => {
      const unlockDate = new Date(gift.unlock.date);
      const now = new Date();

      if (now >= unlockDate) {
        renderGift();
        return;
      }

      const interval = setInterval(() => {
        const now = new Date();
        const diff = unlockDate - now;

        if (diff <= 0) {
          clearInterval(interval);
          renderGift();
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        textContainer.innerHTML = `
          <h2>${gift.title}</h2>
          <p class="countdown-message">Este regalo se desbloqueará el ${unlockDate.toLocaleDateString()}.</p>
          <div class="countdown-timer">${days}d ${hours}h ${minutes}m ${seconds}s</div>
          <p class="countdown-note">Te amo. Deja de ser tan impaciente.</p>
        `;
        mediaContainer.innerHTML = "";
      }, 1000);
    };

    const showKeyForm = () => {
      textContainer.innerHTML = `
        <h2>${gift.title}</h2>
        <p class="question">${gift.unlock.question}</p>
        <form id="unlock-form">
          <input type="text" id="key-input" placeholder="Tu respuesta..." required />
          <button type="submit">Desbloquear</button>
          <p id="hint" class="hint-text" style="display:none;">${gift.unlock.hint || ""}</p>
          <p id="error" class="error-text" style="color: red; display: none;">Respuesta incorrecta. Inténtalo de nuevo.</p>
        </form>
      `;
      mediaContainer.innerHTML = "";

      document.getElementById("unlock-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("key-input").value.trim().toLowerCase();
        const answer = gift.unlock.key.trim().toLowerCase();

        if (input === answer) {
          textContainer.innerHTML = `
            <h2>${gift.title}</h2>
            <p class="success-message">${gift.unlock.successMessage || "¡Correcto! Aquí está tu regalo:"}</p>
            <button id="show-gift-btn">Mirar mi regalo</button>
          `;
          mediaContainer.innerHTML = "";

          document.getElementById("show-gift-btn").addEventListener("click", () => {
            renderGift();
          });

          localStorage.setItem(localKey, "true");
        } else {
          document.getElementById("error").style.display = "block";
          if (gift.unlock.hint) {
            document.getElementById("hint").style.display = "block";
          }
        }
      });
    };

    // Verificar si ya está desbloqueado desde antes
    const alreadyUnlocked = localStorage.getItem(localKey) === "true";

    if (unlockType === "none" || alreadyUnlocked) {
      renderGift();
    } else if (unlockType === "date") {
      showCountdown();
    } else if (unlockType === "key") {
      showKeyForm();
    }
  });