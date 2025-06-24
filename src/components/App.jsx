import "../styles/App.css";
import { useState, useEffect } from "react";

function App() {
	const [cards, setCards] = useState(null);
	const [level, setLevel] = useState(null);

	const numberOfCards =
		level === "Easy"
			? 10
			: level === "Medium"
			? 20
			: level === "Hard"
			? 30
			: 100;

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			try {
				const res = await fetch(
					"https://ddragon.leagueoflegends.com/cdn/15.12.1/data/en_US/champion.json",
					{ mode: "cors", signal: controller.signal }
				);
				const json = await res.json();
				console.log(json);

				let cards = [];
				for (const [key, value] of Object.entries(json.data)) {
					cards.push({
						id: value.id,
						name: value.name,
						title: value.title,
						img: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${key}_0.jpg`,
					});
				}
				setCards(cards);
			} catch (err) {
				if (err.name === "AbortError") {
					console.log("Fetch aborted");
				} else {
					console.error("Fetch error:", err);
				}
			}
		};

		fetchData();

		return () => {
			controller.abort();
		};
	}, []);

	if (!level) {
		return (
			<div className="App">
				<WelcomeScreen setLevel={setLevel}></WelcomeScreen>
			</div>
		);
	}
	return (
		<div className="App">
			<div className="header">
				<h1>Memorize the Champ</h1>
				<div className="level-wrapper">
					<h2>Difficulty Level :</h2>
					<div className="level-buttons">
						<button
							aria-label="Decrease Level"
							onClick={() => {
								if (level === "Medium") {
									setLevel("Easy");
								}
								if (level === "Hard") {
									setLevel("Medium");
								}
								if (level === "Extreme") {
									setLevel("Hard");
								}
							}}
						>
							<img className="left" src="/left.svg" alt="" />
						</button>
						<h2>{level}</h2>
						<button
							aria-label="Increase Level"
							onClick={() => {
								if (level === "Easy") {
									setLevel("Medium");
								}
								if (level === "Medium") {
									setLevel("Hard");
								}
								if (level === "Hard") {
									setLevel("Extreme");
								}
							}}
						>
							<img className="right" src="/right.svg" alt="" />
						</button>
					</div>
				</div>
			</div>

			<CardList cards={cards} numberOfCards={numberOfCards} />
		</div>
	);
}

function WelcomeScreen({ setLevel }) {
	return (
		<div className="welcome-screen">
			<h1>Memorize the Champ</h1>
			<h2>Difficulty Level</h2>
			<div>
				<button title="10 Cards" onClick={() => setLevel("Easy")}>
					<span>Easy</span>
				</button>

				<button title="20 Cards" onClick={() => setLevel("Medium")}>
					<span>Medium</span>
				</button>

				<button title="30 Cards" onClick={() => setLevel("Hard")}>
					<span>Hard</span>
				</button>

				<button title="100 Cards" onClick={() => setLevel("Extreme")}>
					<span>
						Extreme
						<sup>
							<span className="dedication">
								dedicated to
								<span className="marwa"> Marwa </span>
								<span className="heart">
									<img src="/heart.svg" alt="" />
								</span>
							</span>
						</sup>
					</span>
				</button>
			</div>
		</div>
	);
}

function CardList({ cards, numberOfCards }) {
	const [activeCardList, setActiveCardList] = useState([]);
	const [selectedCards, setSelectedCards] = useState([]);
	const [score, setScore] = useState(0);
	const [bestScore, setBestScore] = useState(0);
	const [areCardsFlipped, setAreCardsFlipped] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [gameState, setGameState] = useState(null);

	useEffect(() => {
		if (cards && activeCardList.length !== numberOfCards) {
			setSelectedCards([]);
			setGameState(null);
			setBestScore(Math.max(bestScore, score));
			setScore(0);
			setIsLoading(true);
			setAreCardsFlipped(true);

			const setupTimer = setTimeout(() => {
				let newActiveCardList = [];
				while (newActiveCardList.length < numberOfCards) {
					const randomIndex = Math.floor(Math.random() * cards.length);
					const card = cards[randomIndex];
					if (!newActiveCardList.includes(card)) {
						newActiveCardList.push(card);
					}
				}
				setActiveCardList(newActiveCardList);
				setIsLoading(false);

				const unflipTimer = setTimeout(() => {
					setAreCardsFlipped(false);
				}, 200);

				return () => clearTimeout(unflipTimer);
			}, 1000);
			return () => clearTimeout(setupTimer);
		}
	}, [cards, numberOfCards, activeCardList, score, bestScore]);

	const shuffleCards = () => {
		setAreCardsFlipped(true);
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		setTimeout(() => {
			const shuffledList = [...activeCardList];
			for (let i = shuffledList.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
			}
			setActiveCardList(shuffledList);

			setAreCardsFlipped(false);
		}, 1000);
	};

	const handleCardClick = (cardId) => {
		if (!selectedCards.includes(cardId)) {
			setScore(score + 1);
			if (selectedCards.length === numberOfCards - 1) {
				setGameState("victory");
				setBestScore(Math.max(bestScore, score + 1));
			} else {
				setSelectedCards((prevSelected) => [...prevSelected, cardId]);
				shuffleCards();
			}
		} else {
			setGameState("defeat");
			setBestScore(Math.max(bestScore, score));
		}
	};

	return (
		<>
			<VictoryScreen
				gameState={gameState}
				score={score}
				bestScore={bestScore}
			></VictoryScreen>
			<DefeatScreen
				gameState={gameState}
				score={score}
				bestScore={bestScore}
			></DefeatScreen>
			<div className="score-wrapper">
				<p>Score : {score}</p>
				<p>Best Score : {bestScore}</p>
			</div>
			<p className="instructions">
				Get points by clicking on an image but don't click on any more than
				once!
			</p>
			{isLoading ? (
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Loading Champions...</p>
				</div>
			) : (
				<div className="card-list">
					{activeCardList &&
						activeCardList.map((card, index) => (
							<Card
								onClick={() => {
									handleCardClick(card.id);
								}}
								key={index}
								card={card}
								isFlipped={areCardsFlipped}
							/>
						))}
				</div>
			)}
		</>
	);
}

function Card({ card, onClick, isFlipped }) {
	return (
		<div className="card-wrapper">
			<div
				aria-label={`Card for ${card.name}`}
				className={`card ${isFlipped ? "flipped" : ""}`}
				title={card.title}
				onClick={onClick}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
			>
				<div className="card-face">
					<img src={card.img} alt={card.name} />
					<p>{card.name}</p>
				</div>
				<div className="card-back"></div>
			</div>
		</div>
	);
}

function VictoryScreen({ gameState, score, bestScore }) {
	return (
		<dialog className="victory-dialog" open={gameState === "victory"}>
			<h2>You clicked all the cards!</h2>
			<img src="/victory.png" alt="victory-screen" />
			<div className="score-info">
				<h2>score: {score}</h2>
				<h2>Best score: {bestScore}</h2>
			</div>
			<button
				className="play-again-button"
				onClick={() => window.location.reload()}
			>
				<span>Play Again</span>
			</button>
		</dialog>
	);
}

function DefeatScreen({ gameState, score, bestScore }) {
	return (
		<dialog className="defeat-dialog" open={gameState === "defeat"}>
			<h2>You already clicked that card!</h2>
			<img src="/defeat.png" alt="defeat-screen" />
			<div className="score-info">
				<h2>score: {score}</h2>
				<h2>Best score: {bestScore}</h2>
			</div>
			<button
				className="play-again-button"
				onClick={() => window.location.reload()}
			>
				<span>Play Again</span>
			</button>
		</dialog>
	);
}

export default App;
