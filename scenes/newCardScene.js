import { Markup, Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import db from '../db.js';

const newCardScene = new Scenes.BaseScene('newCard');

newCardScene.enter(async (ctx) => {
	await ctx.deleteMessage();
	ctx.session.newCard.side = 'front';
	return ctx.reply(`Send a front side of the card. (3-300 symbols)`);
});

newCardScene.on(message('text'), async (ctx) => {
	await ctx.deleteMessage();
	const cardText = ctx.message.text;

	if (cardText.length < 3 || cardText.length > 300) {
		return ctx.reply('Incorrect text. (3-300 symbols)');
	}
	if (ctx.session.newCard.side === 'front') {
		ctx.session.newCard.frontValue = cardText;
		ctx.session.newCard.side = 'back';
		ctx.reply('Success! Send a back side of the card now. (3-300 symbols)');
	} else if (ctx.session.newCard.side === 'back') {
		await db.createNewCard(ctx.session.newCard.deckId, ctx.session.newCard.frontValue, cardText);
		await ctx.reply(
			`Success! The card was created.`,
			Markup.inlineKeyboard([[Markup.button.callback('Add one more', `addToDeck${ctx.session.newCard.deckId}`)]])
		);
		delete ctx.session.newCard;
		return ctx.scene.leave();
	}
});

newCardScene.on(message(), async (ctx) => {
	await ctx.deleteMessage();
	return ctx.reply('Incorrect message. Please, send a text.');
});

export default newCardScene;
