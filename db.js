import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DataBase {
	constructor() {}

	async isUserExists(userId) {
		try {
			const foundUser = await prisma.user.findUnique({ where: { id: `${userId}` } });
			return Boolean(foundUser);
		} catch (error) {
			console.error('[isUserExists] error:', error.message);
			return false;
		}
	}

	async createNewUser(userId) {
		const isUserExists = await this.isUserExists(userId);
		if (!isUserExists) {
			try {
				await prisma.user.create({
					data: {
						id: `${userId}`,
					},
				});
			} catch (error) {
				console.error('[createNewUser] error:', error.message);
			}
		} else {
			console.log(`User with id: ${userId} is already exists.[createNewUser]`);
		}
	}

	async createNewDeck(userId, deckName) {
		const isUserExists = await this.isUserExists(userId);
		if (isUserExists) {
			try {
				await prisma.deck.create({
					data: {
						name: deckName,
						userId: `${userId}`,
					},
				});
			} catch (error) {
				console.error('[createNewDeck] error:', error.message);
			}
		} else {
			console.log(`User with id: ${userId} was not found.[createNewDeck]`);
		}
	}

	async getDeckList(userId) {
		const isUserExists = await this.isUserExists(userId);
		if (isUserExists) {
			try {
				return prisma.deck.findMany({
					where: {
						userId: `${userId}`,
					},
					include: {
						_count: {
							select: {
								card: true,
							},
						},
					},
				});
			} catch (error) {
				console.error('[getDeckList] error:', error.message);
				return [];
			}
		} else {
			console.log(`User with id: ${userId} was not found.[getDeckList]`);
		}
	}

	async deleteDeck(deckId) {
		try {
			await prisma.deck.delete({
				where: {
					id: Number(deckId),
				},
			});
		} catch (error) {
			console.error('[deleteDeck] error:', error.message);
		}
	}

	async createNewCard(deckId, frontValue, backValue) {
		try {
			await prisma.card.create({
				data: {
					deckId: Number(deckId),
					front: frontValue,
					back: backValue,
				},
			});
		} catch (error) {
			console.error('[createNewCard] error:', error.message);
		}
	}

	async deleteCard(cardId) {
		try {
			await prisma.card.delete({
				where: {
					id: Number(cardId),
				},
			});
		} catch (error) {
			console.error('[deleteCard] error:', error.message);
		}
	}

	async getCardList(deckId) {
		try {
			return prisma.card.findMany({
				where: {
					deckId: Number(deckId),
				},
				select: {
					id: true,
					front: true,
					back: true,
				},
				orderBy: {
					priority: 'desc',
				},
			});
		} catch (error) {
			console.error('[getCardList] error:', error.message);
			return [];
		}
	}

	async changeCardsPriority(cardsArray) {
		try {
			cardsArray.forEach(async (el) => {
				if (el.newPriority) {
					await prisma.card.update({
						where: {
							id: Number(el.id),
						},
						data: {
							priority: Number(el.newPriority),
						},
					});
				}
			});
		} catch (error) {
			console.error('[changeCardsPriority] error:', error.message);
		}
	}
}

export default new DataBase();
