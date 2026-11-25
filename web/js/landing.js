const form = document.querySelector('#visit-form');
const phone = '573144733375';
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const message = `Hola ConstruServicio, soy ${data.name}. Necesito una visita técnica en ${data.location}. Electrodoméstico: ${data.appliance}. Falla: ${data.issue}`;
  window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
});
document.querySelector('.menu-toggle').addEventListener('click', () => document.querySelector('.nav-links').classList.toggle('open'));
