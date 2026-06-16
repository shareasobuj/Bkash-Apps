// কোর অ্যাপ্লিকেশন মেমোরি ডাটাবেস
let walletBalance = 5000.00; 
let isBalanceVisible = false;

// ট্যাপ অ্যান্ড হোল্ড ইঞ্জিনের গ্লোবাল টাইমার ট্র্যাকার
let holdTimer = null;
const holdDuration = 3000; // ঠিক ৩ সেকেন্ড বা ৩০০০ মিলি-সেকেন্ড

// ==================== AUTO-LOGIN LOGIC (SIGN-UP BYPASS) ====================
document.addEventListener('DOMContentLoaded', () => {
    // নিউমেরিক ফিল্টার এক্টিভেশন
    const numericInputs = document.querySelectorAll('.input-numeric-only');
    numericInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
    
    // ট্যাপ-হোল্ড বাটনের সাথে মাউস ও টাচ ইভেন্ট লিসেনার যুক্ত করা
    const holdTriggerBtn = document.getElementById('main-holding-trigger');
    if(holdTriggerBtn) {
        holdTriggerBtn.addEventListener('mousedown', startHold);
        holdTriggerBtn.addEventListener('mouseup', cancelHold);
        holdTriggerBtn.addEventListener('mouseleave', cancelHold);
        holdTriggerBtn.addEventListener('touchstart', startHold, { passive: false });
        holdTriggerBtn.addEventListener('touchend', cancelHold);
    }

    // অটো-লগইন ইঞ্জিন চেক
    const storedUser = localStorage.getItem('bkash_user');
    if (storedUser) {
        // যদি ডাটাবেজে ইউজার একাউন্ট থাকে, সরাসরি ড্যাশবোর্ড লোড হবে (সাইন আপ সম্পূর্ণ স্কিপ)
        const userObj = JSON.parse(storedUser);
        openDashboard(userObj.name);
    } else {
        // যদি একদম নতুন ইউজার হয়, তবেই কেবল ফার্স্ট টাইম সাইন-আপ উইন্ডো দেখাবে
        document.getElementById('signup-screen').classList.remove('hidden');
    }
});

// ১. রেজিস্ট্রেশন কন্ট্রোলার মডিউল
function handleSignUp(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pin = document.getElementById('reg-pin').value.trim();

    if (!name || phone.length !== 11 || pin.length !== 5) {
        alert("❌ তথ্য ভুল! নাম, ১১ ডিজিটের মোবাইল নম্বর এবং ৫ ডিজিটের পিন দিন।");
        return;
    }

    const userData = { name: name, phone: phone, pin: pin };
    localStorage.setItem('bkash_user', JSON.stringify(userData));

    alert("🎉 সাইন-আপ সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে।");
    openDashboard(name);
}

// ২. সিকিউর পিন লগইন ভ্যালিডেশন
function handleLogin(e) {
    if (e) e.preventDefault();

    const loginPin = document.getElementById('login-pin').value.trim();
    const storedUser = localStorage.getItem('bkash_user');
    const userObj = JSON.parse(storedUser);

    if (loginPin === userObj.pin) {
        openDashboard(userObj.name);
    } else {
        alert("❌ ভুল বিকাশ পিন! আবার চেষ্টা করুন।");
    }
}

function openDashboard(userName) {
    document.getElementById('user-name-display').textContent = userName;
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-workspace').classList.remove('hidden');
}

