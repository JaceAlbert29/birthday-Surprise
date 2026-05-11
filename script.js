const homeScreen = document.getElementById("homeScreen");
const radarScreen = document.getElementById("radarScreen");
const galleryScreen = document.getElementById("galleryScreen");
const videoScreen = document.getElementById("videoScreen");
const radarText = document.getElementById("radarText");
const galleryPhoto = document.getElementById("galleryPhoto");
const bossPhoto = document.querySelector(".boss-photo img");
const fallingShips = document.querySelector(".falling-ships");
const musicBtn = document.getElementById("musicBtn");
const birthdayMusic = document.getElementById("birthdayMusic");
const videoGrid = document.getElementById("videoGrid");

const photoExtensions = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
const photoCandidates = Array.from({ length: 30 }, (_, index) => index + 1);

const videoCandidates = [
    {
        src: "video1.mp4",
        title: "Birthday Greeting Clip"
    }
];

let photos = [{ src: "photo1.jpg", isPortrait: true, index: 0 }];
let currentPhoto = 0;
let slideshowTimer;
let radarTimers = [];
let voyageStarted = false;

function startVoyage() {
    currentPhoto = 0;
    voyageStarted = true;
    stopPhotoSlideshow();
    showRadarVoyage();
    startBackgroundMusic();
}

function showRadarVoyage() {
    radarTimers.forEach((timer) => window.clearTimeout(timer));
    radarTimers = [];

    homeScreen.classList.add("hidden");
    videoScreen.classList.add("hidden");
    galleryScreen.classList.add("hidden");
    radarScreen.classList.remove("hidden");
    radarText.textContent = "Scanning shipyard coordinates...";

    radarTimers.push(window.setTimeout(() => {
        radarText.textContent = "Signal detected near Executive Deck...";
    }, 1400));

    radarTimers.push(window.setTimeout(() => {
        radarText.textContent = "Captain located successfully!";
    }, 2800));

    radarTimers.push(window.setTimeout(() => {
        showPhotos(true);
    }, 4000));
}

function showPhotos(autoplay = true) {
    homeScreen.classList.add("hidden");
    videoScreen.classList.add("hidden");
    radarScreen.classList.add("hidden");
    galleryScreen.classList.remove("hidden");
    changePhoto();

    if (autoplay) {
        startPhotoSlideshow();
    }
}

function showVideos() {
    stopPhotoSlideshow();
    radarTimers.forEach((timer) => window.clearTimeout(timer));
    radarTimers = [];
    buildVideoGallery();
    homeScreen.classList.add("hidden");
    galleryScreen.classList.add("hidden");
    radarScreen.classList.add("hidden");
    videoScreen.classList.remove("hidden");
}

function backHome() {
    stopPhotoSlideshow();
    radarTimers.forEach((timer) => window.clearTimeout(timer));
    radarTimers = [];
    stopBackgroundMusic(true);
    voyageStarted = false;
    galleryScreen.classList.add("hidden");
    videoScreen.classList.add("hidden");
    radarScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
}

function nextPhoto() {
    currentPhoto = (currentPhoto + 1) % photos.length;
    changePhoto();
}

function prevPhoto() {
    currentPhoto = (currentPhoto - 1 + photos.length) % photos.length;
    changePhoto();
}

function changePhoto() {
    if (!photos.length) {
        return;
    }

    const nextPhotoItem = photos[currentPhoto];

    galleryPhoto.classList.remove("slide-enter");
    galleryPhoto.classList.add("photo-fading");

    window.setTimeout(() => {
        galleryPhoto.classList.remove("is-missing");
        galleryPhoto.classList.toggle("portrait-photo", nextPhotoItem.isPortrait);
        galleryPhoto.src = nextPhotoItem.src;
        galleryPhoto.classList.remove("photo-fading");
        void galleryPhoto.offsetWidth;
        galleryPhoto.classList.add("slide-enter");
    }, 320);
}

function startPhotoSlideshow() {
    stopPhotoSlideshow();

    let slidesShown = 1;

    slideshowTimer = window.setInterval(() => {
        if (slidesShown >= photos.length) {
            showVideos();
            return;
        }

        currentPhoto += 1;
        changePhoto();
        slidesShown += 1;
    }, 3200);
}

