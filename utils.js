import { Markup } from 'telegraf';
import db from './db.js';

export async function showUserDecks(ctx) {
    const userDecks = await db.getDeckList(ctx.from.id);

	const keyboard = [];

	userDecks.forEach((el) => {
		keyboard.push([Markup.button.callback(`${el.name} | ${el._count.card}`, `clickDeck${el.id}-${el.name}|${el._count.card}`)]);
	});

	return ctx.reply('Your decks:', Markup.inlineKeyboard([...keyboard, [Markup.button.callback('[close]', `close`)]]));
}

export async function showSelectedDeck(ctx, deckId, deckName, cardsCount) {
	return ctx.editMessageText(
		`${deckName} | ${cardsCount}`,
		Markup.inlineKeyboard([
			[
				Markup.button.callback('learn', `learnDeck${deckId}`),
				Markup.button.callback('add a card', `addToDeck${deckId}`),
				Markup.button.callback('delete', `deleteDeck${deckId}`),
			],
			[Markup.button.callback('<= back', `decksList`)],
		])
	);
}
