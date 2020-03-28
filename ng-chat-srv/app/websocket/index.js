const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../authentication');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { User } = require('../models/user');
const { Conversation } = require('../models/conversation');
const { Message, checkBody } = require('../models/message');

let usersOnline = [];

const returnAllContacts = async (currentUser) => {
    let contacts = await User.findAll({
        where: {
            id: { [Op.notIn]: [currentUser.id] }
        },
        attributes: {
            exclude: ['password']
        },
        raw: true
    });

    return await Promise.all(contacts.map(async (contact) => {
        const currentUserMessages = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { user1Id: currentUser.id, user2Id: contact.id },
                    { user1Id: contact.id, user2Id: currentUser.id }
                ]
            },
            include: {
                model: Message,
                where: { unread: true, userId: contact.id }
            }
        });
        contact.unread = currentUserMessages.length;
        return contact;
    })); 
};

const returnGeneralMessages = async () => {
    return await Message.findAll({
        where: { conversationId: null },
        order: [
            ['date', 'ASC']
        ],
        attributes: ['text', 'date'],
        include: {
            model: User,
            as: 'user',
            attributes: ['name', 'login']
        }
    });
};

const getFirstInterlocutor = async (currentUserId) => {
    return (await User.findAll({
        where: {
            id: { [Op.notIn]: [currentUserId] }
        },
        attributes: {
            exclude: ['password']
        },
        raw: true
    }))[0];
};

const updateFieldUnread = async (currentUser, interlocutor) => {
    let ids = await Message.findAll({
        include: [
            {
                model: Conversation,
                where: {
                    user1Id: [currentUser.id, interlocutor.id],
                    user2Id: [currentUser.id, interlocutor.id]
                }
            }
        ]
    }).map(m => m.id);

    return await Message.update({ unread: false }, {
        where: {
            id: [...ids],
            userId: interlocutor.id
        }
    });
}

const returnMessagesOfCorrespondence = async ({ currentUser, interlocutor }) => {
    if(!interlocutor) {
        interlocutor = await getFirstInterlocutor(currentUser.id);
    }

    await updateFieldUnread(currentUser, interlocutor);

    return await Message.findAll({
        order: [
            ['date', 'ASC']
        ],
        attributes: ['text', 'date'],
        include: [
            {
                model: User,
                as: 'user',
                where: { id: [currentUser.id, interlocutor.id] },
                attributes: ['name', 'login'],
            },
            {
                model: Conversation,
                attributes: [],
                where: {
                    user1Id: [currentUser.id, interlocutor.id],
                    user2Id: [currentUser.id, interlocutor.id]
                }
            }
        ]
    });
};

const onConnect = (io) => {
    io.emit('users-online', usersOnline.map(u => u.user));
    
    returnGeneralMessages()
        .then(messages => {
            io.emit('general-messages', messages)
        })
        .catch(err => io.emit('error', err));
};

module.exports = (app) => {
    const server = http.createServer(app);
    const io = socketIO(server);

    // io.use((socket, next) => {
    //     jwt.verify(socket.handshake.query.token, secretKey, (err, decodedToken) => {
    //         if(err) {
    //             return next(new Error('authentication error'));
    //         } else {
    //             socket.userId = decodedToken.id;
    //             return next();
    //         }
    //     });
    // });   

    io.on('connect', socket => {
        onConnect(io);

        socket.on('sign-in', async (user) => {
            const currentUser = JSON.parse(user);
            usersOnline.map(u => u.user.id).includes(currentUser.id) 
                || usersOnline.push({ socketId: socket.id, user: currentUser });
            
            const allContacts = await returnAllContacts(currentUser);
            io.to(socket.id).emit('all-contacts', allContacts);

            const onliners = usersOnline.map(u => u.user);
            io.emit('users-online', onliners);
        });
    
        socket.on('sign-out', async (user) => {
            usersOnline.splice(usersOnline.findIndex(u => u.user.id === JSON.parse(user).id), 1);
            const onliners = usersOnline.map(u => u.user);
            io.emit('users-online', onliners);
        });

        socket.on('correspondence', async (users) => {
            // if(!users.interlocutor) {
            //     users.interlocutor = await getFirstInterlocutor(newPrivateMessage.userId);
            // }
            
            try {
                const messagesOfCorrespondence = await returnMessagesOfCorrespondence(users);
                io.to(socket.id).emit('correspondence', messagesOfCorrespondence);

                const allContacts = await returnAllContacts(users.currentUser);
                io.to(socket.id).emit('all-contacts', allContacts);
            } catch(err) {
                io.to(socket.id).emit('error', err);
            }
        });

        socket.on('general-message', async (newGeneralMessage) => {
            const err = checkBody(newGeneralMessage);
            if(err) return io.to(socket.id).emit('error', err);
            
            try {
                await Message.create({ ...newGeneralMessage });
                const generalMessages = await returnGeneralMessages();
                io.emit('general-messages', generalMessages);
            } catch(err) {
                io.to(socket.id).emit('error', err);
            }
        });

        socket.on('private-message', async ({ data: newPrivateMessage, interlocutor }) => {
            if(!interlocutor) {
                interlocutor = await getFirstInterlocutor(newPrivateMessage.userId);
            }
            const err = checkBody(newPrivateMessage);
            if(err) return io.to(socket.id).emit('error', err);
            
            try {
                const conversation = await Conversation.create({ user1Id: newPrivateMessage.userId, user2Id: interlocutor.id });
                await Message.create({ ...newPrivateMessage, conversationId: conversation.id });
                const messagesOfCorrespondence = await returnMessagesOfCorrespondence({
                    currentUser: { id: newPrivateMessage.userId },
                    interlocutor
                });
                io.to(socket.id).emit('correspondence', messagesOfCorrespondence);
                
                const interlocutorInfo = usersOnline.find(u => u.user.id === interlocutor.id);
                if(interlocutorInfo) {
                    io.to(interlocutorInfo.socketId).emit('correspondence', messagesOfCorrespondence, newPrivateMessage.userId);

                    const allContacts = await returnAllContacts(interlocutor);
                    io.to(interlocutorInfo.socketId).emit('all-contacts', allContacts);
                }
            } catch(err) {
                io.to(socket.id).emit('error', err);
            }
        });

        socket.on('update-unread', async ({currentUser, interlocutor}) => {            
            try {
                await updateFieldUnread(currentUser, interlocutor);
            } catch(err) {
                io.to(socket.id).emit('error', err);
            }
        });
    });

    return server;
};