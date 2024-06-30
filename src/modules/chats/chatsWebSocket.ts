import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import moment from 'moment';

interface ParsedMessage {
	event: string;
	message?: string;
	username?: string;
	email?: string;
	room?: string;
	time?: string;
}

interface ChatData {
	[room: string]: ParsedMessage[];
}

const chatData: ChatData = {};
const clients: { [email: string]: WebSocket } = {};

export const initializeWebSocket = (httpServer: Server): WebSocketServer => {
	const wss = new WebSocketServer({ server: httpServer });

	wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
		let userEmail: string | null = null;

		ws.on('message', (message: string) => {
			try {
				const parsedMessage: ParsedMessage = JSON.parse(message);
				if (parsedMessage.email) {
					userEmail = parsedMessage.email;
					clients[userEmail] = ws; // Сохраняем соединение
				}
				handleIncomingMessage(wss, ws, parsedMessage);
			} catch (error) {
				console.error('Error parsing message:', error);
				ws.send(JSON.stringify({ error: 'Invalid message format' }));
			}
		});

		ws.on('close', () => {
			console.log('Client disconnected');
			if (userEmail) {
				delete clients[userEmail]; // Удаляем соединение при отключении
			}
		});
	});

	return wss;
};

const handleIncomingMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	if (message.room) {
		const emails = message.room.split('+').sort();
		message.room = `${emails[0]}+${emails[1]}`;
		message.time = moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z');
	}

	switch (message.event) {
		case 'sendChatMessage':
			handleSendChatMessage(wss, ws, message);
			break;
		case 'getChatMessage':
			handleGetChatMessage(wss, ws, message);
			break;
		case 'subscribe':
		case 'notify':
			handleNotificationMessage(wss, ws, message);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown event' }));
	}
};

const handleSendChatMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	const { room, email, message: chatMessage } = message;
	if (!room || !email || !chatMessage) {
		ws.send(JSON.stringify({ error: 'Room, email, or message not specified' }));
		return;
	}

	saveChatMessage(room, message);
	const recipientEmail = room.split('+').find((e) => e !== email);
	if (recipientEmail && clients[recipientEmail]) {
		const chatHistory = chatData[room] || [];
		clients[recipientEmail].send(
			JSON.stringify({ event: 'newChatMessage', messages: chatHistory })
		);
		ws.send(JSON.stringify({ event: 'newChatMessage', messages: chatHistory }));
	} else {
		ws.send(JSON.stringify({ error: 'Recipient not connected' }));
	}
};

const handleGetChatMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
) => {
	const { room } = message;
	if (!room) {
		ws.send(JSON.stringify({ error: 'Room not specified' }));
		return;
	}
	const chatHistory = chatData[room] || [];
	ws.send(JSON.stringify({ event: message.event, messages: chatHistory }));
};

const handleNotificationMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	switch (message.event) {
		case 'subscribe':
			ws.send(
				JSON.stringify({
					event: 'subscribed',
					data: 'You are subscribed to notifications'
				})
			);
			break;
		case 'notify':
			Object.values(clients).forEach((client) => {
				if (client !== ws) {
					client.send(JSON.stringify(message));
				}
			});
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown action' }));
	}
};

const saveChatMessage = (room: string, message: ParsedMessage): void => {
	if (!chatData[room]) {
		chatData[room] = [];
	}
	chatData[room].push(message);
};
