/* script.js - Final Version with Density Control */

// 1. Initial Config
let currentType = 'url';
let currentLogo = null;
let currentBodyShape = "square";
let currentEyeFrame = "square";
let currentEyeBall = "square";
let currentEcc = "H"; 
let currentVersion = 0; // 0 = Auto, ยิ่งเลขเยอะ จุดยิ่งเยอะ (Max 40)

// Config เริ่มต้น
let qrCode = new QRCodeStyling({
    width: 300, 
    height: 300, 
    type: "svg",
    data: "https://www.google.com",
    qrOptions: { 
        errorCorrectionLevel: "H",
        typeNumber: 0 // เริ่มต้นแบบ Auto
    },
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: 0.4 },
    cornersSquareOptions: { type: "square" },
    cornersDotOptions: { type: "square" }
});
qrCode.append(document.getElementById("canvas"));

// --- ฟังก์ชันแก้ภาษาต่างดาว (เหมือนเดิม) ---
function safeThai(str) {
    if (!str) return "";
    try {
        return unescape(encodeURIComponent(str));
    } catch (e) {
        return str;
    }
}

// --- ฟังก์ชันจัดการ Density (แก้ใหม่!) ---
// รับค่า 2 ตัว: ระดับ ECC และ ระดับ Version (ความถี่ยิบของจุด)
function setDensity(ecc, version, element) {
    currentEcc = ecc;
    currentVersion = version;
    
    // จัดการสีปุ่ม
    document.querySelectorAll('.density-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');

    updateQR();
}

// 2. UI Helpers & Tabs (คงเดิม)
function toggleAccordion(id) {
    const content = document.getElementById(id);
    const icon = content.previousElementSibling.querySelector('.fa-plus, .fa-minus');
    if (content.style.display === "block" || content.classList.contains('active')) {
        content.style.display = "none"; content.classList.remove('active');
        if(icon) icon.classList.replace('fa-minus', 'fa-plus');
    } else {
        content.style.display = "block"; content.classList.add('active');
        if(icon) icon.classList.replace('fa-plus', 'fa-minus');
    }
}

function setType(type) {
    currentType = type;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');

    const forms = ['url', 'text', 'email', 'phone', 'sms', 'vcard', 'mecard', 'location', 'facebook', 'twitter', 'youtube', 'wifi', 'event', 'bitcoin'];
    forms.forEach(id => {
        const el = document.getElementById('form-' + id);
        if(el) el.style.display = 'none';
    });

    const selected = document.getElementById('form-' + type);
    if(selected) selected.style.display = 'block';

    updateQR();
}

// 4. Logo Logic (คงเดิม)
function handleLogo(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { currentLogo = e.target.result; updateQR(); };
        reader.readAsDataURL(file);
    }
}
function selectPresetLogo(url) {
    currentLogo = url; document.getElementById('input-logo').value = ""; updateQR();
}
function removeLogo() {
    document.getElementById('input-logo').value = ""; currentLogo = null; updateQR();
}

// 5. Color & Shape Logic (คงเดิม)
function toggleColorMode() {
    const isGradient = document.querySelector('input[name="colorType"]:checked').value === 'gradient';
    const isCustomEye = document.getElementById('chk-custom-eye').checked;
    document.getElementById('mode-single').style.display = isGradient ? 'none' : 'block';
    document.getElementById('mode-gradient').style.display = isGradient ? 'block' : 'none';
    document.getElementById('mode-eye').style.display = isCustomEye ? 'block' : 'none';
    updateQR();
}
function syncColor(type, val) {
    let colorVal = val.toUpperCase();
    if (!colorVal.startsWith("#") && /^[0-9A-F]{3,6}$/i.test(colorVal)) colorVal = "#" + colorVal;
    if(type === 'dots') {
        document.getElementById('color-dots').value = colorVal;
        document.getElementById('text-color-dots').value = colorVal;
    } else if (type === 'bg') {
        document.getElementById('color-bg').value = colorVal;
        document.getElementById('text-color-bg').value = colorVal;
    }
    updateQR();
}
function selectShape(category, shape, element) {
    if (category === 'dots') currentBodyShape = shape;
    if (category === 'eyeFrame') currentEyeFrame = shape;
    if (category === 'eyeBall') currentEyeBall = shape;
    let gridId = (category === 'dots') ? "grid-body" : (category === 'eyeFrame') ? "grid-eye-frame" : "grid-eye-ball";
    Array.from(document.getElementById(gridId).children).forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    updateQR();
}
function updateSizeLabel(val) {
    document.getElementById('size-label').innerText = val + " x " + val + " Px";
}

