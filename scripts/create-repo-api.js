// Скрипт для создания репозитория на GitHub через API
// Использование: node scripts/create-repo-api.js

const https = require('https');

const username = 'vardan84';
const repoName = 'sayt';
const description = 'Modern Marketplace Platform with Next.js 16, React 19, TypeScript';
const isPrivate = false;

// Токен можно передать через переменную окружения GITHUB_TOKEN
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.log('❌ GitHub токен не найден!');
  console.log('');
  console.log('Создайте Personal Access Token:');
  console.log('1. Откройте: https://github.com/settings/tokens');
  console.log('2. Нажмите "Generate new token (classic)"');
  console.log('3. Выберите права: repo (все)');
  console.log('4. Скопируйте токен');
  console.log('');
  console.log('Затем выполните:');
  console.log(`$env:GITHUB_TOKEN="your_token_here"; node scripts/create-repo-api.js`);
  process.exit(1);
}

const data = JSON.stringify({
  name: repoName,
  description: description,
  private: isPrivate,
  auto_init: false // НЕ создавать README, у нас уже есть код
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/user/repos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': `token ${token}`,
    'User-Agent': 'Node.js'
  }
};

console.log('🚀 Создание репозитория на GitHub...');
console.log(`   Имя: ${repoName}`);
console.log(`   Владелец: ${username}`);
console.log('');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const repo = JSON.parse(responseData);
      console.log('✅ Репозиторий успешно создан!');
      console.log('');
      console.log(`🌐 URL: ${repo.html_url}`);
      console.log(`📦 Clone URL: ${repo.clone_url}`);
      console.log('');
      console.log('📤 Теперь выполните push:');
      console.log('   git push -u origin main');
    } else if (res.statusCode === 422) {
      const error = JSON.parse(responseData);
      if (error.message && error.message.includes('already exists')) {
        console.log('✅ Репозиторий уже существует!');
        console.log(`🌐 URL: https://github.com/${username}/${repoName}`);
        console.log('');
        console.log('📤 Выполните push:');
        console.log('   git push -u origin main');
      } else {
        console.log('❌ Ошибка создания репозитория:');
        console.log(JSON.stringify(error, null, 2));
      }
    } else {
      console.log(`❌ Ошибка: ${res.statusCode}`);
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Ошибка запроса:', error.message);
});

req.write(data);
req.end();

