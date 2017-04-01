var Blackjack = {
    deck: [],
    rounds: 1,
    player: {
        name: 'you',
        cards: [],
        total: 0,
        aceTotal: 0,
        wins: 0
    },
    opponent: {
        name: 'the computer',
        cards: [],
        total: 0,
        aceTotal: 0,
        wins: 0
    },
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
     * for the opponent AI                 * 
     */
    render: function() {

        var self = this;

        $('button').attr('disabled', 'disabled');
        $('#round span').html(self.rounds);
        $('#cards ul').html('');

        var cardHtml = '';
        $.each(self['player'].cards, function(idx, card) {
            cardHtml += '<li>' + card.number + ' of ' + card.suit + '</li>';
        });

        $('#cards ul').html(cardHtml);

        if (self['player'].total == self['player'].aceTotal) {
            $('#total span').html(self['player'].total)
        } else {
            $('#total span').html(self['player'].total + '/' + self['player'].aceTotal);
        }

        if (self.rounds > 1) {
            // Opponent's turn
            self.opponentTurn();
        }

        self.rounds++;

        $('button').removeAttr('disabled');

        console.log(self.player);
        console.log(self.opponent);

    },
    opponentTurn: function() {

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
    startHand: function(player) {

        var self = this;

        for (var i = 0; i <= 1; i++) {
            self[player].cards.push(self.drawCard());
        }

        self.handValue(player);
    },
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
            return total;
        } else {
            return total + ' / ' + aceTotal;
        }
    },
    hit: function(player) {

        var self = this,
            card = self.drawCard();

        self[player].cards.push(card);

        self.handValue(player);

        if (player == 'player') {
            self.render();
        }
    },
    stay: function(player) {

        var self = this;

        if (player == 'player') {
            self.render();
        }

        return false;

    },
    newDeck: function() {

        var suits = ['diamonds', 'clubs', 'hearts', 'spades'],
            self = this;

        // Recursive shuffle from http://stackoverflow.com/a/22654548
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
    drawCard: function() {

        var self = this;

        if (self.deck.length <= 0) {
            self.gameOver();
        } else {
            return self.deck.pop();
        }

    },
    gameOver: function() {
        console.log('Game Over');
        return false;
    }
}