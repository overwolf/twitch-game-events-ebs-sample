let io = require('socket.io-client');
const request = require('request-promise-native');

const OUR_STREAMER_ID = '12345678';
const CLIENT_KEY = 'OW123456789ABCDEF';
const CLIENT_SECRET = '11111111111111111111111111111111';
const PUBSUB_URL = 'https://twitchge.overwolf.com';

const waitSocket = (socket) => {
  return new Promise((resolve, reject) => {
    socket.once("error", (err) => {
      reject(err);
    });

    socket.once("connect", () => {
      resolve(socket);
    });
  });
};

async function getStreamerInfo(id, token) {
  try {
    let response = await request({
      method: 'GET',
      uri: `${PUBSUB_URL}/info/${id}`,
      json: true,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    console.log('Streamer current info:', response);
  } catch (e) {
    console.error(e.message);
  }
}

async function getStreamerGame(id, token) {
  try {
    let response = await request({
      method: 'GET',
      uri: `${PUBSUB_URL}/info/${id}/game`,
      json: true,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    console.log('Streamer current game:', response);
  } catch (e) {
    console.error(e.message);
  }
}

(async function () {

  try {

    let response = await request({
      method: 'POST',
      uri: `${PUBSUB_URL}/auth/backend`,
      body: {
        broadcaster: OUR_STREAMER_ID,
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET
      },
      json: true
    });

    let token = response.token;

    const socketio = io(PUBSUB_URL, {
      "transports": [ "websocket" ],
      "query": `token=${token}`
    });

    // await waitSocket(socket);
    socketio.on('connect', function() {
      console.log('CONNECT');
      getStreamerGame(OUR_STREAMER_ID, token);
      getStreamerInfo(OUR_STREAMER_ID, token);
    });

    socketio.on('publish', function(data) {
      console.log(`EVENT ${JSON.stringify(data)}`);
      if (data[0] === 'sessionStart') {
        getStreamerInfo(OUR_STREAMER_ID, token);
      }
    });

    socketio.on('disconnect', function() {
      console.log('DISCONNECT');
    });

  } catch (e) {
    console.error(e);
  }

})();


