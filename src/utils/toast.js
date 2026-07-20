// Imperative DOM toast — shared between the map and unit pages so both
// get identical bottom-right feedback bubbles.
export function showToast(message, icon = 'fa-bell') {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 right-6 bg-[#1A1A2E] border border-white/10 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-[60] transition-all duration-500 translate-y-4 opacity-0 flex items-center gap-2.5';
  toast.innerHTML = `<i class="fa-solid ${icon} text-purple"></i> <span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.remove('translate-y-4', 'opacity-0'); });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 500);
  }, 3800);
}
