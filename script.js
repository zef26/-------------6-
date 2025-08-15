// -------- Settings (edit in one place) --------
const PHONE = ''; // e.g. '(555) 987-6543' — leave empty until you’re ready

// Pixel helper events (использует fbq из HTML)
function track(event, data = {}) {
  try {
    fbq('trackCustom', event, data);
  } catch (e) {}
}

// -------- Mobile-safe quiz logic --------
const steps = Array.from(document.querySelectorAll('.step'));
const bar = document.getElementById('bar');
const resultGood = document.getElementById('resultGood');
const resultBad = document.getElementById('resultBad');
const callBtn = document.getElementById('callBtn');
const callNumber = document.getElementById('callNumber');

function showStep(i) {
  steps.forEach((s, idx) => (s.hidden = idx !== i));
  bar.style.width = Math.min(100, Math.round(i / steps.length * 100)) + '%';
  resultGood.style.display = 'none';
  resultBad.style.display = 'none';
  if (i === 0) track('QuizStarted');
  syncButtons();
}

// enable/disable buttons based on selection
function syncButtons() {
  steps.forEach(step => {
    const action = step.querySelector('#next1, #next2, #done3');
    if (!action) return;
    const answered = step.querySelector('input[type="radio"]:checked');
    action.disabled = !answered;
  });
}

// bind change + pointerup for robust mobile selection
document.querySelectorAll('input[type="radio"]').forEach(input => {
  input.addEventListener('change', syncButtons);
  input.addEventListener(
    'pointerup',
    () => {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { passive: true }
  );
});

// navigation
document.getElementById('next1').addEventListener('click', () => {
  const inUS = document.querySelector('input[name="inUS"]:checked')?.value;
  if (inUS === 'no') {
    resultBad.style.display = 'block';
    track('QuizCompleted', { status: 'disqualified' });
    resultBad.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  showStep(1);
});
document.getElementById('back2').addEventListener('click', () => showStep(0));
document.getElementById('next2').addEventListener('click', () => showStep(2));
document.getElementById('back3').addEventListener('click', () => showStep(1));

document.getElementById('done3').addEventListener('click', () => {
  const veh = document.querySelector('input[name="veh"]:checked')?.value;
  const insured = document.querySelector('input[name="insured"]:checked')?.value;
  const okVeh = ['2013plus', '2008-2012'].includes(veh);
  const okIns = insured === 'yes'; // networks prefer insured

  if (okVeh && okIns) {
    if (PHONE) {
      callNumber.textContent = PHONE;
      callBtn.onclick = () => {
        track('CallClick', { phone: PHONE });
        window.location.href = 'tel:' + PHONE.replace(/[^0-9+]/g, '');
      };
    } else {
      callNumber.textContent = 'Add your business phone';
      callBtn.onclick = () =>
        alert('Please set your phone number in the code: const PHONE = "(555) 987-6543"');
    }
    resultGood.style.display = 'block';
    track('QuizCompleted', { status: 'qualified' });
    resultGood.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    resultBad.style.display = 'block';
    track('QuizCompleted', { status: 'disqualified' });
    resultBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// CTA scroll
document.getElementById('startQuizBtn').addEventListener('click', () => {
  document.getElementById('quizCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// year in footer
document.getElementById('yr').textContent = new Date().getFullYear();

// init
showStep(0);
