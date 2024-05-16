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
				console.log(`User with id: ${userId} was not found.[deleteDeck]`);
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
}

export default new DataBase();
