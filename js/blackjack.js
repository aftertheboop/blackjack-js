var Blackjack = {
    deck: [],                   // Holds the deck once it has been built and shuffled
    rounds: 1,                  // Tracks the number of rounds played
    stayCount: 0,               // Tracks the number of stays and ends game after 4 
    player: {                   // Player object
        name: 'you',            // Player name
        cards: [],              // Player's current hand
        total: 0,               // Base total of player's cards
        aceTotal: 0,            // Alt. total of player's cards if an Ace is present
        wins: 0,                 // Total number of wins
        state: 0                // Player's state. 0 = open, 1 = bust, 2 = blackjack
    },
    opponent: {                 // Opponent object is very similar to player
        name: 'the computer',
        cards: [],
        total: 0,
        aceTotal: 0,
        wins: 0,
        state: 0
    },
    /**
     * Start Game
     * Resets the game, shuffles a new deck and draws opening hands
     */
    startGame: function() {
        
        var self = this;
        
        self.newDeck();

        self.startHand('player');
        self.startHand('opponent');

        self.render();
    },
    /**
     * Render
     * 
     * Render is called after every player action and is the trigger
     * for the opponent AI
     */
    render: function() {

        var self = this;
        // Disables player input
        $('button').attr('disabled', 'disabled');
        // Updates the HTML view
        $('#round span').html(self.rounds);
        $('#cards ul').html('');

        var cardHtml = '';
        $.each(self['player'].cards, function(idx, card) {
            cardHtml += '<li>' + card.number + ' of ' + card.suit + '</li>';
        });

        $('#cards ul').html(cardHtml);
        // Determines whether to show a single total or an alt. Ace total too
        if (self['player'].total == self['player'].aceTotal) {
            $('#total span').html(self['player'].total)
        } else {
            $('#total span').html(self['player'].total + '/' + self['player'].aceTotal);
        }

        // Allows your opponent to take a turn
        if (self.rounds > 1) {
            // Opponent's turn
            self.opponentTurn();
        }
        
        self.isGameOver();
        
        if(self.stayCount >= 4) {
            self.staleMate();
        }

        // Increment rounds
        self.rounds++;
        
        // Allow player input again
        $('button').removeAttr('disabled');
    },
    opponentTurn: function() {
        /**
         * Very simple right now.
         * I want to add in logic whereby the opponent keeps track of all dealt
         * cards and guesses the probability of a safe hit versus going bust.
         * I don't want this to resort to reading the deck, but rather guessing
         * by "card counting" as it were
         */

        var self = this;
        // Opponent is not bust
        if (self.opponent.total <= 21) {

            if (self.opponent.total < 16) {
                self.hit('opponent');
            } else {
                self.stay('opponent');
            }

        } else {
            // Opponent is bust
            self.stay('opponent');
        }


    },
    /**
     * Draws the starting hand for the player in question
     * @param String player
     * @return void
     */
    startHand: function(player) {

        var self = this;

        for (var i = 0; i <= 1; i++) {
            self[player].cards.push(self.drawCard());
        }

        self.handValue(player);
    },
    /**
     * Hand Value
     * Calculates the current hand value for the player in question
     * @param String player
     * @returns String
     */
    handValue: function(player) {

        var self = this,
            total = 0,
            aceTotal = 0;

        $.each(self[player].cards, function(idx, card) {

            if (card.number == 1) {

                total += 1;
                aceTotal += 11;

            } else {

                total += card.number;
                aceTotal += card.number;

            }

        });

        self[player].total = total;
        self[player].aceTotal = aceTotal;

        if (total == aceTotal) {
            return total.toString();
        } else {
            return total + ' / ' + aceTotal;
        }
    },
    /**
     * Hit
     * The player draws a card for their hand. Hand value is recalculated
     * @param String player
     * @returns void
     */
    hit: function(player) {

        var self = this,
            card = self.drawCard();

        self[player].cards.push(card);

        self.handValue(player);

        if (player == 'player') {
            self.render();
        }
        
        self.stayCount = 0;
    },
    /**
     * Stay
     * The player does not draw a card. Hand value is recalculated
     * @param String player
     * @returns void
     */
    stay: function(player) {

        var self = this;
        
        self.handValue(player);

        if (player == 'player') {
            self.render();
        }
        
        self.stayCount++;
    },
    /**
     * Is Game Over
     * 
     * Checks after each player action whether a player has blackjack or 
     * is bust. On true, triggers an endgame state
     * @returns void
     */
    isGameOver: function () {
        
        var self = this,
            players = ['player', 'opponent'];
        
        // Update all player states
        $.each(players, function (idx, player) {
            if(self[player].total !== self[player].aceTotal) {
                // Handle Aces in the hand

                if(self[player].aceTotal > 21 && self[player].total > 21) {
                    // Player is bust
                    self[player].state = 1;
                }

                if(self[player].aceTotal > 21 && self[player].total < 21) {
                    // Player is not yet bust
                    self[player].state = 0;
                }

                if(self[player].aceTotal === 21 || self[player].total === 21) {
                    // Player has blackjack
                    self[player].state = 2;
                }

            } else {
                // Handle without aces
                if(self[player].total > 21) {
                    // Player is bust
                    self[player].state = 1;
                }

                if(self[player].total === 21) {
                    // Player has blackjack
                    self[player].state == 2;
                }

                if(self[player].total < 21) {
                    // Player is not bust
                    self[player].state = 0;
                }
            }            
        });
        
        $.each(players, function (idx, player) {
            if(self[player].state !== 0) {
                console.log(self.player, self.opponent);
                console.log(player + ' loses');
            }
        })
    },
    /**
     * Stalemate
     * 
     * Is triggered after four stays. Determines the winner based on distance 
     * to 21
     */
    staleMate: function () {
        
        var self = this,
            goal = 21,
            playerDiff = goal - self.player.total,
            opponentDiff = goal - self.opponent.total;
    
        if(playerDiff < opponentDiff) {
            console.log('opponent loses');
        } else {
            console.log('player loses');
        }        
    },
    /**
     * New Deck
     * Creates a new deck of 52 cards and shuffles them
     * @returns void
     */
    newDeck: function() {

        var suits = ['diamonds', 'clubs', 'hearts', 'spades'],
            self = this;

        // Recursive shuffle from http://stackoverflow.com/a/22654548
        // Will write my own once everything else is working
        function shuffle(a, b) {
            return a.length == 0 ? b : function(c) {
                return shuffle(a, (b || []).concat(c));
            }(a.splice(Math.floor(Math.random() * a.length), 1));
        };

        $.each(suits, function(idx, val) {

            for (var i = 1; i <= 13; i++) {
                var card = {
                    suit: val,
                    number: i
                };

                self.deck.push(card);
            }
        });

        self.deck = shuffle(self.deck);

    },
    /**
     * Draw Card
     * 
     * Draws a new card by popping it off the shuffled deck
     * @returns Object
     */
    drawCard: function() {

        var self = this;

        if (self.deck.length <= 0) {
            self.gameOver();
        } else {
            return self.deck.pop();
        }

    },
    /**
     * Game Over state
     * @returns boolean
     */
    gameOver: function() {
        console.log('Game Over');
        return false;
    }
}