const { execSync } = require('child_process');
try {
  execSync('npx prisma validate', { stdio: 'pipe', env: { ...process.env, DATABASE_URL: 'postgresql://a:b@localhost:5432/db' } });
  console.log("Success");
} catch (e) {
  console.log("STDOUT:", e.stdout.toString());
  console.log("STDERR:", e.stderr.toString());
}
