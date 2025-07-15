const button = document.getElementById('playButton');
const statusIndicator = document.getElementById('statusIndicator');
const userCount = document.querySelector('.usercount');

function updateStatus(message, color = '#666') {
    statusIndicator.textContent = message;
    statusIndicator.style.color = color;
}

// Initialize socket connection
const socket = io();

// Setup socket listeners
socket.on('connect', () => {
    updateStatus("Connected", "#00ffff");
});

socket.on('disconnect', (reason) => {
    updateStatus(`Disconnected: ${reason}`, "red");
});

socket.on('reconnect', (attemptNumber) => {
    updateStatus(`Reconnected (attempt ${attemptNumber})`, "#00ffff");
});

socket.on('audioMessage', (audioChunks) => {
    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
});

socket.on('user', (count) => {
    userCount.textContent = count;
});

// Microphone handling
if (button && statusIndicator) {
    updateStatus("Requesting microphone access...");

    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
            updateStatus("Ready to talk 👇", "#00ffff");

            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.addEventListener("start", () => {
                button.classList.add("recording");
            });

            mediaRecorder.addEventListener("stop", () => {
                button.classList.remove("recording");
                socket.emit('audioMessage', audioChunks);
                audioChunks = [];
            });

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            // Handle button events
            const toggleRecording = () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    button.classList.remove("paused");
                } else {
                    mediaRecorder.start();
                    button.classList.add("paused");
                }
            };

            button.addEventListener('mousedown', toggleRecording);
            button.addEventListener('touchstart', toggleRecording);
            button.addEventListener('mouseup', toggleRecording);
            button.addEventListener('mouseleave', toggleRecording);
            button.addEventListener('touchend', toggleRecording);
        })
        .catch(err => {
            updateStatus("Microphone access blocked", "red");
            console.error("Microphone error:", err);
        });
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.log('Service Worker registered', registration);
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}