// 6. MAIN UPDATE FUNCTION
function updateQR() {
    let data = "";
    const withBOM = (str) => safeThai("\uFEFF" + str);

    // --- Data Gathering (เหมือนเดิม) ---
    if (currentType === 'url') {
        data = encodeURI(document.getElementById('input-url').value);
    } 
    else if (currentType === 'text') {
        const val = document.getElementById('input-text').value;
        data = val ? withBOM(val) : "";
    } 
    else if (currentType === 'email') {
        const mail = document.getElementById('email-dest').value;
        const subj = document.getElementById('email-subj').value;
        const body = document.getElementById('email-msg').value;
        data = `mailto:${mail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    }
    else if (currentType === 'phone') {
        data = "tel:" + document.getElementById('phone-tel').value;
    }
    else if (currentType === 'sms') {
        const tel = document.getElementById('sms-tel').value;
        const msg = document.getElementById('sms-msg').value;
        data = `SMSTO:${tel}:${encodeURIComponent(msg)}`;
    }
    else if (currentType === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value;
        const pass = document.getElementById('wifi-pass').value;
        const type = document.getElementById('wifi-type').value;
        const hidden = document.getElementById('wifi-hidden').checked;
        const esc = (t) => t.replace(/([\\;,:])/g, '\\$1');
        data = `WIFI:T:${type};S:${esc(safeThai(ssid))};P:${esc(safeThai(pass))};H:${hidden};`;
    }
    else if (currentType === 'location') {
        const lat = document.getElementById('loc-lat').value;
        const long = document.getElementById('loc-long').value;
        data = `geo:${lat},${long}`;
    }
    else if (currentType === 'facebook') {
        data = encodeURI(document.getElementById('fb-url').value);
    }
    else if (currentType === 'twitter') {
        const isUrl = document.querySelector('input[name="tw-type"]:checked').value === 'url';
        const val = document.getElementById('tw-input').value;
        if(!isUrl) {
             document.getElementById('tw-label').innerText = "Tweet Content";
             data = `https://twitter.com/intent/tweet?text=${encodeURIComponent(val)}`;
        } else {
             document.getElementById('tw-label').innerText = "Twitter URL";
             data = encodeURI(val);
        }
    }
    else if (currentType === 'youtube') {
        data = encodeURI(document.getElementById('yt-url').value);
    }
    else if (currentType === 'vcard') {
        const vCardVer = document.querySelector('input[name="vcard-ver"]:checked').value;
        const fname = document.getElementById('v-fname').value;
        const lname = document.getElementById('v-lname').value;
        const org = document.getElementById('v-org').value;
        const title = document.getElementById('v-title').value;
        const phoneWork = document.getElementById('v-phone-work').value;
        const phonePrivate = document.getElementById('v-phone-private').value;
        const phoneMobile = document.getElementById('v-phone-mobile').value;
        const email = document.getElementById('v-email').value;
        const web = document.getElementById('v-website').value;
        const street = document.getElementById('v-street').value;
        const city = document.getElementById('v-city').value;
        const state = document.getElementById('v-state').value;
        const zip = document.getElementById('v-zip').value;
        const country = document.getElementById('v-country').value;
        
        let vcardData = `BEGIN:VCARD\nVERSION:${vCardVer}\n`;
        vcardData += `N;CHARSET=UTF-8:${lname};${fname};;;\n`;
        vcardData += `FN;CHARSET=UTF-8:${fname} ${lname}\n`;
        if(org) vcardData += `ORG;CHARSET=UTF-8:${org}\n`;
        if(title) vcardData += `TITLE;CHARSET=UTF-8:${title}\n`;
        if(phoneWork) vcardData += `TEL;WORK;VOICE:${phoneWork}\n`;
        if(phonePrivate) vcardData += `TEL;HOME;VOICE:${phonePrivate}\n`;
        if(phoneMobile) vcardData += `TEL;CELL:${phoneMobile}\n`;
        if(email) vcardData += `EMAIL;INTERNET:${email}\n`;
        if(web) vcardData += `URL:${web}\n`;
        if(street || city || country) {
            vcardData += `ADR;CHARSET=UTF-8:;;${street};${city};${state};${zip};${country}\n`;
        }
        vcardData += `END:VCARD`;
        
        data = withBOM(vcardData);
    }
    else if (currentType === 'mecard') {
        const name = safeThai(document.getElementById('m-name').value);
        const lname = safeThai(document.getElementById('m-lname').value);
        const nick = safeThai(document.getElementById('m-nick').value);
        const phone1 = document.getElementById('m-phone1').value;
        const email = document.getElementById('m-email').value;
        const web = document.getElementById('m-web').value;
        
        let bd = document.getElementById('m-bd').value; 
        if(bd) bd = bd.replace(/-/g, "");

        const street = safeThai(document.getElementById('m-street').value);
        const city = safeThai(document.getElementById('m-city').value);
        const state = safeThai(document.getElementById('m-state').value);
        const zip = document.getElementById('m-zip').value;
        const country = safeThai(document.getElementById('m-country').value);
        const note = safeThai(document.getElementById('m-note').value);

        let addr = "";
        if(street || city || state || zip || country) {
            addr = [street, city, state, zip, country].filter(Boolean).join(", ");
        }

        data = withBOM(`MECARD:N:${lname},${name};NICKNAME:${nick};TEL:${phone1};EMAIL:${email};URL:${web};BDAY:${bd};ADR:${addr};NOTE:${note};;`);
    }
    else if (currentType === 'event') {
        const title = safeThai(document.getElementById('evt-title').value);
        let start = document.getElementById('evt-start').value;
        let end = document.getElementById('evt-end').value;
        const loc = safeThai(document.getElementById('evt-loc').value);
        let desc = safeThai(document.getElementById('evt-desc').value);

        if(start) start = start.replace(/[-:]/g, "") + "00";
        if(end) end = end.replace(/[-:]/g, "") + "00";
        desc = desc.replace(/\r?\n/g, "\\n");

        let eventData = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QR Generator//EN\nBEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT\nEND:VCALENDAR`;
        
        data = withBOM(eventData);
    }
    else if (currentType === 'bitcoin') {
        const type = document.querySelector('input[name="crypto-type"]:checked').value;
        const addr = document.getElementById('btc-addr').value;
        const amt = document.getElementById('btc-amount').value;
        const msg = document.getElementById('btc-msg').value;
        let prefix = (type === 'bch') ? "bitcoincash" : (type === 'eth') ? "ethereum" : (type === 'ltc') ? "litecoin" : "bitcoin";
        data = `${prefix}:${addr}?amount=${amt}&message=${encodeURIComponent(msg)}`;
    }

    // --- Styling Logic ---
    const isGradient = document.querySelector('input[name="colorType"]:checked').value === 'gradient';
    const isCustomEye = document.getElementById('chk-custom-eye').checked;
    const colorBg = document.getElementById('color-bg').value;
    
    let dotsOptionsObj = { type: currentBodyShape };
    if (isGradient) {
        dotsOptionsObj.gradient = {
            type: 'linear',
            rotation: parseInt(document.getElementById('grad-rotation').value) * (Math.PI / 180),
            colorStops: [
                { offset: 0, color: document.getElementById('grad-start').value },
                { offset: 1, color: document.getElementById('grad-end').value }
            ]
        };
        dotsOptionsObj.color = undefined;
    } else {
        dotsOptionsObj.color = document.getElementById('color-dots').value;
        dotsOptionsObj.gradient = null;
    }

    let cornersSquareObj = { type: currentEyeFrame };
    let cornersDotObj = { type: currentEyeBall };
    if (isCustomEye) {
        cornersSquareObj.color = document.getElementById('color-eye-frame').value;
        cornersDotObj.color = document.getElementById('color-eye-dot').value;
    } else {
        cornersSquareObj.color = undefined; cornersDotObj.color = undefined;
    }

    // UPDATE: ใส่ typeNumber เพื่อบังคับความหนาแน่น
    qrCode.update({
        data: data,
        qrOptions: { 
            errorCorrectionLevel: currentEcc,
            typeNumber: currentVersion  // <-- จุดสำคัญ: บังคับ Version ที่นี่
        },
        dotsOptions: dotsOptionsObj,
        backgroundOptions: { color: colorBg },
        cornersSquareOptions: cornersSquareObj,
        cornersDotOptions: cornersDotObj,
        image: currentLogo
    });
}

