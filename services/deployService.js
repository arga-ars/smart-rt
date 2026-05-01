const { exec } = require("child_process");

function runDeploy() {
  return new Promise((resolve, reject) => {
    const command = `
      cd ~/apps/smart-rt &&
      git pull origin main &&
      npm install &&
      pm2 reload all
    `;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Exec error:", err);
        return reject(stderr || err.message);
      }

      console.log("✅ Deploy output:\n", stdout);
      resolve(stdout);
    });
  });
}

module.exports = {
  runDeploy,
};