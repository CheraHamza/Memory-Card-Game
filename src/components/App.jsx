import "../styles/App.css";
import { useState, useEffect } from "react";

function App() {
	const [cards, setCards] = useState(null);
	useEffect(() => {
		let ignore = false;

		fetch(
			"https://ddragon.leagueoflegends.com/cdn/15.12.1/data/en_US/champion.json",
			{ mode: "cors" }
		)
			.then((response) => response.json())
			.then((json) => {
				if (!ignore) {
					let cards = [];
					for (const key of Object.keys(json.data)) {
						cards.push({
							name: key,
							img: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${key}_0.jpg`,
						});
					}
					setCards(cards);
				}
			});
		return () => {
			ignore = true;
		};
	}, []);

	return (
		<div className="App">
			<CardList cards={cards}></CardList>
		</div>
	);
}

function CardList({ cards }) {
	return (
		<div className="card-list">
			{cards &&
				cards.map((card, index) => (
					<Card key={index} img={card.img} name={card.name} />
				))}
		</div>
	);
}

function Card({ img, name }) {
	return (
		<div className="card">
			<img src={img} alt={name} />
			<p>{name}</p>
		</div>
	);
}

export default App;
