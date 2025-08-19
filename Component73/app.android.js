var self = {
    obj: document.querySelector(".component73"),
    rootPath: '',
    params: {
        ServerIp: '',
        RootPath: '',
        PlayerID: '',
        InstanceID: ''
    },
    url: window.location.href,
    baseUrl: 'http://',

    getRealInstanceID: function () {
        var arr = self.params.InstanceID.split("-");
        return arr[arr.length - 1];
    },

    getServerIp: function () {
        return self.params.ServerIp;
    },

    getMediaListUrl: function (mediaListId) {
        return self.baseUrl + self.params.ServerIp + "/rest/getMediaListItems/" + mediaListId;
    },

    restGetPlayerInfoUrl: function () {
        return (
            self.baseUrl +
            self.params.ServerIp +
            "/rest/getPlayerInfo/" +
            self.params.PlayerID +
            "/" +
            self.getRealInstanceID()
        );
    },
    rowCount: 45,
    scrollSpeed: 0.5,
    butterflies: [],
    score: 0,
    scrollOffset: 0,
    gameDuration: 20000,
    interval: null,
    isGameActive: false,

    giftItems: [
            { name: "ADIDAS", image: "images/adidas.png", stock: 100 },
            { name: "CANTA", image: "images/canta.png", stock: 0 },
            { name: "TISORT", image: "images/tisort.png", stock: 0 },
            { name: "MATARA", image: "images/matara.png", stock: 0 },
            { name: "BEYAZ CANTA", image: "images/beyazcanta.png", stock: 0 },
            { name: "GOZLUK", image: "images/gozluk.png", stock: 0 },
            { name: "PARFÜM", image: "images/parfum.png", stock: 0 },
            { name: "RUJ", image: "images/ruj.png", stock: 0 },
            { name: "NIKE", image: "images/nike.png", stock: 0 }
],
    
    audio: {
        main: new Audio("sounds/main.mp3"), 
        hitIndex: 0,
        lastHit: null
    },

    init: function () {
        self.bindClicks();
    },

    startGame: function () {
        document.getElementById("startOverlay").style.display = "none";
        self.createRows();
        self.startTimer();
        self.audio.main.currentTime = 0;
        self.audio.main.volume = 0.9;
        self.audio.main.play();
        self.isGameActive = true;
        requestAnimationFrame(self.animate);
    },

createRows: function () {
    const track = self.obj.querySelector(".track");

    for (let i = 0; i <= self.rowCount; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        row.style.top = `${-i * 100}px`;

        for (let j = 0; j < 3; j++) {
            const lane = document.createElement("div");
            lane.classList.add("lane");

            const cell = document.createElement("div");
            cell.classList.add("cell");
            lane.appendChild(cell);
            row.appendChild(lane);
        }

        const randLane = Math.floor(Math.random() * 3);
        const butterfly = document.createElement("img");
        butterfly.src = "images/butterfly.png";
        butterfly.className = "butterfly";
        butterfly.dataset.row = i;
        butterfly.dataset.clicked = "false";

        row.children[randLane].querySelector(".cell").appendChild(butterfly);
        self.butterflies.push(butterfly);
        track.appendChild(row);
    }
},

    animate: function () {
        if (!self.isGameActive) return;
        const rows = document.querySelectorAll(".row");
        self.scrollOffset += self.scrollSpeed;

        rows.forEach(row => {
            const top = parseFloat(row.style.top);
            row.style.top = `${top + self.scrollSpeed}px`;
        });

        requestAnimationFrame(self.animate);
    },

    // Tıklama anında sesi saniyesinden başlatır ve ... saniye çalar
    playSegment: function (src, start, duration = 1.3) {
        if (self.audio.lastHit && !self.audio.lastHit.paused) {
            self.audio.lastHit.pause();
            self.audio.lastHit.remove();
        }

        const audio = new Audio(src);
        audio.currentTime = start;
        audio.volume = 1;
        audio.play();

        const stopper = setInterval(() => {
            if (audio.currentTime >= start + duration) {
                audio.pause();
                audio.remove();
                clearInterval(stopper);
            }
        }, 100);

        self.audio.lastHit = audio;
    },

    bindClicks: function () {
        self.obj.addEventListener("click", function (e) {
            if (!self.isGameActive) return;
            if (!e.target.classList.contains("butterfly")) return;

            const butterfly = e.target;
            if (butterfly.dataset.clicked === "true") return;

            const hitLineY = self.obj.querySelector(".hit-line").getBoundingClientRect().top;
            const butterflyTop = butterfly.getBoundingClientRect().top;

            if (butterflyTop >= hitLineY + 5) {
                butterfly.dataset.clicked = "true";

                const cell = butterfly.closest(".cell");

                if (cell) {
                    cell.classList.add("clicked");
                    setTimeout(() => {
                    cell.classList.remove("clicked");
                }, 500);
            }
                self.updateScore();

                const segmentStart = 15 + (self.audio.hitIndex * 1.5);
                self.playSegment("sounds/vocals.mp3", segmentStart);
                self.audio.hitIndex = (self.audio.hitIndex + 1) % 10;

                butterfly.style.transition = "transform 0.3s ease, opacity 0.3s ease";
                butterfly.style.transform = "scale(0)";
                butterfly.style.opacity = "0";
            }
        });
    },

    updateScore: function () {
        self.score++;
        const scoreEl = document.getElementById("scoreValue");
        if (scoreEl) scoreEl.innerText = self.score;
    },

    startTimer: function () {
        const fill = document.querySelector(".time-fill");
        const label = document.getElementById("timeLabel");
        let startTime = Date.now();

        function update() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, self.gameDuration - elapsed);
            const percent = Math.max(0, 100 - (elapsed / self.gameDuration) * 100);
            fill.style.width = percent + "%";

            if (label) label.textContent = Math.ceil(remaining / 1000) + "sn";

            if (elapsed < self.gameDuration) {
                requestAnimationFrame(update);
            } else {
                self.endGame();
            }
        }

        update();
    },
    showConfetti: function () {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.innerHTML = `<canvas id="confetti-canvas"></canvas>`;
    document.body.appendChild(confetti);

    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 350; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 10 + 5,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
            ctx.fillStyle = p.color;
            ctx.fill();
            p.y += p.d * 0.2;
            if (p.y > canvas.height) p.y = -10;
        });
        requestAnimationFrame(draw);
    }

    draw();
},
    
