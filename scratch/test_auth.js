fetch('http://localhost:3000/api/auth/session')
  .then(res => res.text().then(text => console.log('Status:', res.status, 'Body:', text.slice(0, 100))))
  .catch(err => console.error(err));