function stopPhotoSlideshow() {
    window.clearInterval(slideshowTimer);
    slideshowTimer = undefined;
}

function loadPhotoCandidate(index) {
    return new Promise((resolve) => {
        let extensionIndex = 0;

        function tryNextExtension() {
            if (extensionIndex >= photoExtensions.length) {
                resolve(null);
                return;
            }

            const src = `photo${index}.${photoExtensions[extensionIndex]}`;
            const image = new Image();

            extensionIndex += 1;
            image.onload = () => {
                resolve({
                    src,
                    isPortrait: image.naturalHeight > image.naturalWidth,
                    index
                });
            };
            image.onerror = tryNextExtension;
            image.src = src;
        }

        tryNextExtension();
    });
}

function loadAvailablePhotos() {
    Promise.all(photoCandidates.map(loadPhotoCandidate)).then((results) => {
        const availablePhotos = results
            .filter(Boolean)
            .sort((a, b) => a.index - b.index);

        if (!availablePhotos.length) {
            return;
        }

        photos = availablePhotos;
        currentPhoto = 0;
        bossPhoto.classList.remove("is-missing");
        bossPhoto.src = photos[0].src;
        galleryPhoto.classList.toggle("portrait-photo", photos[0].isPortrait);
        galleryPhoto.src = photos[0].src;
    });
}

function buildVideoGallery() {
    videoGrid.innerHTML = "";

    videoCandidates.forEach((videoItem) => {
        const card = document.createElement("div");
        const video = document.createElement("video");
        const label = document.createElement("p");

        card.className = "video-card";
        video.src = videoItem.src;
        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        label.textContent = videoItem.title;

        card.append(video, label);
        videoGrid.appendChild(card);
    });
}

function markMissingImage(image) {
    image.classList.add("is-missing");
    image.alt = "Photo placeholder";
}

function prepareMediaFallbacks() {
    document.querySelectorAll("img[data-fallback='true']").forEach((image) => {
        image.addEventListener("error", () => markMissingImage(image), { once: false });

        if (image.complete && image.naturalWidth === 0) {
            markMissingImage(image);
        }
    });
}

function createFallingShip() {
    const ship = document.createElement("div");
    const shipIcons = [
        String.fromCharCode(9875),
        String.fromCharCode(9973),
        String.fromCharCode(9881)
    ];

    ship.className = "ship";
    ship.textContent = shipIcons[Math.floor(Math.random() * shipIcons.length)];
    ship.style.left = Math.random() * 100 + "vw";
    ship.style.animationDuration = Math.random() * 5 + 7 + "s";
    ship.style.fontSize = Math.random() * 13 + 18 + "px";

    fallingShips.appendChild(ship);

    window.setTimeout(() => {
        ship.remove();
    }, 12000);
}

function startBackgroundMusic() {
    if (musicBtn.classList.contains("is-on")) {
        return;
    }

    musicBtn.classList.add("is-on");
    birthdayMusic.volume = .72;
    birthdayMusic.play().catch(() => {
        musicBtn.classList.remove("is-on");
        musicBtn.setAttribute("aria-label", "Start background music");
    });
    musicBtn.setAttribute("aria-label", "Stop background music");
}

function stopBackgroundMusic(reset = false) {
    musicBtn.classList.remove("is-on");
    birthdayMusic.pause();

    if (reset) {
        birthdayMusic.currentTime = 0;
    }

    musicBtn.setAttribute("aria-label", voyageStarted ? "Resume background music" : "Music starts with voyage");
}

function toggleMusic() {
    if (!voyageStarted) {
        musicBtn.setAttribute("aria-label", "Music starts with voyage");
        musicBtn.classList.add("is-locked");

        window.setTimeout(() => {
            musicBtn.classList.remove("is-locked");
        }, 650);

        return;
    }

    if (musicBtn.classList.contains("is-on")) {
        stopBackgroundMusic();
    } else {
        startBackgroundMusic();
    }
}

musicBtn.addEventListener("click", toggleMusic);
loadAvailablePhotos();
buildVideoGallery();
prepareMediaFallbacks();
window.setInterval(createFallingShip, 900);
