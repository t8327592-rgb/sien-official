const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  // ユーザーが旧サイトで使っていたパスワードをそのまま初期パスワードとして設定
  const password = 'xR3%wK#U&x6v';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: email,
        password: hashedPassword
      }
    });
    console.log(`Created admin user: ${email} / (Your old password)`);
  } else {
    // 存在する場合はパスワードを上書き（念のため）
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log(`Updated admin user password for: ${email}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
