// masukkan token bot yang didapatkan dari @botfather
var token = "5049590768:AAFuXvMVi8_ZzuyI45FYPCe3F2kD8JUse0U"

// url bot api
var url = "https://api.telegram.org/bot" + token + "/";

// untuk mempersingkat fungsi lainnya (sendMessage, dll)
function prosesApi(method, data) {
	var options = {
		"method": "POST",
		"contentType": "application/json",
		"payload": JSON.stringify({
			"method": method,
			"parse_mode": "HTML",
			...data
		})
	}

	// fetch data
	var response = UrlFetchApp.fetch(url, options);

	// cek respon api
	if (response.getResponseCode() == 200) {
		return JSON.parse(response.getContentText());
	}

	return false;
}

// fungsi untuk mengirim pesan
function sendMessage(id, text) {
	return prosesApi("sendMessage", {
		"chat_id": id,
		"text": text
	});
}

// fungsi sendMessage dengan keyboard biasa
function sendMessageKeyboard(id, text, keyboard) {
	return prosesApi("sendMessage", {
		"chat_id": id,
		"text": text,
		"reply_markup": {
			"resize_keyboard": true,
			"keyboard": keyboard
		}
	});
}

// fungsi sendMessage untuk menghapus keyboard biasa
function sendMessageRemoveKeyboard(id, text) {
	return prosesApi("sendMessage", {
		"chat_id": id,
		"text": text,
		"reply_markup": {
			"remove_keyboard": true
		}
	});
}

// fungsi sendMessage dengan keyboard inline
function sendMessageInlineKeyboard(id, text, keyboard) {
	return prosesApi("sendMessage", {
		"chat_id": id,
		"text": text,
		"reply_markup": {
			"inline_keyboard": keyboard
		}
	});
}

// fungsi untuk membalas callback query
function answerCallbackQuery(callback_id, text) {
	return prosesApi("answerCallbackQuery", {
		"callback_query_id": callback_id,
		"text": text
	});
}

function doGet(e) {
	return HtmlService.createHtmlOutput("Hanya doPost yang di proses!")
}

function doPost(e) {
	// memastikan hanya tipe JSON yang diterima
	if (e.postData.type == "application/json") {
		var content = e.postData.contents;

		// parsing data yang masuk
		var update = JSON.parse(content);

		// jika data valid maka permintaan akan diproses
		if (update) {
			return prosesPesan(update);
		}
	}

	return false;
}

// fungsi utama untuk memproses permintaan yang masuk
function prosesPesan(update) {

	// deteksi callback data dari inline keyboard
	if (update.callback_query) {

		// deteksi isi callback data

		if (update.callback_query.data == "click_hai") {
			var balas = "Hai juga 😊 Saya Resepsionis Bot! Salam kenal~~";
			return sendMessage(update.callback_query.message.chat.id, balas);
		}

		if (update.callback_query.data == "to_notif") {
			var balas = "Kamu telah mengklik tombol pada keyboard!";
			return answerCallbackQuery(update.callback_query.id, balas);
		}
	}

	// deteksi apakah ada permintaan yang masuk
	if (update.message) {

		// penyederhanaan chat id
		var id = update.message.chat.id;

		// jika permintaan berupa pesan text
		if (update.message.text) {

			// penyederhanaan permintaan text
			var text = update.message.text;

			// jika user mengetik /start
			if (/^\/start$/i.exec(text)) {
				var balas = "Halo! Resepsionis bot telah aktif!";
				var keyboard = [
					["/ping", "About"],
					["Tutup"]
				]
				return sendMessageKeyboard(id, balas, keyboard)
			}


			// jika user mengetik /ping
			if (/^\/ping/i.exec(text)) {
				var waktuPesan = update.message.date;
				var waktuSekarang = new Date().getTime() / 1000;
				var waktu = Math.abs(waktuSekarang - waktuPesan).toFixed(2);
				var balas = "Pong!!! \nDi proses dalam " + waktu + " detik."
				return sendMessage(id, balas);
			}

			// Silahkan kembangkan sendiri
			// Code bisa ditambahkan di area ini

			// mendeteksi text "Tutup"
			if (/^Tutup$/.exec(text)) {
				var balas = "Baiklah, keyboard akan ditutup/dihapus";
				return sendMessageRemoveKeyboard(id, balas);
			}

			// mendeteksi text "About"
			if (/^About$/.exec(text)) {
				var balas = "Sekilas tentang <b>Resepsionis Bot</b>!\nSaya adalah bot interaktif yang dapat kamu kembangkan lebih jauh dan lebih keren lagi!\n\nDibuat oleh: <a href='https://telegram.me/muhsinalr'>Muhsinalr</a>.\nUntuk cara pembuatan dan pengembangan bisa dilihat <a href='https://muhsinalr.com'>di sini</a>.";
				var keyboard = [
					[
						{ text: "Hai", callback_data: "click_hai" },
						{ text: "Klik", callback_data: "to_notif" }
					]
				];
				return sendMessageInlineKeyboard(id, balas, keyboard);
			}

		}

		// jika permintaan berupa member masuk
		if (update.message.new_chat_members) {

			// buat variabel baru untuk member masuk
			var userBaru = update.message.new_chat_members[0];

			// definisikan nama user yang masuk
			var nama = userBaru.first_name;

			// jika punya last name, kita tambahkan juga
			if (userBaru.last_name) {
				nama += " " + userBaru.last_name;
			}

			var balas = "Selamat datang " + nama + "! Semoga harimu menyenangkan!";
			return sendMessage(id, balas);
		}
	}

	return false;
}

