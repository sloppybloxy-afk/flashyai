// View Management
function switchView(viewId) {
    // Hide all views
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('decksView').style.display = 'none';
    document.getElementById('aiGenerateView').style.display = 'none';

    // Show selected view
    document.getElementById(viewId).style.display = 'block';

    // Scroll to top
    window.scrollTo(0, 0);
}

// Deck Management
let decks = JSON.parse(localStorage.getItem('flashyDecks')) || [];

function showCreateDeckForm() {
    const deckName = prompt('Enter deck name:');
    if (deckName && deckName.trim()) {
        const newDeck = {
            id: Date.now(),
            name: deckName.trim(),
            cards: [],
            createdAt: new Date().toISOString(),
            dueToday: 0,
            mastered: 0,
            streak: 0
        };
        decks.push(newDeck);
        saveDecks();
        renderDecks();
        updateDeckDropdown();
    }
}

function renderDecks() {
    const deckList = document.getElementById('deckList');
    
    if (decks.length === 0) {
        deckList.innerHTML = `
            <div class="empty-state">
                <div class="empty-image">😴📦</div>
                <h3>No decks yet</h3>
                <p>Start by creating a deck, then add cards manually or have AI generate them for you.</p>
            </div>
        `;
        return;
    }

    deckList.innerHTML = decks.map(deck => `
        <div class="deck-card">
            <h3>${deck.name}</h3>
            <p style="color: #666; margin: 8px 0;">${deck.cards.length} cards</p>
            <div style="display: flex; gap: 8px; margin-top: 12px; font-size: 12px;">
                <span>📝 ${deck.cards.length}</span>
                <span>🔥 ${deck.streak}</span>
            </div>
        </div>
    `).join('');
}

function updateDeckDropdown() {
    const dropdown = document.getElementById('targetDeck');
    if (decks.length === 0) {
        dropdown.innerHTML = '<option>Create a deck first</option>';
    } else {
        dropdown.innerHTML = decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('');
    }
}

function saveDecks() {
    localStorage.setItem('flashyDecks', JSON.stringify(decks));
}

// Generate Cards (Mock)
function generateCards() {
    const deckId = document.getElementById('targetDeck').value;
    const topicText = document.getElementById('topicText').value;
    const cardCount = document.getElementById('cardCount').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!topicText.trim()) {
        alert('Please enter a topic or source text');
        return;
    }

    if (deckId === '') {
        alert('Please create a deck first');
        return;
    }

    // Mock card generation
    const deckIndex = decks.findIndex(d => d.id == deckId);
    const count = parseInt(cardCount);

    const mockCards = Array.from({length: count}, (_, i) => ({
        id: Date.now() + i,
        front: `${topicText.split(':')[0]} - Question ${i + 1}`,
        back: `This is a generated answer based on ${difficulty} difficulty level`,
        difficulty: difficulty,
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date().toISOString()
    }));

    decks[deckIndex].cards.push(...mockCards);
    decks[deckIndex].totalCards = decks[deckIndex].cards.length;
    saveDecks();
    
    alert(`✨ Generated ${count} cards! Cards added to "${decks[deckIndex].name}"`);
    
    document.getElementById('topicText').value = '';
    switchView('decksView');
    renderDecks();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderDecks();
    updateDeckDropdown();

    // Logo click to home
    document.querySelector('.logo').addEventListener('click', function() {
        switchView('homeView');
    });
});