// ৩. ব্যালেন্স ট্যাপ অ্যান্ড হাইড রিভিল ইঞ্জিন
document.getElementById('balance-tap-box').addEventListener('click', () => {
    if (isBalanceVisible) return;

    isBalanceVisible = true;
    const balanceTextNode = document.getElementById('balance-text-node');
    const balanceStatusBtn = document.getElementById('balance-status-btn');

    balanceTextNode.textContent = `৳ ${walletBalance.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}`;
    balanceTextNode.classList.add('text-yellow-300');
    balanceStatusBtn.innerHTML = `<i class="fa-solid fa-lock"></i> সুরক্ষিত`;

    setTimeout(() => {
        isBalanceVisible = false;
        balanceTextNode.textContent = "৳ ••••••";
        balanceTextNode.classList.remove('text-yellow-300');
        balanceStatusBtn.innerHTML = `<i class="fa-solid fa-circle-dot"></i> ব্যালেন্স দেখুন`;
    }, 3500);
});

// ৪. মাল্টি-ফিচার ডাইনামিক সার্ভিস গেটওয়ে (১০টি এডভান্সড মডিউল)
function triggerService(type) {
    document.getElementById('action-modal').classList.remove('hidden');
    document.getElementById('current-action-type').value = type;
    
    // ফিল্ড রি-সেট
    document.getElementById('target-field-wrapper').classList.remove('hidden');
    document.getElementById('form-target-number').value = "";
    document.getElementById('form-amount').value = "";
    document.getElementById('form-secure-pin').value = "";

    const actionSchemas = {
        sendMoney: { title: "সেন্ড মানি", label: "প্রাপকের বিকাশ অ্যাকাউন্ট নম্বর", placeholder: "১১ ডিজিটের নম্বর" },
        recharge: { title: "মোবাইল রিচার্জ", label: "মোবাইল নম্বরটি লিখুন", placeholder: "১১ ডিজিটের নম্বর" },
        cashOut: { title: "ক্যাশ আউট", label: "এজেন্ট নম্বরটি ইনপুট করুন", placeholder: "১১ ডিজিটের এজেন্ট নম্বর" },
        payment: { title: "মার্চেন্ট পেমেন্ট", label: "মার্চেন্ট পেমেন্ট নম্বর দিন", placeholder: "মার্চেন্ট নম্বর" },
        addMoney: { title: "অ্যাড মানি (Bank/Card)", label: "ব্যাংক অ্যাকাউন্ট অথবা কার্ড নম্বর", placeholder: "১৬ ডিজিটের কার্ড বা ব্যাংক এসি নম্বর" },
        utilityBill: { title: "পে বিল (বিদ্যুৎ বিল)", label: "গ্রাহক হিসাব নম্বর (SMS Account No)", placeholder: "যেমন: ১০৩XXXXXXXX" },
        getLoan: { title: "বিকাশ লোন (City Bank)", label: "লোন স্যাঙ্কশন আইডি / এনআইডি নম্বর", placeholder: "জাতীয় পরিচয়পত্র নম্বর দিন" },
        dpsSavings: { title: "সেভিংস / DPS স্কিম", label: "মনোনীত ব্যাংক পার্টনার (IDLC/Mutual)", placeholder: "যেমন: IDLC Savings" },
        remittance: { title: "বৈদেশিক রেমিট্যান্স", label: "রেমিট্যান্স পিন কোড (MTCN)", placeholder: "১০-১২ ডিজিটের সিক্রেট ট্রানজেকশন পিন" },
        donation: { title: "বিকাশ দান (Donation)", label: "প্রতিষ্ঠানের নাম (যেমন: বিদ্যানন্দ/আস-সুন্নাহ)", placeholder: "অর্গানাইজেশন কোড বা নাম" }
    };

    document.getElementById('modal-title-text').textContent = actionSchemas[type].title;
    document.getElementById('dynamic-input-label').textContent = actionSchemas[type].label;
    document.getElementById('form-target-number').placeholder = actionSchemas[type].placeholder;
    
    // বিশেষ কাস্টমাইজেশন: লোনের ক্ষেত্রে ব্যালেন্স চেক উল্টো এবং ইনপুট টেক্সট মডিফিকেশন
    if(type === 'getLoan') {
        document.getElementById('dynamic-amount-label').textContent = "আবেদনের পরিমাণ (সর্বোচ্চ ৳২০,০০০)";
        document.getElementById('form-amount').placeholder = "৳ লোন অ্যামাউন্ট লিখুন";
    } else if(type === 'addMoney') {
        document.getElementById('dynamic-amount-label').textContent = "অ্যাড মানির পরিমাণ (৳)";
        document.getElementById('form-amount').placeholder = "৳ টাকার পরিমাণ";
    } else {
        document.getElementById('dynamic-amount-label').textContent = "টাকার পরিমাণ (৳)";
        document.getElementById('form-amount').placeholder = "৳ সর্বনিম্ন ১০ টাকা";
    }
}

