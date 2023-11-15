var currentuser; // user hiện tại, biến toàn cục'
src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js";
let publicKey;
let thanhtien;
window.onload = function () {
	khoiTao();
	(async () => {
		await window.phantom.solana.connect();
		publicKey = window.phantom.solana.publicKey.toBase58(); //[1,1,1,1]
		
	})();
	// autocomplete cho khung tim kiem
	autocomplete(document.getElementById('search-box'), list_products);

	// thêm tags (từ khóa) vào khung tìm kiếm
	var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
	for (var t of tags) addTags(t, "index.html?search=" + t)

	currentuser = getCurrentUser();
	addProductToTable(currentuser);
}

function addProductToTable(user) {
	var table = document.getElementsByClassName('listSanPham')[0];

	var s = `
		<tbody>
			<tr>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

	if (!user) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Bạn chưa đăng nhập !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	} else if (user.products.length == 0) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Giỏ hàng trống !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	}

	var totalPrice = 0;
	let a = 0;
	for (var i = 0; i < user.products.length; i++) {
		var masp = user.products[i].ma;
		var soluongSp = user.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thoigian = new Date(user.products[i].date).toLocaleString();
		thanhtien = stringToNum(price) * soluongSp;

		s += `
			<tr>
				<td>` + (i + 1) + `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
						` + p.name + `
						<img src="` + p.img + `">
					</a>
				</td>
				<td class="alignRight">` + price + ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` + masp + `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` + masp + `')" value=` + soluongSp + `>
					<button onclick="tangSoLuong('` + masp + `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
				<td style="text-align: center" >` + thoigian + `</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i> </td>
			</tr>
		`;
		// Chú ý nháy cho đúng ở giamsoluong, tangsoluong
		totalPrice += thanhtien;
	
	}

	s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN:`+ numToString(totalPrice) + `VNĐ</td>			
				<td class="alignRight">` + numToString(thanhtien / (1.0*4000000)) + ` SOL</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán Bằng SOL </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>
	`;

	table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
	if (window.confirm('Xác nhận hủy mua')) {
		currentuser.products.splice(i, 1);
		capNhatMoiThu();
	}
}

function thanhToan() {
	
	
	//	1: Auto connect
   


	const SHYFT_API_KEY = "FvtQ-DsN9H3YDIYw";
   	
	const toTransaction = (encodedTransaction) => solanaWeb3.Transaction.from(Uint8Array.from(atob(encodedTransaction), c => c.charCodeAt(0)));
	
	//https://api.shyft.to/sol/v1
	

	//MINT PRIV KEY
	const PRIV_KEY_WALLET = "4XMJ5M6wopsvVmBMC8jpShcVETUAAbF2aVKy4ZtqxXDmHUgDcywGhy817vVN2dwJqU6crhWpsoHVtcFAAPRtkGNc";
	

	//=========== [TRANSFER SOLANA] ==========
	
		let a = thanhtien / (1.0*4000000);
		console.log(a);
		var myHeaders = new Headers();
		myHeaders.append("x-api-key", SHYFT_API_KEY);
		myHeaders.append("Content-Type", "application/json");
		console.log(publicKey);
		var raw = JSON.stringify({
		"network": "devnet",
		"from_address": publicKey, //Nguoi gui
		"to_address": "3a6dPcQuVmatzxnzQ7VjNFWaUZwR8LQKfNh4Vanmon5L", //Nguoi nhan
		"amount": a,
		});

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow'
		};

		fetch("https://api.shyft.to/sol/v1/wallet/send_sol", requestOptions)
		.then(async response => {
			let res = await response.json();
			let transaction = toTransaction(res.result.encoded_transaction);
		console.log(res);
			const signedTransaction = await window.phantom.solana.signTransaction(transaction);
			const connection = new solanaWeb3.Connection("https://api.devnet.solana.com");
			const signature = await connection.sendRawTransaction(signedTransaction.serialize());
			console.log("TRANSFER SUCCESSFULLY!!!");
			currentuser.donhang.push({
				"sp": currentuser.products,
				"ngaymua": new Date(),
				"tinhTrang": 'Đang chờ xử lý'
			});
			currentuser.products = [];
			capNhatMoiThu();
			
		})
		.then(result => console.log(result))
		.catch(error => console.log('error', error));
}

function xoaHet() {
	if (currentuser.products.length) {
		if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!')) {
			currentuser.products = [];
			capNhatMoiThu();
		}
	}
}

// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong = soLuongMoi;
		}
	}

	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong++;
		}
	}

	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			if (p.soluong > 1) {
				p.soluong--;
			} else {
				return;
			}
		}
	}

	capNhatMoiThu();
}

function capNhatMoiThu() { // Mọi thứ
	animateCartNumber();

	// cập nhật danh sách sản phẩm trong localstorage
	setCurrentUser(currentuser);
	updateListUser(currentuser);

	// cập nhật danh sách sản phẩm ở table
	addProductToTable(currentuser);

	// Cập nhật trên header
	capNhat_ThongTin_CurrentUser();
}

