import { Telegraf, Markup, Scenes, session } from 'telegraf';
import dotenv from 'dotenv';
import db from './db.js';
import newDeckScene from './scenes/newDeckScene.js';
import newCardScene from './scenes/newCardScene.js';
import learnDeckScene from './scenes/learnDeckScene.js';
import { showUserDecks, showSelectedDeck } from './utils.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([newDeckScene, newCardScene, learnDeckScene]);

bot.use(session());
bot.use(stage.middleware());

bot.telegram.setMyCommands([
	{ command: '/start', description: 'Restart the bot' },
	{ command: '/my_decks', description: 'Show your decks' },
	{ command: '/new_deck', description: 'Create new deck' },
]);

bot.start(async (ctx) => {
	await ctx.deleteMessage();
	await db.createNewUser(ctx.from.id);
	return ctx.reply('Bot commands:\n/my_decks - Show your decks\n/new_deck - Create new deck');
});

bot.command('my_decks', async (ctx) => {
	await ctx.deleteMessage();
	await showUserDecks(ctx);
});

bot.command('new_deck', async (ctx) => {
	return ctx.scene.enter('newDeck');
});

// ==============================================

bot.action('decksList', async (ctx) => {
	await ctx.deleteMessage();
	await showUserDecks(ctx);
	return ctx.answerCbQuery('Your decks.');
});

bot.action(/^clickDeck\d+-.+\|\d+$/, async (ctx) => {
	const actionName = ctx.callbackQuery.data;
	const deckId = actionName.substring(9, actionName.indexOf('-'));
	const deckName = actionName.substring(actionName.indexOf('-') + 1, actionName.indexOf('|'));
	const cardsCount = actionName.substring(actionName.indexOf('|') + 1);
	await showSelectedDeck(ctx, deckId, deckName, cardsCount);
	return ctx.answerCbQuery(`${deckName}.`);
});

bot.action(/^learnDeck\d*$/, async (ctx) => {
	const deckId = ctx.callbackQuery.data.substring(9);
	ctx.session.learn = {
		cards: await db.getCardList(deckId),
		currentCardIndex: 0,
	};
	await ctx.scene.enter('learnDeck');
	return ctx.answerCbQuery('Learning.');
});

bot.action(/^addToDeck\d*$/, async (ctx) => {
	const deckId = ctx.callbackQuery.data.substring(9);
	ctx.session.newCard = {
		deckId: deckId,
	};
	await ctx.scene.enter('newCard');
	return ctx.answerCbQuery('New deck.');
});

bot.action(/^deleteDeck\d*$/, async (ctx) => {
	const deckId = ctx.callbackQuery.data.substring(10);
	await db.deleteDeck(deckId);
	await ctx.answerCbQuery(`Deleted.`);
	await ctx.deleteMessage();
	return showUserDecks(ctx);
});

bot.action('close', async (ctx) => {
	await ctx.deleteMessage();
	return ctx.answerCbQuery('Closed.');
});

if (process.env.LOCAL_MODE === 'on') {
	bot.launch(() => console.log('Braincards bot is running locally.'));
} else {
	bot.launch(
		{
			webhook: {
				domain: process.env.DOMAIN,
				port: process.env.PORT || 443,
			},
		},
		() => console.log('Braincards bot is running on webhook.')
	);
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
