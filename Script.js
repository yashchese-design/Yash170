// DOM Elements
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const lengthSpan = document.getElementById('length');
const charTypesSpan = document.getElementById('charTypes');
const suggestionsDiv = document.getElementById('suggestions');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const commonPasswordWarning = document.getElementById('commonPassword');

// Requirements
const requirements = {
    length: document.getElementById('req-length'),
    uppercase: document.getElementById('req-uppercase'),
    lowercase: document.getElementById('req-lowercase'),
    number: document.getElementById('req-number'),
    special: document.getElementById('req-special')
};

// Common weak passwords
const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', '111111', 'iloveyou', 'master',
    'sunshine', 'ashley', 'bailey', 'shadow', '123123', '654321', 'superman'
];

// Character sets
const charSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Event Listeners
passwordInput.addEventListener('input', checkPassword);
toggleBtn.addEventListener('click', togglePasswordVisibility);
copyBtn.addEventListener('click', copyToClipboard);
generateBtn.addEventListener('click', generatePassword);

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Check password strength
function checkPassword() {
    const password = passwordInput.value;
    
    if (password.length === 0) {
        resetUI();
        return;
    }

    lengthSpan.textContent = password.length;

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};:'\"|,.<>?]/.test(password)
    };

    updateRequirements(checks);
    const strength = calculateStrength(password, checks);
    updateStrengthDisplay(strength);
    updateCharTypes(checks);
    generateSuggestions(password, checks);
    checkCommonPassword(password);

    copyBtn.style.display = strength.score >= 60 ? 'flex' : 'none';
}

function updateRequirements(checks) {
    for (const [key, value] of Object.entries(checks)) {
        if (requirements[key]) {
            if (value) {
                requirements[key].classList.add('met');
            } else {
                requirements[key].classList.remove('met');
            }
        }
    }
}

function calculateStrength(password, checks) {
    let score = 0;

    if (checks.length) score += 20;
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.number) score += 15;
    if (checks.special) score += 20;

    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 15;

    const charTypes = Object.values(checks).filter(Boolean).length;
    if (charTypes === 5) score += 10;

    if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password)) score -= 10;
    if (/^[0-9]+$/.test(password)) score -= 15;
    if (/(.){3,}/.test(password)) score -= 10;

    score = Math.max(0, Math.min(100, score));

    let level = 'very-weak';
    if (score >= 80) level = 'very-strong';
    else if (score >= 60) level = 'strong';
    else if (score >= 50) level = 'good';
    else if (score >= 35) level = 'fair';
    else if (score >= 20) level = 'weak';

    return { score, level };
}

function updateStrengthDisplay(strength) {
    strengthBar.style.width = strength.score + '%';
    strengthBar.className = 'strength-bar ' + strength.level;
    strengthText.className = 'strength-text ' + strength.level;
    
    const levels = {
        'very-weak': '❌ Very Weak',
        'weak': '⚠️ Weak',
        'fair': '⚡ Fair',
        'good': '✅ Good',
        'strong': '🔒 Strong',
        'very-strong': '🛡️ Very Strong'
    };

    strengthText.textContent = levels[strength.level] + ` (${strength.score}%)`;
}

function updateCharTypes(checks) {
    const charTypes = Object.values(checks).filter(Boolean).length;
    charTypesSpan.textContent = charTypes;
}

function checkCommonPassword(password) {
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.includes(lowerPassword)) {
        commonPasswordWarning.style.display = 'block';
    } else {
        commonPasswordWarning.style.display = 'none';
    }
}

function generateSuggestions(password, checks) {
    const suggestions = [];

    if (password.length < 8) {
        suggestions.push('Add more characters');
    }
    if (!checks.uppercase) {
        suggestions.push('Add uppercase letters');
    }
    if (!checks.lowercase) {
        suggestions.push('Add lowercase letters');
    }
    if (!checks.number) {
        suggestions.push('Include numbers');
    }
    if (!checks.special) {
        suggestions.push('Add special characters');
    }

    suggestionsDiv.innerHTML = suggestions
        .slice(0, 3)
        .map(s => `<div class="suggestion-item">${s}</div>`)
        .join('');
}

function resetUI() {
    strengthBar.style.width = '0%';
    strengthBar.className = 'strength-bar';
    strengthText.textContent = 'Enter a password to check strength';
    strengthText.className = 'strength-text';
    lengthSpan.textContent = '0';
    charTypesSpan.textContent = '0';
    suggestionsDiv.innerHTML = '';
    copyBtn.style.display = 'none';
    commonPasswordWarning.style.display = 'none';

    for (const req of Object.values(requirements)) {
        req.classList.remove('met');
    }
}

function copyToClipboard() {
    const password = passwordInput.value;
    
    navigator.clipboard.writeText(password).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.textContent = '✅ Copied!';
        
        if (navigator.vibrate) {
            navigator.vibrate([20, 10, 20]);
        }
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function generatePassword() {
    const length = 16;
    let password = '';
    
    password += charSets.lowercase[Math.floor(Math.random() * charSets.lowercase.length)];
    password += charSets.uppercase[Math.floor(Math.random() * charSets.uppercase.length)];
    password += charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)];
    password += charSets.special[Math.floor(Math.random() * charSets.special.length)];
    
    const allChars = charSets.lowercase + charSets.uppercase + charSets.numbers + charSets.special;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    passwordInput.value = password;
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
    
    checkPassword();
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    passwordInput.select();
}