function closeActionModal() {
    document.getElementById('action-modal').classList.add('hidden');
}

// ==================== TAP & HOLD LOGIC ENGINE ====================
function startHold(e) {
    if (e) e.preventDefault();
    
    const actionType = document.getElementById('current-action-type').value;
    const targetNum = document.getElementById('form-target-number').value.trim();
    const amountValue = parseFloat(document.getElementById('form-amount').value);
    const inputPin = document.getElementById('form-secure-pin').value.trim();
    const storedUser = JSON.parse(localStorage.getItem('bkash_user'));

    if (!storedUser || inputPin !== storedUser.pin) {
        alert("❌ পিন নম্বর ভুল! লেনদেন বাতিল করা হয়েছে।");
        cancelHold();
        return;
    }
    if (!targetNum || isNaN(amountValue) || amountValue < 10) {
        alert("❌ সঠিক তথ্য এবং নূন্যতম ১০ টাকা প্রদান করুন।");
        cancelHold();
        return;
    }
    
    // লোন ও অ্যাড মানি বাদে অন্য ফিচারের জন্য সাধারণ ব্যালেন্স চেক
    if (actionType !== 'getLoan' && actionType !== 'addMoney' && amountValue > walletBalance) {
        alert("❌ পর্যাপ্ত ব্যালেন্স নেই!");
        cancelHold();
        return;
    }
    
    if (actionType === 'getLoan' && amountValue > 20000) {
        alert("❌ দুঃখিত! আপনি সর্বোচ্চ ২০,০০০ টাকা পর্যন্ত লোনের জন্য যোগ্য।");
        cancelHold();
        return;
    }

    document.getElementById('tap-hold-box').classList.add('holding');
    document.getElementById('hold-instruction-text').innerHTML = `<span class="text-orange-500 font-bold animate-pulse">প্রসেস হচ্ছে, চেপে ধরে রাখুন...</span>`;

    holdTimer = setTimeout(() => {
        executeFinalTransaction(actionType, targetNum, amountValue);
    }, holdDuration);
}

function cancelHold() {
    clearTimeout(holdTimer);
    document.getElementById('tap-hold-box').classList.remove('hidden') && document.getElementById('tap-hold-box').classList.remove('holding');
    document.getElementById('hold-instruction-text').innerHTML = `নিশ্চিত করতে বোতামটি <span class="text-[#E2136E]">চেপে ধরে রাখুন</span>`;
}

