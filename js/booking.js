const client = window.supabaseClient;

const ui = {
  authPanel: document.getElementById('auth-panel'),
  dashboard: document.getElementById('client-dashboard'),
  authMsg: document.getElementById('auth-msg'),
  bookingMsg: document.getElementById('booking-msg'),
  appointmentsList: document.getElementById('appointments-list'),
  userEmail: document.getElementById('user-email')
};

async function signUp(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value;
  const password = form.password.value;

  const { error } = await client.auth.signUp({ email, password });
  ui.authMsg.innerHTML = error
    ? `<div class="notice error">${error.message}</div>`
    : '<div class="notice success">Conta criada! Verifique o e-mail para confirmar o registo.</div>';
}

async function signIn(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value;
  const password = form.password.value;

  const { error } = await client.auth.signInWithPassword({ email, password });
  ui.authMsg.innerHTML = error
    ? `<div class="notice error">${error.message}</div>`
    : '<div class="notice success">Sessão iniciada com sucesso.</div>';
}

async function resetPassword(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value;
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/cliente.html`
  });

  ui.authMsg.innerHTML = error
    ? `<div class="notice error">${error.message}</div>`
    : '<div class="notice success">Email de recuperação enviado.</div>';
}

async function loadAppointments() {
  const { data, error } = await client
    .from('appointments')
    .select('id, appointment_date, appointment_time, status, services(name), instructors(name)')
    .eq('status', 'booked')
    .order('appointment_date', { ascending: true });

  if (error) {
    ui.appointmentsList.innerHTML = `<li class="notice error">${error.message}</li>`;
    return;
  }

  if (!data.length) {
    ui.appointmentsList.innerHTML = '<li class="small">Ainda não existem aulas marcadas.</li>';
    return;
  }

  ui.appointmentsList.innerHTML = data.map((item) => `
    <li class="card">
      <strong>${item.services.name}</strong> com ${item.instructors.name}<br>
      ${item.appointment_date} às ${String(item.appointment_time).slice(0,5)}
      <div style="margin-top:0.6rem;">
        <button class="btn btn-secondary" data-cancel="${item.id}">Cancelar</button>
      </div>
    </li>
  `).join('');
}

async function createAppointment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const { data: { session } } = await client.auth.getSession();
  const payload = {
    user_id: session?.user?.id,
    service_id: form.service_id.value,
    instructor_id: form.instructor_id.value,
    appointment_date: form.appointment_date.value,
    appointment_time: form.appointment_time.value,
    notes: form.notes.value || null
  };

  const { error } = await client.from('appointments').insert(payload);
  ui.bookingMsg.innerHTML = error
    ? `<div class="notice error">${error.message}</div>`
    : '<div class="notice success">Marcação confirmada! Vai receber confirmação por e-mail via automação da Supabase.</div>';

  if (!error) {
    form.reset();
    await loadAppointments();
  }
}

async function cancelAppointment(id) {
  const { error } = await client
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);

  ui.bookingMsg.innerHTML = error
    ? `<div class="notice error">${error.message}</div>`
    : '<div class="notice success">Aula cancelada com sucesso.</div>';

  if (!error) await loadAppointments();
}

async function populateOptions() {
  const [servicesRes, instructorsRes] = await Promise.all([
    client.from('services').select('id,name').eq('active', true),
    client.from('instructors').select('id,name').eq('active', true)
  ]);

  const serviceSelect = document.getElementById('service_id');
  const instructorSelect = document.getElementById('instructor_id');

  if (servicesRes.data) {
    serviceSelect.innerHTML += servicesRes.data.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
  }
  if (instructorsRes.data) {
    instructorSelect.innerHTML += instructorsRes.data.map((i) => `<option value="${i.id}">${i.name}</option>`).join('');
  }
}

async function updateSessionUI() {
  const { data: { session } } = await client.auth.getSession();

  if (!session) {
    ui.authPanel.classList.remove('hidden');
    ui.dashboard.classList.add('hidden');
    return;
  }

  ui.userEmail.textContent = session.user.email;
  ui.authPanel.classList.add('hidden');
  ui.dashboard.classList.remove('hidden');
  await populateOptions();
  await loadAppointments();
}

document.getElementById('signup-form')?.addEventListener('submit', signUp);
document.getElementById('signin-form')?.addEventListener('submit', signIn);
document.getElementById('reset-form')?.addEventListener('submit', resetPassword);
document.getElementById('booking-form')?.addEventListener('submit', createAppointment);
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await client.auth.signOut();
  location.reload();
});

document.getElementById('appointments-list')?.addEventListener('click', (event) => {
  const id = event.target.dataset.cancel;
  if (id) cancelAppointment(id);
});

client.auth.onAuthStateChange(() => updateSessionUI());
updateSessionUI();
