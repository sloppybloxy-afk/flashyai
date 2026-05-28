// View Management
function switchView(viewId) {
    // Hide all views
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('decksView').style.display = 'none';
    document.getElementById('aiGenerateView').style.display = 'none';
    document.getElementById('studyView').style.display = 'none';

    // Show selected view
    document.getElementById(viewId).style.display = 'block';

    // Scroll to top
    window.scrollTo(0, 0);
}

// Modal Management
function toggleSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    if (modal.style.display === 'block') {
        document.getElementById('searchInput').focus();
    }
}

function toggleStatsModal() {
    const modal = document.getElementById('statsModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    if (modal.style.display === 'block') {
        updateStatsModal();
    }
}

function toggleSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const searchModal = document.getElementById('searchModal');
    const statsModal = document.getElementById('statsModal');
    const settingsModal = document.getElementById('settingsModal');
    
    if (event.target === searchModal) searchModal.style.display = 'none';
    if (event.target === statsModal) statsModal.style.display = 'none';
    if (event.target === settingsModal) settingsModal.style.display = 'none';
});

// Search functionality
function searchDecks() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (!input.trim()) {
        results.innerHTML = '';
        return;
    }
    
    const filtered = decks.filter(deck => deck.name.toLowerCase().includes(input));
    
    if (filtered.length === 0) {
        results.innerHTML = '<p style="color: #666;">No decks found</p>';
    } else {
        results.innerHTML = filtered.map(deck => `
            <div class="search-result-item" onclick="selectSearchDeck(${deck.id})">
                <h4>${deck.name}</h4>
                <p>${deck.cards.length} cards</p>
            </div>
        `).join('');
    }
}

function selectSearchDeck(deckId) {
    toggleSearchModal();
    switchView('decksView');
}

// Stats Modal Update
function updateStatsModal() {
    const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    const masteredCards = decks.reduce((sum, deck) => sum + (deck.mastered || 0), 0);
    const totalStreak = decks.reduce((max, deck) => Math.max(max, deck.streak || 0), 0);
    
    document.getElementById('totalDecksCount').textContent = decks.length;
    document.getElementById('totalCardsCount').textContent = totalCards;
    document.getElementById('masteredCount').textContent = masteredCards;
    document.getElementById('streakCount').textContent = totalStreak;
}

// Settings
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
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
        alert('✅ Deck "' + deckName.trim() + '" created!');
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
                <span>🔥 ${deck.streak || 0}</span>
            </div>
            <div class="deck-card-actions">
                <button onclick="startStudy(${deck.id})">📖 Study</button>
                <button onclick="editDeck(${deck.id})">✏️ Edit</button>
                <button onclick="deleteDeck(${deck.id})">🗑️ Delete</button>
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

function deleteDeck(deckId) {
    if (confirm('⚠️ Are you sure you want to delete this deck? This cannot be undone.')) {
        decks = decks.filter(d => d.id !== deckId);
        saveDecks();
        renderDecks();
        updateDeckDropdown();
        alert('✅ Deck deleted');
    }
}

// Edit Deck - Add/Remove Cards
function editDeck(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    switchView('decksView');
    
    // Create edit interface
    const mainContent = document.querySelector('.main-content');
    const existingForm = mainContent.querySelector('.add-card-form');
    if (existingForm) existingForm.remove();
    
    const form = document.createElement('div');
    form.className = 'add-card-form';
    form.innerHTML = `
        <h3>📝 Edit "${deck.name}" - Add Cards</h3>
        <div class="add-card-input">
            <input type="text" id="cardFront" placeholder="Front (Question)" maxlength="500">
            <textarea id="cardBack" placeholder="Back (Answer)" rows="3"></textarea>
        </div>
        <div class="add-card-buttons">
            <button class="btn btn-primary" onclick="addCardToDeck(${deckId})">➕ Add Card</button>
            <button class="btn btn-secondary" onclick="closeEditForm()">Done</button>
        </div>
        <div id="cardsList" style="margin-top: 24px;">
            ${renderDeckCards(deck)}
        </div>
    `;
    
    const deckViewSection = document.getElementById('decksView');
    deckViewSection.appendChild(form);
}