function executeFinalTransaction(actionType, targetNum, amountValue) {
    clearTimeout(holdTimer);
    document.getElementById('tap-hold-box').classList.remove('holding');
    
    // ব্যালেন্স ক্যালকুলেশন ইঞ্জিন (লোন এবং অ্যাড মানি অ্যাকাউন্টে যোগ হবে, বাকিগুলো বিয়োগ হবে)
    let isCredit = false;
    if (actionType === 'getLoan' || actionType === 'addMoney') {
        walletBalance += amountValue;
        isCredit = true;
    } else {
        walletBalance -= amountValue;
    }

    if (isBalanceVisible) {
        document.getElementById('balance-text-node').textContent = `৳ ${walletBalance.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}`;
    }

    // ফিচার স্ট্রিং ডিক্লেয়ারেশন
    const serviceStrings = { 
        sendMoney: "সেন্ড মানি", recharge: "মোবাইল রিচার্জ", cashOut: "ক্যাশ আউট", 
        payment: "পেমেন্ট", addMoney: "অ্যাড মানি", utilityBill: "বিদ্যুৎ বিল", 
        getLoan: "বিকাশ লোন", dpsSavings: "DPS সেভিংস", remittance: "রেমিট্যান্স", donation: "দান ফান্ড" 
    };
    
    const trxIdGenerated = "BK" + Math.random().toString(36).substr(2, 7).toUpperCase();

    // ট্রানজেকশন হিস্ট্রি রো মেকার
    const logRow = document.createElement('div');
    logRow.className = "flex justify-between items-center p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm";
    
    const iconClass = isCredit ? "bg-green-100 text-green-600 fa-arrow-down" : "bg-red-100 text-red-500 fa-arrow-up-right-from-square";
    const amountSign = isCredit ? `+৳${amountValue.toFixed(2)}` : `-৳${amountValue.toFixed(2)}`;
    const amountColor = isCredit ? "text-green-600" : "text-red-500";

    logRow.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 ${iconClass.split(' ')[0]} ${iconClass.split(' ')[1]} rounded-xl flex items-center justify-center text-sm"><i class="fa-solid ${iconClass.split(' ')[2]}"></i></div>
            <div>
                <p class="text-xs font-bold text-gray-800">${serviceStrings[actionType]} (${targetNum})</p>
                <p class="text-[9px] text-gray-400">এখনই • TrxID: ${trxIdGenerated}</p>
            </div>
        </div>
        <span class="text-xs font-black ${amountColor}">${amountSign}</span>
    `;
    
    const container = document.getElementById('transaction-log-container');
    container.insertBefore(logRow, container.firstChild);

    // সাকসেস ইউজার ইন্টারফেস ফিডব্যাক
    const holdTriggerBtn = document.getElementById('main-holding-trigger');
    holdTriggerBtn.innerHTML = `<i class="fa-solid fa-check text-2xl"></i>`;
    holdTriggerBtn.style.backgroundColor = "#22c55e"; 
    document.getElementById('hold-instruction-text').innerHTML = `<span class="text-green-500 font-bold">🎉 লেনদেন সফল হয়েছে!</span>`;

    setTimeout(() => {
        closeActionModal();
        holdTriggerBtn.innerHTML = `<i class="fa-solid fa-arrow-right text-xl"></i>`;
        holdTriggerBtn.style.backgroundColor = "#E2136E";
        document.getElementById('hold-instruction-text').innerHTML = `নিশ্চিত করতে বোতামটি <span class="text-[#E2136E]">চেপে ধরে রাখুন</span>`;
    }, 1500);
}

// ওয়ান-ক্লিক মেমোরি ফ্ল্যাশ (অন্য অ্যাকাউন্ট দিয়ে টেস্ট করার জন্য)
function resetAppMemory() {
    if(confirm("আপনি কি নিশ্চিত যে বর্তমান অ্যাকাউন্ট ডাটা ব্রাউজার থেকে মুছে ফেলবেন?")) {
        localStorage.clear();
        location.reload();
    }
}

function goToLoginScreen() {
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function goToSignUpScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('signup-screen').classList.remove('hidden');
}

function logout() {
    document.getElementById('app-workspace').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-pin').value = "";
    
    const storedUser = localStorage.getItem('bkash_user');
    if (storedUser) {
        const userObj = JSON.parse(storedUser);
        document.getElementById('login-phone').value = userObj.phone;
    }
}

function toggleInbox() {
    document.getElementById('inbox-panel').classList.toggle('hidden');
}

function navSwitch(target) {
    if (target === 'statement') {
        document.getElementById('statement-anchor').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('main-scroll-view').scrollTo({ top: 0, behavior: 'smooth' });
    }
        }
