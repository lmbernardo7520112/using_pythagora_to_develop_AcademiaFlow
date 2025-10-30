(async () => {
  const bcrypt = await import('bcrypt');
  const password = '123456'; // Substitua pela senha desejada
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Hash gerado:', hash);
})();
