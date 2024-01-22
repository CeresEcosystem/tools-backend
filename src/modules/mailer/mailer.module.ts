// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { MailerModule as Mailer } from '@nestjs-modules/mailer';
// import { MailerController } from './mailer.controller';

// @Module({
//   imports: [
//     ConfigModule.forRoot(),
//     Mailer.forRoot({
//       transport: {
//         host: 'smtp.office365.com',
//         port: 587,
//         secure: false,
//         auth: {
//           user: process.env.EMAIL_FROM_USER,
//           pass: process.env.EMAIL_FROM_PASS,
//         },
//         requireTLS: true,
//         tls: {
//           ciphers: 'SSLv3',
//         },
//         debug: Boolean(process.env.LOG_DEBUG),
//         logger: true,
//       },
//       defaults: {
//         from: `"Support CBS" <${process.env.EMAIL_FROM_USER}>`,
//         to: process.env.EMAIL_TO,
//         subject: 'Contact us form notification',
//       },
//     }),
//   ],
//   controllers: [MailerController],
//   providers: [],
//   exports: [],
// })
// export class MailerModule {}
