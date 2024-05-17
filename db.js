import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DataBase {
	constructor() {}

	async isUserExists(userId) {
		try {
			const foundUser = await prisma.user.findUnique({ where: { id: `${userId}` } });
			return Boolean(foundUser);
		} catch (error) {
			console.error(error);
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
				console.error(error);
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
				console.error(error);
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
				console.error(error);
			}
		} else {
			console.log(`User with id: ${userId} was not found.[getDeckList]`);
		}
	}

	async deleteDeck(deckId) {
		try {
			const foundDeck = await prisma.deck.findUnique({
				where: {
					id: Number(deckId),
				},
			});
			if (foundDeck) {
				await prisma.deck.delete({
					where: {
						id: foundDeck.id,
					},
				});
			} else {
				console.log(`Deck with id: ${deckId} was not found.[deleteDeck]`);
			}
		} catch (error) {
			console.error(error);
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
			console.error(error);
		}
	}

	async getCardList(deckId) {
		try {
			const foundDeck = await prisma.deck.findUnique({
				where: {
					id: Number(deckId),
				},
			});
			if (foundDeck) {
				return prisma.card.findMany({
					where: {
						deckId: Number(deckId),
					},
					select: {
						id: true,
						front: true,
						back: true
					},
					orderBy: {
						priority: 'desc',
					},
				});
			} else {
				console.log(`Deck with id: ${deckId} was not found.[getDeckList]`);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async changeCardPriority(cardId, newPriority) {
		try {
			const foundCard = await prisma.card.findUnique({
				where: {
					id: Number(cardId),
				},
			});
			if (foundCard) {
				await prisma.card.update({
					where: {
						id: Number(cardId),
					},
					data: {
						priority: Number(newPriority),
					},
				});
			} else {
				console.log(`Card with id: ${cardId} was not found.[changeCardPriority]`);
			}
		} catch (error) {
			console.error(error);
		}
	}
}

export default new DataBase();