endGame: function () {
    self.isGameActive = false;
    self.audio.main.pause();
    self.audio.main.currentTime = 0;

    const hitLineY = self.obj.querySelector(".hit-line").getBoundingClientRect().top;
    let missed = false;

    self.butterflies.forEach(butterfly => {
        const top = butterfly.getBoundingClientRect().top;
        if (top >= hitLineY + 5 && butterfly.dataset.clicked === "false") {
            missed = true;
        }
    });

    if (!missed) {
        self.showConfetti();
    }

    let rewardHTML = "";
    if (!missed) {
        const isGift = Math.random() < 0.5; 
       if (isGift) {
     const weightedGifts = [];
     self.giftItems.forEach(item => {
    for (let i = 0; i < item.stock; i++) {
        weightedGifts.push(item);
    }
    });

    let randomGift = null;

    if (weightedGifts.length > 0) {
    randomGift = weightedGifts[Math.floor(Math.random() * weightedGifts.length)];
    } else {
    randomGift = self.giftItems[Math.floor(Math.random() * self.giftItems.length)];
}
    rewardHTML = `
        <div class="reward-box">
            <p class="gift-text">🎁 Sürpriz Hediye Kazandınız!</p>
            <img src="${randomGift.image}" class="gift-image" alt="Hediye">
            <p class="gift-name">${randomGift.name}</p>
        </div>`;
    }

        else {
            const discountCode = "KELEBEK20"; 
            rewardHTML = `
                <div class="reward-box">
                    <p class="gift-text">💸 İndirim Kodunuz:</p>
                    <p class="discount-text">
                        <span class="discount-code">${discountCode}</span>
                    </p>
                </div>`;
        }
    }

    const message = document.createElement("div");
    message.className = "end-message " + (missed ? "lose" : "win");
    message.innerHTML = `
        <div class="message-box">
            <h2>${missed ? "Üzgünüz!" : "Tebrikler!"}</h2>
            <p>${missed ? "Kelebekleri kaçırdınız." : "Tüm kelebekleri yakaladınız!"}</p>
            <p>Skorun: <strong>${self.score}</strong></p>
            ${rewardHTML}
            <button onclick="location.reload()">Yeniden Oyna</button>
        </div>
    `;

    document.body.appendChild(message);
}


};


window.addEventListener("DOMContentLoaded", function () {
    self.init();
});
