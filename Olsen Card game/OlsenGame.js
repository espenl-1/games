var cards;
var deck;
var discard;
var players;
var NUMSTARTCARDS = 6;
var NUMPLAYERS = 1;
var NUMAIPLAYERS = 1;
var cardDeckXCoords = [0,68,136,204,272,340,408,476,544,612,680];
var cardDeckYCoords = [0,96,192,288,384];
var cardValues = ["A","K","Q","J","0","9","8","7","6","5","4","3","2"];
var cardSuites = ["clubs","spades","diamonds","hearts"];
var cardWidth = 67;
var cardHeight = 95;
var playerOnTurn = 0; //WTF
var drawnCards = 0; //WTF

var cardBack = {
	x:544,
	y:384,
	id:"drawCard"
};
	
function OlsenGame() {
	cards = InitCards();
	deck = cards.slice(0);
	players = InitPlayers();
	DealCards();
	DealStartCard();
	Refresh();
}

function Refresh() {
	CheckDrawnCards();
	ClearAll();
	ShowCards();
	ShowDeck();
	ShowDiscard();
	CreateCardEvents();
}

function CheckDrawnCards() {
	if(drawnCards === 3) {
		$("#button").css("display","block");
	}
}

function ChangeTurn() {
	var totalPlayers = NUMPLAYERS + NUMAIPLAYERS;
	playerOnTurn++;
	drawnCards = 0;
	if(playerOnTurn === totalPlayers){
		playerOnTurn = 0;
	}
	ClearButton();
}

function ShowCards() {
	for(var i=0; i<players.length; i++) {
		for(var j=0; j<players[i].hand.length; j++) {
			var image = CreateCardImage(players[i].hand[j], j);
			$("#player" + i).append(image);
		}
	}
}

function ShowDeck() {
	var image = CreateCardImage(cardBack, 0);
	image.style.top = "47px";
	$("#playArea").append(image);
}

function ShowDiscard() {
	var image = CreateCardImage(discard[0], 2);
	image.style.top = "47px";
	$("#playArea").append(image);
}

function CreateCardImage(card, cardNr) {
	var cardImage = document.createElement("img");
	cardImage.id = "" + card.id;
	cardImage.style.position = "absolute";
	cardImage.style.width = cardWidth + "px";
	cardImage.style.height = cardHeight + "px";
	cardImage.style.left = cardNr * (cardWidth + 1) + "px";
	cardImage.style.top = "0px";
	cardImage.style.margin = "2px";
	cardImage.style.background = "url(CardDeck.png) " + (card.x * - 1) + "px " + (card.y * -1) + "px";
	cardImage.src = "1trans.png";
	return cardImage;
}

function CreateCardEvents() {
	var pCards = players[playerOnTurn].hand;
	for(var j=0; j<pCards.length; j++) {
		if(CardIsPlayable(pCards[j],playerOnTurn)){
			$("#" + pCards[j].id).click(function() {
				PlayCard(this.id);
			});
			$("#" + pCards[j].id).css("cursor","pointer");
		}
	}
	if(drawnCards < 3) {
		$("#drawCard").click(function() {
			DrawCard();
		});
		$("#drawCard").css("cursor","pointer");
	}
}

function CardIsPlayable(card,player) {
	var topCardSuite = discard[0].suite;
	var topCardValue = discard[0].value;
	var cardSuite = card.suite;
	var cardValue = card.value;
	if(cardValue === "8" && players[player].hand.length > 1){
		return true;
	}
	return cardValue === topCardValue || cardSuite === topCardSuite;
}

function InitCards() {

	var cards = [];
	var suite = 0;
	var cardValue = 0;
	for(var j=0; j<cardDeckYCoords.length; j++) {
		for(var k=0; k<cardDeckXCoords.length; k++) {
			cards.push(new Card(cardSuites[suite],cardValues[cardValue++],cardDeckXCoords[k],cardDeckYCoords[j],false));
			if(cardValue > 12) {
				cardValue = 0;
				suite++;
			}
			if(suite > 3) break;
		}
	}
	return cards;
}

function InitPlayers() {
	var players = [];
	for(var i=0; i<NUMPLAYERS; i++) {
		players.push(new Player(true));
	}
	for(var j=0; j<NUMAIPLAYERS; j++) {
		players.push(new Player(false));
	}
	return players;
}

function DealCards() {
	for(var i=0; i<NUMSTARTCARDS; i++) {
		for(var j=0; j<NUMPLAYERS + NUMAIPLAYERS; j++) {
			var card = GetRandomCard();
			players[j].DealCard(card);
		}
	}
}

function DrawCard() {
	drawnCards++;
	var card = GetRandomCard();
	players[playerOnTurn].hand.push(card);
	Refresh();
}

function DealStartCard() {
	discard = [];
	var startCard = GetRandomCard();
	startCard.SetUsed();
	discard.splice(0,0,startCard);
}

function Pass() {
	ChangeTurn();
	Refresh();
}

function GetRandomCard() {
	if(deck.length === 0) {
		RebuildDeck();
	}
	var rand = Math.floor(Math.random() * deck.length);
	var card = deck[rand];
	deck.splice(rand,1);
	return card;
}

function RebuildDeck() {
	for(var i=0; i<cards.length; i++) {
		if(cards[i].used === true) {
			deck.push(cards[i]);
			cards[i].used = false;
		}
	}
}

function PlayCard(id) {
	var cardPosition = FindCardPosition(id,players[playerOnTurn].hand);
	var card = players[playerOnTurn].hand[cardPosition];
	players[playerOnTurn].hand.splice(cardPosition,1);
	discard.splice(0,0,card);
	//HÆR E Æ hvis8
	ChangeTurn();
	Refresh();
}

function ClearAll() {
	ClearPlayerAreas();
	ClearPlayArea();
}
	
function ClearPlayerAreas() {
	for(var i=0; i<NUMPLAYERS + NUMAIPLAYERS; i++){
		$("#player" + i).empty();
	}
}

function ClearPlayArea() {
	$("#playArea").empty();
}

function ClearButton() {
	$("#button").css("display","none");
}

function Card(suite,value,x,y,used) {
	this.suite = suite;
	this.value = value;
	this.id = suite + value;
	this.x = x;
	this.y = y;
	this.used = used;
	this.SetUsed = function() {
		this.used = true;
	};
}

function FindCardPosition(id,cardsArray) {
	for(var i=0; i<cardsArray.length; i++) {
		if(cardsArray[i].id === id){
			return i;
		}
	}
	alert("FUCKED");
}

function Player() {
	this.hand = [];
	this.isHuman;
	this.DealCard = function(card) {
		this.hand.push(card);
	}
	this.UseCard = function(idString) {
		for(var i=0; i<hand.length; i++) {
			cardId = this.hand[i].suite + "" + this.hand[i].value;
			if(cardId === idString) {
				this.hand[i].splice(i,1);
				break;
			}
		}
	}
}
