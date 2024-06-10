import { Markup, Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import db from '../db.js';

const newCardScene = new Scenes.BaseScene('newCard');

newCardScene.enter(async (ctx) => {
	await ctx.deleteMessage();
	return ctx.reply(`Send cards text in format:\nfront 1 @= back 1 @;\nfront 2 @= back 2`);
});

newCardScene.on(message('text'), async (ctx) => {
	const newCardsArray = ctx.message.text.split('@;');

	if (newCardsArray.length < 1) {
		return ctx.reply('Incorrect format.\nfront 1 @= back 1 @;\nfront 2 @= back 2');
	} else {
		let cardsCounter = 0;

		newCardsArray.forEach((el) => {
			const newCard = el.split('@=');

			if (newCard.length === 2) {
				db.createNewCard(ctx.session.deckId, newCard[0], newCard[1]);
				cardsCounter++;
			}
		});
		await ctx.reply(`Added ${cardsCounter} cards.`);
		delete ctx.session.deckId;
		return ctx.scene.leave();
	}
});

newCardScene.on(message(), async (ctx) => {
	await ctx.deleteMessage();
	return ctx.reply('Incorrect message. Please, send a text.');
});

export default newCardScene;
