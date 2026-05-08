console.log(require('fs').existsSync('.env'));
if (require('fs').existsSync('.env')) console.log(require('fs').readFileSync('.env', 'utf8'));
