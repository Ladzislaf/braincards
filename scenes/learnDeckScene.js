import { Scenes, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import db from '../db.js';

const learnDeckScene = new Scenes.BaseScene('learnDeck');

learnDeckScene.enter(async (ctx) => {
	return showFrontValue(ctx);
});

learnDeckScene.action('showBack', async (ctx) => {
	return showBackValue(ctx);
});

learnDeckScene.action(/^answer\d{1}$/, async (ctx) => {
	const newPriority = +ctx.callbackQuery.data.substring(6);
	const { id } = ctx.session.learn.cards[ctx.session.learn.currentCardIndex];
	await db.changeCardPriority(id, newPriority);

	if (ctx.session.learn.currentCardIndex >= ctx.session.learn.cards.length - 1) {
		delete ctx.session.learn;
		await ctx.answerCbQuery('All cards learned.');
		await ctx.deleteMessage();
		return ctx.scene.leave();
	} else {
		await ctx.answerCbQuery('Next card.');
		ctx.session.learn.currentCardIndex++;
		return showFrontValue(ctx);
	}
});

learnDeckScene.action('stopLearn', async (ctx) => {
	delete ctx.session.learn;
	await ctx.answerCbQuery('Stopped.');
	await ctx.deleteMessage();
	return ctx.scene.leave();
});

async function showFrontValue(ctx) {
	const { front: frontValue } = ctx.session.learn.cards[ctx.session.learn.currentCardIndex];

	return ctx.editMessageText(
		`< ${frontValue} >`,
		Markup.inlineKeyboard([
			[Markup.button.callback('Show back side', `showBack`)],
			[Markup.button.callback('Stop learning', `stopLearn`)],
		])
	);
}

async function showBackValue(ctx) {
	const { back: backValue } = ctx.session.learn.cards[ctx.session.learn.currentCardIndex];

	return ctx.editMessageText(
		`< ${backValue} >`,
		Markup.inlineKeyboard([
			[
				Markup.button.callback('Easy', `answer1`),
				Markup.button.callback('Norm', `answer2`),
				Markup.button.callback('Hard', `answer3`),
			],
			[Markup.button.callback('Stop learning', `stopLearn`)],
		])
	);
}

learnDeckScene.on(message(), async (ctx) => {
	return ctx.deleteMessage();
});

export default learnDeckScene;