function renderDeckCards(deck) {
    if (deck.cards.length === 0) {
        return '<p style="color: #666; text-align: center;">No cards yet. Add one above!</p>';
    }
    
    return `
        <h4 style="margin-bottom: 12px;">Cards in this deck (${deck.cards.length}):</h4>
        ${deck.cards.map((card, idx) => `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 8px; background-color: rgba(255, 214, 0, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <p style="font-weight: 600; margin-bottom: 4px;">Q: ${card.front}</p>
                        <p style="color: #666; font-size: 14px;">A: ${card.back}</p>
                    </div>
                    <button class="btn btn-secondary" onclick="removeCardFromDeck(${deck.id}, ${idx})" style="padding: 4px 8px; font-size: 12px; white-space: nowrap; margin-left: 8px;">Remove</button>
                </div>
            </div>
        `).join('')}
    `;
}

function addCardToDeck(deckId) {
    const front = document.getElementById('cardFront').value.trim();
    const back = document.getElementById('cardBack').value.trim();
    
    if (!front || !back) {
        alert('Please fill in both the question and answer.');
        return;
    }
    
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const newCard = {
        id: Date.now(),
        front: front,
        back: back,
        difficulty: 'Intermediate',
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date().toISOString()
    };
    
    deck.cards.push(newCard);
    saveDecks();
    renderDecks();
    
    // Update the form display
    document.getElementById('cardFront').value = '';
    document.getElementById('cardBack').value = '';
    document.getElementById('cardsList').innerHTML = renderDeckCards(deck);
    document.getElementById('cardFront').focus();
    
    alert('✅ Card added!');
}

function removeCardFromDeck(deckId, cardIndex) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    if (confirm('Remove this card?')) {
        deck.cards.splice(cardIndex, 1);
        saveDecks();
        renderDecks();
        document.getElementById('cardsList').innerHTML = renderDeckCards(deck);
    }
}

function closeEditForm() {
    const form = document.querySelector('.add-card-form');
    if (form) form.remove();
}

// Study Mode
let currentStudyDeck = null;
let currentStudyCardIndex = 0;
let isStudyCardFlipped = false;

function startStudy(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    if (deck.cards.length === 0) {
        alert('❌ No cards in this deck yet. Add cards first!');
        return;
    }
    
    currentStudyDeck = deck;
    currentStudyCardIndex = 0;
    isStudyCardFlipped = false;
    
    switchView('studyView');
    document.getElementById('studyDeckName').textContent = `Study: ${deck.name}`;
    
    displayStudyCard();
}

function displayStudyCard() {
    if (!currentStudyDeck || currentStudyCardIndex >= currentStudyDeck.cards.length) {
        finishStudy();
        return;
    }
    
    const card = currentStudyDeck.cards[currentStudyCardIndex];
    isStudyCardFlipped = false;
    
    document.getElementById('studyCardLabel').textContent = 'Front';
    document.getElementById('studyCardContent').textContent = card.front;
    document.getElementById('studyCardIndex').textContent = currentStudyCardIndex + 1;
    document.getElementById('studyCardTotal').textContent = currentStudyDeck.cards.length;
    
    const progress = ((currentStudyCardIndex) / currentStudyDeck.cards.length) * 100;
    document.getElementById('studyProgressBar').style.width = progress + '%';
}

function flipStudyCard() {
    if (!currentStudyDeck) return;
    
    const card = currentStudyDeck.cards[currentStudyCardIndex];
    isStudyCardFlipped = !isStudyCardFlipped;
    
    if (isStudyCardFlipped) {
        document.getElementById('studyCardLabel').textContent = 'Back';
        document.getElementById('studyCardContent').textContent = card.back;
    } else {
        document.getElementById('studyCardLabel').textContent = 'Front';
        document.getElementById('studyCardContent').textContent = card.front;
    }
}

function answerStudyCard(response) {
    // Simple spaced repetition logic
    const card = currentStudyDeck.cards[currentStudyCardIndex];
    
    switch(response) {
        case 'again':
            card.interval = 1;
            card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
            break;
        case 'hard':
            card.interval = Math.ceil(card.interval * 1.2);
            card.easeFactor = Math.max(1.3, card.easeFactor - 0.1);
            break;
        case 'good':
            card.interval = Math.ceil(card.interval * card.easeFactor);
            break;
        case 'easy':
            card.interval = Math.ceil(card.interval * card.easeFactor * 1.3);
            card.easeFactor = card.easeFactor + 0.15;
            break;
    }
    
    card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000).toISOString();
    
    saveDecks();
    currentStudyCardIndex++;
    displayStudyCard();
}

function finishStudy() {
    const message = `🎉 Great job! You've studied all ${currentStudyDeck.cards.length} cards in "${currentStudyDeck.name}".`;
    alert(message);
    exitStudy();
}

function exitStudy() {
    currentStudyDeck = null;
    currentStudyCardIndex = 0;
    switchView('homeView');
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
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
