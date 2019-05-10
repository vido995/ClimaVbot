const request = require('request');

const sendRequest = (messageData, sender) => {
  let json = {
    recipient: {
      id: sender,
    },
    message: messageData,
  };

  return new Promise((resolve, reject) => {
    const requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.FB_PAGE_TOKEN},
      method: 'POST',
      json
    };

    request(requestData, (error, response) => {
      if (error) {
        console.error('Error sending messages: ', error);
        reject(error);
      } else if (response.body.error) {
        console.error('Error: ', response.body.error);
        reject(response.body.error);
      } else {
        resolve();
      }
    });
  });
};

const sendTextMessage = async (sender, text) => {
  await sendRequest({
    text,
  }, sender);
};

const sendQuickReply = async (sender, text, quickReplies, payloads) => {
  const messageData = {
    text,
    quick_replies: [],
  };
  for (let i = 0; i < quickReplies.length; i++) {
    messageData.quick_replies.push({
      content_type: 'text',
      title: quickReplies[i],
      payload: (payloads && payloads[i] ? payloads[i] : text)
    });
  }
  await sendRequest(messageData, sender);
};

const getUserInfo = id => {
  const url = `https://graph.facebook.com/${id}?fields=first_name,last_name,profile_pic&access_token=${process.env.FB_PAGE_TOKEN}`;
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const user = JSON.parse(body);
        resolve(user);
      } else {
        reject('User info not found!');
      }
    });
  });
};

const sendGenericTemplate = async (sender, obj) => {
  const messageData = {
    attachment: {
      type: 'template',
      payload: {
        image_aspect_ratio: 'square',
        'template_type': 'generic',
        'elements': [{
          title: obj.name,
          image_url: obj.orderImg,
          subtitle: obj.description,
          buttons: [
            {
              "type": "web_url",
              "url": `https://climathon.herokuapp.com/product/${obj._id}`,
              "title": "View Order"
            }, {
              "type": "postback",
              "title": "Cancel Order",
              "payload": "CANCEL_ORDER"
            }
          ]
        }]
      }
    }
  };
  await sendRequest(messageData, sender);
};

module.exports = {
  sendTextMessage,
  sendQuickReply,
  getUserInfo,
  sendGenericTemplate
}