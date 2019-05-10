const {sendTextMessage, sendQuickReply, getUserInfo, sendGenericTemplate} = require('./messenger');
const {createOrder} = require('./order');
const user_orders = {};
let reciklraProizvod = '';
let doniranje = false;

const verifyToken = (req, res) => {
	try {
		if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
			res.send(req.query['hub.challenge']);
		} else {
            res.send('Error, wrong token');
        }
	} catch (error) {
		console.error('Webhook error', error);
	}
};

const conversation = async (req, res) => {
  let messaging_events = req.body.entry[0].messaging;

  for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
    let sender = event.sender.id;

    console.log('EVENT', event);

		if (event.message && event.message.text) {
      if(event.message.text === 'Start') {
        user_orders[sender] = await getUserInfo(sender);
        await sendQuickReply(sender, `Zdravo 👋 ${user_orders[sender].first_name}, ja sam ClimaVbot 🤖 i mogu Vam pomoći oko Vašeg otpada 🗑. Šta želite da uradite ❓`, ['Prodaja 💰', 'Reciklaža ♻️', 'Doniranje ❤️']);
      } else if(event.message.text === 'Reciklaža ♻️') {
        await sendQuickReply(sender, 'Šta želite da reciklirate ♻️ ❓', ['Papir 📰', 'Limenke 🥫', 'Plastične boce 🍶']);
      } else if(event.message.text === 'Prodaja 💰') {
        await sendTextMessage(sender, 'Potrebne su mi sledeće informacije ℹ️');
        await sendTextMessage(sender, 'Slika 🖼️ proizvoda kojeg želite da prodate 💰');
      } else if (event.message.text === 'Doniranje ❤️') {
        await sendTextMessage(sender, 'Slika 🖼️ proizvoda kojeg želite da donirate');
        doniranje = true;
      } else if (event.message.text === '1') {
        user_orders[sender] = {...user_orders[sender], duration: 1};
        await sendTextMessage(sender, 'Cena 💰');
      } else if (event.message.text === '2') {
        user_orders[sender] = {...user_orders[sender], duration: 2};
        await sendTextMessage(sender, 'Cena 💰');
      } else if (event.message.text === '3') {
        user_orders[sender] = {...user_orders[sender], duration: 3};
        await sendTextMessage(sender, 'Cena 💰');
      } else if(user_orders[sender] && user_orders[sender].nextAnswer === 'Naziv proizvoda') {
        user_orders[sender] = {...user_orders[sender], name: event.message.text, nextAnswer: 'Tip proizvoda'};
        await sendTextMessage(sender, 'Tip proizvoda');
      } else if(user_orders[sender] && user_orders[sender].nextAnswer === 'Tip proizvoda') {
        user_orders[sender] = {...user_orders[sender], type: event.message.text, nextAnswer: 'Opis proizvoda'};
        await sendTextMessage(sender, 'Opis proizvoda');
      } else if(user_orders[sender] && user_orders[sender].nextAnswer === 'Opis proizvoda') {
        user_orders[sender] = {...user_orders[sender], description: event.message.text, nextAnswer: 'Cena 💰'};
        await sendQuickReply(sender, 'Koliko dana želite da vam traje oglas ❓', ['1', '2', '3']);
      } else if (user_orders[sender] && user_orders[sender].nextAnswer === 'Telefon') {
        user_orders[sender] = {...user_orders[sender], telephone: event.message.text, nextAnswer: 'Kraj'};
        // await Promise.all([, ]);
        let _id = await createOrder(user_orders[sender]);
        await sendGenericTemplate(sender, {name: user_orders[sender].name, description: user_orders[sender].description, orderImg: user_orders[sender].orderImg, _id: _id});
      } else if (user_orders[sender] && user_orders[sender].nextAnswer === 'Cena 💰') {
        user_orders[sender] = {...user_orders[sender], price: event.message.text, nextAnswer: 'Telefon'};
        await sendTextMessage(sender, 'Unesite kontakt telefon')
      } else if (event.message.text === 'Papir 📰') {
        await sendTextMessage(sender, 'Koliko kilograma ⚖️ želite da reciklirate ♻️ ❓');
        reciklraProizvod = 'Papir 📰';
      } else if (event.message.text === 'Limenke 🥫') {
        await sendTextMessage(sender, 'Koliko kilograma ⚖️ želite da reciklirate ♻️ ❓');
        reciklraProizvod = 'Limenke 🥫';
      } else if (event.message.text === 'Plastične boce 🍶') {
        await sendTextMessage(sender, 'Koliko kilograma ⚖️ želite da reciklirate ♻️ ❓');
        reciklraProizvod = 'Plastične boce 🍶';
      } else if (parseFloat(event.message.text).toString() === event.message.text) {
        let cenaProizvoda = 0;
        console.log('reciklraProizvod', reciklraProizvod);
        switch(reciklraProizvod) {
          case 'Papir 📰': cenaProizvoda = parseFloat(event.message.text) * 6; break;
          case 'Limenke 🥫': cenaProizvoda = parseFloat(event.message.text) * 70; break;
          case 'Plastične boce 🍶': cenaProizvoda = parseFloat(event.message.text) * 5; break;
          default: console.log('LELELELE');
        }
        console.log('cenaProizvoda', cenaProizvoda);
        await sendTextMessage(sender, `Procena cene na osnovu sajta gradskacistoca.rs iznosi ${cenaProizvoda} dinara 💰`);
        await sendTextMessage(sender, 'Unesite vasu adresu');
      } else {
        await sendTextMessage(sender, 'Hvala što reciklirate ♻️. Neko će doći da preuzme otpad u roku od jednog dana ⏳.');
      }
		} else if (event.message && event.message.attachments) {
      if(doniranje === true) {
        await sendTextMessage(sender, 'Hvala što želite da donirate. 😍');
        await sendTextMessage(sender, 'Uskoro će Vas neko od zaposlenih kontaktirati preko messenger-a radi preuzimanja proizvoda.');
        doniranje = false;
      } else {
        user_orders[sender] = {...user_orders[sender], orderImg: event.message.attachments[0].payload.url, nextAnswer: 'Naziv proizvoda'};
        await sendTextMessage(sender, 'Naziv proizvoda');
      }
    } else if (event.postback) {
      let payload = event.postback.payload;
      if (payload === 'GET_STARTED_PAYLOAD') {
        user_orders[sender] = await getUserInfo(sender);
        await sendQuickReply(sender, `Zdravo 👋 ${user_orders[sender].first_name}, ja sam ClimaVbot 🤖 i mogu Vam pomoći oko Vašeg otpada 🗑. Šta želite da uradite ❓`, ['Prodaja 💰', 'Reciklaža ♻️', 'Doniranje ❤️']);
      }
    }
	}
	res.sendStatus(200);
}

module.exports = {
    verifyToken,
    conversation
}