function downloadQR() {
    const size = document.getElementById('size-slider').value;
    qrCode.update({ width: parseInt(size), height: parseInt(size) });
    qrCode.download({ name: "my-qr-code", extension: "png" });
    setTimeout(() => { qrCode.update({ width: 300, height: 300 }); }, 500);
}

// 7. Dictionary (ส่วนสุดท้าย)
const translations = {
    en: {
        subtitle: "THE 100% FREE QR CODE GENERATOR",
        about: "ABOUT",
        tab_url: "URL", tab_text: "TEXT", tab_email: "EMAIL", tab_phone: "PHONE", tab_sms: "SMS",
        tab_vcard: "VCARD", tab_mecard: "MECARD", tab_location: "LOCATION", tab_facebook: "FACEBOOK",
        tab_twitter: "TWITTER", tab_youtube: "YOUTUBE", tab_wifi: "WIFI", tab_event: "EVENT", tab_bitcoin: "BITCOIN",
        sec_content: "ENTER CONTENT", sec_colors: "SET COLORS", sec_logo: "ADD LOGO IMAGE", sec_design: "CUSTOMIZE DESIGN",
        lbl_url: "Your URL", lbl_text: "Your Text", lbl_email: "Email", lbl_subject: "Subject", lbl_message: "Message",
        lbl_phone_num: "Your Phone Number", lbl_fname: "Firstname", lbl_lname: "Lastname", lbl_org: "Organization",
        lbl_position: "Position", lbl_phone_work: "Phone (Work)", lbl_phone_private: "Phone (Private)", lbl_mobile: "Mobile",
        lbl_fax: "Fax", lbl_website: "Website", lbl_street: "Street", lbl_city: "City", lbl_zip: "Zipcode", lbl_state: "State",
        lbl_country: "Country", lbl_nickname: "Nickname", lbl_phone: "Phone", lbl_birthday: "Birthday", lbl_notes: "Notes",
        lbl_lat: "Latitude", lbl_long: "Longitude", lbl_ssid: "Wireless SSID", lbl_password: "Password", lbl_encryption: "Encryption",
        lbl_event_title: "Event Title", lbl_start: "Start Time", lbl_end: "End Time", lbl_location: "Location", lbl_desc: "Description",
        lbl_crypto: "Cryptocurrency", lbl_address: "Address", lbl_amount: "Amount",
        lbl_foreground: "Foreground Color", lbl_background: "Background Color", lbl_main_color: "Main Color",
        opt_single: "Single Color", opt_gradient: "Gradient", opt_eye: "Custom Eye Color",
        lbl_start_c: "Start Color", lbl_end_c: "End Color",
        lbl_frame: "Eye Frame", lbl_ball: "Eye Ball",
        lbl_upload: "Upload Image", btn_remove: "Remove Logo",
        lbl_body: "Body Shape", lbl_quality: "Quality / Block Size",
        lbl_low_q: "Low Quality", lbl_high_q: "High Quality", btn_download: "Download PNG"
    },
    th: {
        subtitle: "เครื่องมือสร้าง QR CODE ฟรี 100%",
        about: "เกี่ยวกับเรา",
        tab_url: "ลิงก์", tab_text: "ข้อความ", tab_email: "อีเมล", tab_phone: "เบอร์โทร", tab_sms: "SMS",
        tab_vcard: "นามบัตร", tab_mecard: "MeCard", tab_location: "พิกัด", tab_facebook: "เฟสบุ๊ค",
        tab_twitter: "ทวิตเตอร์", tab_youtube: "ยูทูป", tab_wifi: "ไวไฟ", tab_event: "อีเว้นท์", tab_bitcoin: "บิตคอยน์",
        sec_content: "ใส่ข้อมูล", sec_colors: "กำหนดสี", sec_logo: "เพิ่มโลโก้", sec_design: "ปรับแต่งรูปแบบ",
        lbl_url: "ลิงก์เว็บไซต์", lbl_text: "ข้อความของคุณ", lbl_email: "อีเมล", lbl_subject: "หัวข้อ", lbl_message: "ข้อความ",
        lbl_phone_num: "เบอร์โทรศัพท์", lbl_fname: "ชื่อจริง", lbl_lname: "นามสกุล", lbl_org: "องค์กร/บริษัท",
        lbl_position: "ตำแหน่ง", lbl_phone_work: "เบอร์โทร (งาน)", lbl_phone_private: "เบอร์โทร (ส่วนตัว)", lbl_mobile: "เบอร์มือถือ",
        lbl_fax: "แฟกซ์", lbl_website: "เว็บไซต์", lbl_street: "ถนน/ที่อยู่", lbl_city: "เมือง/เขต", lbl_zip: "รหัสไปรษณีย์", lbl_state: "จังหวัด/รัฐ",
        lbl_country: "ประเทศ", lbl_nickname: "ชื่อเล่น", lbl_phone: "เบอร์โทร", lbl_birthday: "วันเกิด", lbl_notes: "บันทึก",
        lbl_lat: "ละติจูด", lbl_long: "ลองจิจูด", lbl_ssid: "ชื่อไวไฟ (SSID)", lbl_password: "รหัสผ่าน", lbl_encryption: "การเข้ารหัส",
        lbl_event_title: "ชื่อกิจกรรม", lbl_start: "เวลาเริ่ม", lbl_end: "เวลาสิ้นสุด", lbl_location: "สถานที่", lbl_desc: "รายละเอียด",
        lbl_crypto: "สกุลเงิน", lbl_address: "ที่อยู่กระเป๋าเงิน", lbl_amount: "จำนวน",
        lbl_foreground: "สีของ QR Code", lbl_background: "สีพื้นหลัง", lbl_main_color: "สีหลัก",
        opt_single: "สีเดียว", opt_gradient: "ไล่เฉดสี", opt_eye: "กำหนดสีตา (Eye Color)",
        lbl_start_c: "สีเริ่มต้น", lbl_end_c: "สีสิ้นสุด",
        lbl_frame: "กรอบตา", lbl_ball: "ลูกตาดำ",
        lbl_upload: "อัปโหลดรูปภาพ", btn_remove: "ลบรูป",
        lbl_body: "รูปร่างจุด", lbl_quality: "ความละเอียด",
        lbl_low_q: "คุณภาพต่ำ", lbl_high_q: "คุณภาพสูง", btn_download: "ดาวน์โหลด PNG"
    }
};

function changeLanguage(lang) {
    const langLabel = document.getElementById('current-lang');
    if(langLabel) langLabel.innerText = (lang === 'th') ? 'ไทย' : 'ENGLISH';

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });
}