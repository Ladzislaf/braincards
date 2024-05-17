import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import db from '../db.js';
import { showUserDecks } from '../utils.js';

const newDeckScene = new Scenes.BaseScene('newDeck');

newDeckScene.enter(async (ctx) => {
	await ctx.deleteMessage()
	return ctx.reply(`Send a new deck name. (3-20 symbols)`);
});

newDeckScene.on(message('text'), async (ctx) => {
	await ctx.deleteMessage();
	const deckName = ctx.message.text;

	if (deckName.length < 3 || deckName.length > 20) {
		return ctx.reply('Incorrect name. (3-20 symbols)');
	}
	await db.createNewDeck(ctx.from.id, deckName);
	await ctx.reply(`Success! The deck ${deckName} was created.`);
	await showUserDecks(ctx);
	return ctx.scene.leave();
});

newDeckScene.on(message(), async (ctx) => {
	await ctx.deleteMessage();
	return ctx.reply('Incorrect message. Please, send a text name.');
});

export default newDeckScene;
