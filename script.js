const sampler = new Tone.Sampler({
    urls: { "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", "A3": "A3.mp3" },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => { 
        document.getElementById('status').innerText = "HOLD STRINGS & STRUM"; 
        updateLevel(); 
    }
}).toDestination();

let heldStrings = new Set();
let level = 0;

const CHORDS = [
    { name: "C MAJOR", req: [{s: 1, p: 55}, {s: 2, p: 40}, {s: 4, p: 25}], notes: ["C3", "E3", "G3", "C4", "E4"], img: "https://i.ibb.co/ZygtKBC/New-Project-44-2-B77463.jpg" },
    { name: "A MAJOR", req: [{s: 2, p: 40}, {s: 3, p: 40}, {s: 4, p: 40}], notes: ["A2", "E3", "A3", "C#4", "E4"], img: "https://i.ibb.co/HDDzr7tp/New-Project-44-0-CDA66-B.jpg" },
    { name: "G MAJOR", req: [{s: 0, p: 55}, {s: 1, p: 40}, {s: 5, p: 55}], notes: ["G2", "B2", "D3", "G3", "D4", "G4"], img: "https://i.ibb.co/7ttmzH51/New-Project-44-2-CD2-E03.jpg" },
    { name: "E MAJOR", req: [{s: 1, p: 40}, {s: 2, p: 40}, {s: 3, p: 25}], notes: ["E2", "B2", "E3", "G#3", "B3", "E4"], img: "https://i.ibb.co/7wmj00n/New-Project-44-4919309.jpg" },
    { name: "D MAJOR", req: [{s: 3, p: 40}, {s: 4, p: 55}, {s: 5, p: 40}], notes: ["D3", "A3", "D4", "F#4"], img: "https://i.ibb.co/ZpTh4nZW/New-Project-44-7494-A5-A.jpg" },
    { name: "A MINOR", req: [{s: 2, p: 40}, {s: 3, p: 40}, {s: 4, p: 25}], notes: ["A2", "E3", "A3", "C4", "E4"], img: "https://i.ibb.co/7dtjgNPx/New-Project-44-1-E3-AEED.jpg" },
    { name: "E MINOR", req: [{s: 1, p: 40}, {s: 2, p: 40}], notes: ["E2", "B2", "E3", "G3", "B3", "E4"], img: "https://i.ibb.co/pBPvB8B6/New-Project-44-B106426.jpg" },
    { name: "D MINOR", req: [{s: 3, p: 40}, {s: 4, p: 55}, {s: 5, p: 25}], notes: ["D3", "A3", "D4", "F4"], img: "https://i.ibb.co/Wpcbb5Xh/New-Project-44-39-EC5-F9.jpg" },
    { name: "F MAJOR", req: [{s: 3, p: 55}, {s: 4, p: 40}, {s: 5, p: 25}], notes: ["F3", "A3", "C4", "F4"], img: "https://i.ibb.co/ZzVhP42k/New-Project-44-6-AED804.jpg" },
    { name: "E5 POWER", req: [{s: 0, p: 0}, {s: 1, p: 40}, {s: 2, p: 40}], notes: ["E2", "B2", "E3"], img: "https://i.ibb.co/twQgyRRc/New-Project-44-B154-E2-B-2.jpg" }
];

const board = document.getElementById('fretboard');
const stringElements = [];
const names = ["E", "A", "D", "G", "B", "E"];

// Generate Fretboard Strings
for(let i=0; i<6; i++) {
    const strContainer = document.createElement('div');
    strContainer.className = 'string';
    strContainer.innerHTML = `<span class="string-name">${names[i]}</span><div class="string-wire"></div><span class="string-name">${names[i]}</span>`;
    
    const handleStart = (e) => {
        e.preventDefault();
        heldStrings.add(i);
        checkFingering();
    };
    const handleEnd = () => {
        heldStrings.delete(i);
        checkFingering();
    };

    strContainer.addEventListener('touchstart', handleStart);
    strContainer.addEventListener('touchend', handleEnd);
    strContainer.addEventListener('mousedown', handleStart);
    strContainer.addEventListener('mouseup', handleEnd);
    strContainer.addEventListener('mouseleave', handleEnd);
    
    board.appendChild(strContainer);
    stringElements.push(strContainer);
}

function checkFingering() {
    stringElements.forEach((el, idx) => {
        const guide = el.querySelector('.finger-guide');
        if (guide) {
            heldStrings.has(idx) ? guide.classList.add('correct') : guide.classList.remove('correct');
        }
    });
}

function skipChord() {
    level = (level + 1) % CHORDS.length;
    updateLevel();
}

function updateLevel() {
    const current = CHORDS[level];
    document.getElementById('chord-name').innerText = current.name;
    document.getElementById('chord-img').src = current.img;
    
    document.querySelectorAll('.finger-guide').forEach(g => g.remove());
    
    current.req.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = 'finger-guide';
        dot.style.top = pos.p + "%";
        stringElements[pos.s].appendChild(dot);
    });
    checkFingering();
}

const playStrum = async (e) => {
    e.preventDefault();
    await Tone.start();
    const current = CHORDS[level];
    const isCorrect = current.req.every(r => heldStrings.has(r.s));

    if (isCorrect) {
        current.notes.forEach((n, i) => {
            sampler.triggerAttackRelease(n, "1n", Tone.now() + (i * 0.04));
        });
        document.getElementById('status').innerText = "EXCELLENT!";
        level = (level + 1) % CHORDS.length;
        setTimeout(updateLevel, 500);
    } else {
        sampler.triggerAttackRelease("E2", "16n");
        document.getElementById('status').innerText = "MISS! CHECK FINGERS";
        setTimeout(() => { document.getElementById('status').innerText = "HOLD STRINGS & STRUM"; }, 1000);
    }
};

const strumPad = document.getElementById('strum-pad');
strumPad.addEventListener('touchstart', playStrum);
strumPad.addEventListener('mousedown', playStrum);
